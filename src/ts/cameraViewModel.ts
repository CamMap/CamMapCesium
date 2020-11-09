import * as Cesium from "cesium_source/Cesium";

class CameraViewModel {

    private cesiumRoot;
    
    private cameraPlaceholder: Cesium.Entity;

    private cameraData = {
        lat: 55.873704,
        lng: -4.291606,
        height: 30.0,
        heading: 0,
        tilt: 0,
        fov_h: 73.7,
        fov_v: 53.1,
    };

    constructor(cesiumRoot: Cesium.Viewer) {
        this.cesiumRoot = cesiumRoot;

        this.cameraPlaceholder = cesiumRoot.entities.add({
            name: "Camera icon",
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
        // TODO
    }

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

    setHeight(height: number): void {
        this.cameraData.height = height;
        this.rerender();
    }

    setHeading(heading: number): void {
        this.cameraData.heading = heading;
        this.rerender();
    }

    setTilt(tilt: number): void {
        this.cameraData.tilt = tilt;
        this.rerender();
    }

    setFovHor(fov_h: number): void {
        this.cameraData.fov_h = fov_h;
        this.rerender();
    }

    setFovVer(fov_v: number): void {
        this.cameraData.fov_v = fov_v;
        this.rerender();
    }

    /** 
     * @returns the height of the camera
    */
    public get height(): number {
        return this.cameraData.height;
    }

    /** 
     * @returns the heading of the camera
    */
    public get heading(): number {
        return this.cameraData.heading;
    }

    /** 
     * @returns the tilt of the camera
    */
    public get tilt(): number {
        return this.cameraData.tilt;
    }

    /** 
     * @returns the Horizontal FOV of the camera
    */
    public get fov_hor(): number {
        return this.cameraData.fov_h;
    }

    /** 
     * @returns the Vertical FOV of the camera
    */
    public get fov_ver(): number {
        return this.cameraData.fov_v;
    }
}

export default CameraViewModel;