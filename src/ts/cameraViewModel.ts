import * as Cesium from "cesium_source/Cesium";

/**
 * Draws 4 simple points on the map given the required fileds (Coords, height, heading, tilt, FOV)
 */
class CameraViewModel {

    private cesiumRoot;
    
    private cameraPlaceholder: Cesium.Entity;
    private dotsPlaceholder: Array<Cesium.Entity> = [];

    private cameraData = {
        lat: 55.873704,
        lng: -4.291606,
        height: 30.0,
        heading: 0,
        tilt: 60,
        fov_h: 90,
        fov_v: 20,
    };
    private dots = [[0,0],[0,1],[1,0],[1,1]];

    /**
     * Constructs a CameraviewModel object
     * @param cesiumRoot The cesium viewer to be used (should this be scene)
     */
    constructor(cesiumRoot: Cesium.Viewer) {
        this.cesiumRoot = cesiumRoot;

        this.cameraPlaceholder = cesiumRoot.entities.add({
            name: "Camera Placeholder",
            ellipsoid: {
                radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
            },
        });
        this.rerender();
    }

    rerender(): void {
        const cameraPos = Cesium.Cartesian3.fromDegrees(this.cameraData.lng, this.cameraData.lat, this.cameraData.height);

        this.cameraPlaceholder.position = new Cesium.ConstantPositionProperty(cameraPos);
        
        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            if (this.dotsPlaceholder.length > i) {
                this.drawDot(dot[0], dot[1], cameraPos, this.dotsPlaceholder[i]);
            } else {
                this.dotsPlaceholder.push(this.drawDot(dot[0], dot[1], cameraPos));
            }
        }
    }

    /**
     * Set the latitude and longitude coordinates 
     * @param lat The latitude 
     * @param lng The longitude
     */
    setLatLng(lat: number, lng: number): void {
        this.cameraData.lat = lat;
        this.cameraData.lng = lng;
        this.rerender();
    }
    
    /**
     * Sets the camera view to the stored values in the cameraData struct 
     */
    setCamera(): void {
        this.cesiumRoot.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(this.cameraData.lng, this.cameraData.lat , 3),
            orientation: {
                heading: Cesium.Math.toRadians(this.cameraData.heading),
                pitch: Cesium.Math.toRadians(0.0),
            }
        });
    }

    /**
     * Sets the height of the CameraViewModel object 
     */
    public set height(height: number) {
        this.cameraData.height = height;
        this.rerender();
    }

    /** 
     * @returns the height of the camera
    */
    public get height(): number {
        return this.cameraData.height;
    }

    /**
     *  Sets the heading of the CameraViewModel object
     */
    public set heading(heading: number) {
        this.cameraData.heading = heading;
        this.rerender();
    }

    /** 
     * @returns the heading of the camera
    */
    public get heading(): number {
        return this.cameraData.heading;
    }

    /**
     *  Sets the tilt of the CameraViewModel object
     */
    public set tilt(tilt: number) {
        this.cameraData.tilt = tilt;
        this.rerender();
    }


    /** 
     * @returns the tilt of the camera
    */
    public get tilt(): number {
        return this.cameraData.tilt;
    }

    /**
     *  Sets the horizontal FOV of the CameraViewModel object
     */
    public set fovHor(fov_h: number) {
        this.cameraData.fov_h = fov_h;
        this.rerender();
    }

    /** 
     * @returns the Horizontal FOV of the camera
    */
    public get fovHor(): number {
        return this.cameraData.fov_h;
    }

    /**
     *  Sets the vertical FOV of the CameraViewModel object
     */
    public set fovVer(fov_v: number) {
        this.cameraData.fov_v = fov_v;
        this.rerender();
    }

    /** 
     * @returns the Vertical FOV of the camera
    */
    public get fovVer(): number {
        return this.cameraData.fov_v;
    }
    
    /**
     *  Draws a point on the map from image click.  
     * @param imgPosX - percentage of x coord where image was clicked positing in % (0.0-1.0)
     * @param imgPosY - percentage of y coord where image was clicked positing in % (0.0-1.0)
     */
    addDot(imgPosX: number, imgPosY: number): void {
        this.dots.push([imgPosX, imgPosY]);
        this.rerender();
    }
    
    /**
     * Adds a point to the map using the current data that is stored in cameraData struct
     * For Alex: Doc Function and add missing param comments
     * @param imgPosX ??
     * @param imgPosY ??
     * @param camerapos Current camera position
     * @param oldPlaceholder placeholder entity to update (optional)
     */
    private drawDot(imgPosX: number, imgPosY: number, camerapos: Cesium.Cartesian3, oldPlaceholder?: Cesium.Entity): Cesium.Entity {
        const headingDelta = (imgPosX-0.5) * this.cameraData.fov_h;
        const tiltDelta = (imgPosY-0.5) * this.cameraData.fov_v;
        let dotHeading = this.cameraData.heading + headingDelta;
        const dotTilt = this.cameraData.tilt + tiltDelta;

        const distanceAlongGroundInMeters = Math.tan(Cesium.Math.toRadians(dotTilt)) * this.cameraData.height;

        if (dotTilt < 0 || dotTilt > 180) {
            dotHeading -= 180;
        }

        const rhumbLine = Cesium.EllipsoidRhumbLine.fromStartHeadingDistance(Cesium.Cartographic.fromDegrees(this.cameraData.lng, this.cameraData.lat), Cesium.Math.toRadians(dotHeading), Math.abs(distanceAlongGroundInMeters));
        const rhumbLineEnd = rhumbLine.end;

        if (dotTilt >= 90) {
            rhumbLineEnd.height = this.cameraData.height*2;
        }

        const dot = Cesium.Cartographic.toCartesian(rhumbLineEnd);

        //This was a oneliner, but i was getting constant errors from linter
        if (oldPlaceholder && oldPlaceholder.polyline) {
            oldPlaceholder.polyline.positions = new Cesium.PositionPropertyArray([
                new Cesium.ConstantPositionProperty(camerapos),
                new Cesium.ConstantPositionProperty(dot)
            ]);
            return oldPlaceholder;
        }
        //cast to polyline
        return this.cesiumRoot.entities.add({
            polyline: {
                positions: [camerapos, dot],
                width: 5,
                material: Cesium.Color.RED
            }
        });
    }

}

export default CameraViewModel;