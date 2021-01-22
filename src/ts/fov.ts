/**
 * Functions for drawing a Field of View
 *
 * @packageDocumentation
 */

import * as Cesium from "cesium_source/Cesium";
import { Cartesian2, Cartesian3, HeadingPitchRoll, Matrix3, PerspectiveFrustum } from "cesium_source/Cesium";
import { FOVLogger } from "./logger";
import { VGIPReciever } from "./vgipReciever";
import { VideoGeoData } from "./vgip";


/**
 * A wrapper around cesium camera.
 */
export class FOV {
    private _position: Cesium.Cartesian3;
    private camera: Cesium.Camera;
    private cameraUp: Cesium.Cartesian3;
    private cameraDirection: Cesium.Cartesian3;
    private long: number;
    private lat: number;
    private _elevation: number;
    private theta: number;
    private phi: number;
    private _roll: number;
    //Public viewer: Cesium.Viewer;
    public scene: Cesium.Scene;
    private fov: number;
    private camPoly: Cesium.PrimitiveCollection;
    private terrainScanningGeometryPrimitive: Cesium.PrimitiveCollection;
    private _distance: number;
    private terrainScanningResolution;

    /** Should lines be drawn at the corners of the screen */
    private shouldDrawEdgeLines: boolean;
    private linesToPoints: Cesium.PolylineCollection;
    private pointsToEdges: Cesium.PointPrimitiveCollection;
    private pointsAdded: Cesium.PointPrimitiveCollection;

    private curDrawn: Cesium.Primitive | null;

    private posFns: { (val: number): void; }[];
    private headingFns: { (val: number): void; }[];
    private tiltFns: { (val: number): void; }[];
    private rollFns: { (val: number): void; }[];
    private fovFns: { (val: number): void; }[];
    private aspectRatioFns: { (val: number): void; }[];
    private distFns: { (val: number): void; }[];

    // TODO, shuold there be a seperate wrapper class for something like this?
    // So as FOV is not dependent on vgip reciever.
    // There should, do this with the setUpListeners functions
    private vgipReciever: VGIPReciever;

    // Should only the rectangular simlple FOV be shown
    public shouldDisplayBorderFOV: boolean;

    // Should terrain scanning be used
    public shouldUseTerrainScanning: boolean;

    // Should an outline be shown for each plane on the terrain scanning camera
    public shouldDisplayInnerOutline:boolean;

    // If terrain scanning should not be used, should the Earth boundry, i.e a sphere be used for collision detection
    // Or should the terrain be taken into consideration
    // If clipping is on, the can be left off as this and clipping are equivilant
    private shouldUseEarthBoundry: boolean;

    /* Getters & Setters */

    /**
     * @param pos - Set the position of the camera
     */
    public set position(pos: Cesium.Cartesian3){
        this.camera.position = pos;

        const cartoPos = Cesium.Cartographic.fromCartesian(pos);
        this.lat = Cesium.Math.toDegrees(cartoPos.latitude);
        this.long = Cesium.Math.toDegrees(cartoPos.longitude);
        this._elevation = Cesium.Math.toDegrees(cartoPos.height);

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();
    }

    /** @returns The position of the camera */
    public get position(): Cesium.Cartesian3{
        return this.camera.position;
    }

    /**
     * Set the distance to the far plane of the camera
     */
    public set distance(dist: number){
        this._distance = dist;
        this.camera.frustum.far = dist;

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();
        // Call event listeners
        for(const fn of this.distFns){
            fn(this._distance);
        }
    }

    /**
     * @returns The distance to the far plane of the camera
     */
    public get distance(): number{
        return this._distance;
    }

    /** Set the elevation of the camera, in meters */
    public set elevation(ele: number){
        const posCarto = this.camera.positionCartographic;
        posCarto.height = ele;
        this.camera.position = Cesium.Cartographic.toCartesian(posCarto);

        this._elevation = ele;

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.posFns){
            fn(this.elevation);
        }
    }

    /** @returns The elevation of the camera, in meters */
    public get elevation(): number{
        return this._elevation;
    }

    /** Set the latitude of the camera, in degrees */
    public set latitude(lat: number){
        const posCarto = this.camera.positionCartographic;
        posCarto.latitude = Cesium.Math.toRadians(lat);
        this.camera.position = Cesium.Cartographic.toCartesian(posCarto);

        this.lat = lat;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();
    }

    /** @returns The latitude of the camera, in degrees */
    public get latitude(): number{
        return this.lat;
    }

    /** Set the latitude of the camera, in degrees */
    public set longitude(long: number){
        const posCarto = this.camera.positionCartographic;
        posCarto.longitude = Cesium.Math.toRadians(long);
        this.camera.position = Cesium.Cartographic.toCartesian(posCarto);

        this.long = long;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();
    }

    /** @returns The latitude of the camera, in degrees */
    public get longitude(): number{
        return this.long;
    }

    /**
     * Set the heading of the camera, in radians
     *
     *  @param h - The heading in radians
     */
    public set heading(h: number){
        this.theta = h;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.headingFns){
            fn(this.heading);
        }
    }

    /** @returns The heading of the camera, in radians */
    public get heading(): number{
        return this.theta;
    }

    /**
     * Set the tilt of the camera, in radians
     *
     * @param t - The heading in radians
     */
    public set tilt(t: number){
        this.phi = t;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.tiltFns){
            fn(this.tilt);
        }
    }

    /** @returns The tilt of the camera, in radians */
    public get tilt(): number{
        return this.phi;
    }

    /**
     * @param r - The new roll
     */
    public set roll(r: number){
        this._roll = r;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.rollFns){
            fn(this._roll);
        }
    }

    /**
     * @returns the roll of the camera
     */
    public get roll(): number{
        return this._roll;
    }

    /**
     *  Set the fov of the camera, in radians
     *
     *  @param f - The fov in radians
     */
    public set fovDeg(f: number){
        (this.camera.frustum as PerspectiveFrustum).fov = f;

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.fovFns){
            fn(this.fovDeg);
        }
    }

    /** @returns The fov of the camera, in radians */
    public get fovDeg(): number{
        return (this.camera.frustum as PerspectiveFrustum).fov;
    }

    /**
     *  Set the aspect ratio of the camera
     *
     *  @param ar - The new aspect ratio
     */
    public set aspectRatio(ar: number){
        (this.camera.frustum as PerspectiveFrustum).aspectRatio = ar;

        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
        this.redrawLinesToPoints();
        this.checkPointsVisible();

        // Call event listeners
        for(const fn of this.aspectRatioFns){
            fn(this.aspectRatio);
        }
    }

    /** @returns The aspect ratio of the camera */
    public get aspectRatio(): number{
        return (this.camera.frustum as PerspectiveFrustum).aspectRatio;
    }

    /**
     * Constructs an FOV object, call draw() to draw it in a scene
     *
     * @param scene - The cesium scene to be used (should this be scene)
     * @param lat_long_elevation -  The laditude, longtitude and elevation of the camera position
     * @param fov - The FOV of the camera
     * @param aspectRatio - The aspect ratio of the camera
     * @param theta - The bearing of the camera
     * @param phi - The tilt of the camera
     * @param roll - The roll of the camera
     * @param near - The near plane distance of the camera
     * @param far - The far plane distance of the camera
     */
    constructor(
        scene: Cesium.Scene, [long, lat, elevation]: [number, number, number], fov: number, aspectRatio: number, theta: number, phi: number, roll: number, near: number, far: number
    ) {
        const DEFAULT_TERRAIN_RESOLTION = 5;
        this.terrainScanningResolution = DEFAULT_TERRAIN_RESOLTION;

        this._position = Cesium.Cartesian3.fromDegrees(long, lat, elevation);
        this.scene = scene;
        this.long = long;
        this.lat = lat;
        this._elevation = elevation;
        this.theta = Cesium.Math.toRadians(theta);
        this.phi = Cesium.Math.toRadians(phi);
        this._roll = Cesium.Math.toRadians(roll);
        this.fov = Cesium.Math.toRadians(fov);
        this.curDrawn = null;
        this.camPoly = this.scene.primitives.add(new Cesium.PrimitiveCollection());
        this.terrainScanningGeometryPrimitive = this.scene.primitives.add(new Cesium.PrimitiveCollection());
        this._distance = far;

        this.linesToPoints = new Cesium.PolylineCollection();
        this.pointsToEdges = new Cesium.PointPrimitiveCollection();
        this.pointsAdded = new Cesium.PointPrimitiveCollection();
        this.scene.primitives.add(this.pointsToEdges);
        this.scene.primitives.add(this.pointsAdded);
        this.scene.primitives.add(this.linesToPoints);
        this.shouldDrawEdgeLines = false;

        this.posFns = [];
        this.headingFns = [];
        this.tiltFns = [];
        this.rollFns = [];
        this.fovFns = [];
        this.aspectRatioFns = [];
        this.distFns = [];

        this.vgipReciever = new VGIPReciever();

        // Don't do terrain scanning by default, it is a relativly intensive process
        // And so need a good computer to support it well
        // Will just show the rectangular camera (by default)
        this.shouldUseTerrainScanning = false;
        this.shouldDisplayInnerOutline = false;
        this.shouldDisplayBorderFOV = true;
        this.shouldUseEarthBoundry = false;

        this.camera = new Cesium.Camera(scene);
        const frustum = new Cesium.PerspectiveFrustum({
            fov: this.fov,
            aspectRatio: aspectRatio,
            near: near,
            far: far,
        });

        const [, yAxisNew, zAxisNew] = this.getSurfaceTransform(long, lat, elevation);

        const rotationMatrix = this.getSurfaceRotationMatrix(
            long, lat, elevation, this.theta, this.phi - Cesium.Math.PI_OVER_TWO, this._roll
        );
        this.camera.frustum = frustum;
        this.camera.position = Cesium.Cartesian3.fromDegrees(long, lat, elevation);
        this.camera.up = Cesium.Cartesian3.clone(zAxisNew);
        this.camera.right = Cesium.Cartesian3.clone(yAxisNew);
        //
        const xOnNewAxis = Cartesian3.clone(Cartesian3.ZERO);
        Cesium.Matrix3.multiplyByVector(rotationMatrix, Cesium.Cartesian3.UNIT_X, xOnNewAxis);
        this.camera.direction = xOnNewAxis;


        this.cameraUp = this.camera.up;
        this.cameraDirection = this.camera.direction;

        this.camera.setView({
            orientation: {
                heading : this.theta,
                pitch : this.phi,
                roll : this._roll + Cesium.Math.PI_OVER_TWO,
            },
        });
        this.scene.primitives.remove(this.curDrawn);
        this.draw(this.scene);
        this.redrawLinesToEdges();
    }

    /**
     * Set up a websocket to recieve geolocation data and dynamically modify the camera based on it
     *
     * @param address - The URL of the websocket which serves the geodata
     */
    public setUpVGIPWebSocket(address: string): void{
        this.vgipReciever.addWebSocketWithAddress(address);
        this.vgipReciever.onRecieveData((geoData: VideoGeoData) => {
            // Modify the lat, long, heading ... depending on what was recieved

            if(geoData.latitude != null && geoData.latitude != undefined){
                this.latitude = geoData.latitude;
            }

            if(geoData.longitude != null && geoData.longitude != undefined){
                this.longitude = geoData.longitude;
            }

            if(geoData.bearing != null && geoData.bearing != undefined){
                this.heading = geoData.bearing;
            }

            if(geoData.tilt != null && geoData.tilt != undefined){
                this.tilt = geoData.tilt;
            }

            if(geoData.heading != null && geoData.heading != undefined){
                this.roll = geoData.heading;
            }
        });
    }

    /**
     * Draw a FOV in a cesium scene
     *
     * @param scene - The cesium scene in which the object should be drawn
     */
    private draw(scene: Cesium.Scene): void {
        if(this.shouldDisplayBorderFOV){
            const rotationMatrix = this.getSurfaceRotationMatrix(
                this.long, this.lat, this._elevation, this.theta, this.phi, this._roll
            );

            const geom: Cesium.Geometry | undefined = Cesium.FrustumGeometry.createGeometry(new Cesium.FrustumGeometry({
                frustum: this.camera.frustum as Cesium.PerspectiveFrustum,
                origin: Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation),
                orientation: Cesium.Quaternion.fromRotationMatrix(rotationMatrix),
            }));

            if(geom !== undefined) {
                const instance = new Cesium.GeometryInstance({
                    geometry: geom,
                });

                const material = Cesium.Material.fromType("Color");
                const alpha = 0.5;
                material.uniforms.color = Cesium.Color.ORANGE.withAlpha(alpha);

                this.curDrawn = scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: instance,
                    appearance: new Cesium.MaterialAppearance({
                        material: material,
                    }),
                    asynchronous: false,
                })) as Cesium.Primitive;
            }
        }
    }

    /**
     * Set if the edge lines should be drawn
     *
     * @param b - Set if the edge lines of the camera should be drawn
     */
    public setShouldDrawEdgeLines(b: boolean): void{
        this.shouldDrawEdgeLines = b;
    }

    /**
     * Draw lines to the edges of the camera
     */
    private redrawLinesToEdges(): void{
        //First remove the lines ot the edges
        this.removeLinesToEdges();

        // Draw line to Top Right, Top Left
        this.drawLineFromPercentToScreen(
            this.scene,
            new Cesium.Cartesian2(0.0, 0.0),
            this.scene.globe.ellipsoid,
            true
        );


        // Draw line to Bottom Right, Top Left
        this.drawLineFromPercentToScreen(
            this.scene,
            new Cesium.Cartesian2(1.0, 0.0),
            this.scene.globe.ellipsoid,
            true
        );


        // Draw line to Top Right, Bottom Left
        this.drawLineFromPercentToScreen(
            this.scene,
            new Cesium.Cartesian2(0.0, 1.0),
            this.scene.globe.ellipsoid,
            true
        );


        // Draw line to Bottom Right, Bottom Left
        this.drawLineFromPercentToScreen(
            this.scene,
            new Cesium.Cartesian2(1.0, 1.0),
            this.scene.globe.ellipsoid,
            true
        );
        //This.drawCamPolygon();
        if(!this.shouldDisplayBorderFOV){
            // Only draw this if the rectangle FOV is not being drawn
            // Could draw both in the future, but currently both are the same color so it doesn't look very good
            this.mapScanningPointsToTerrain(this.terrainScanningResolution);
        }
    }

    /**
     *
     */
    private redrawLinesToPoints(): void{
        const numLines = this.linesToPoints.length;
        for(let i = 0; i < numLines; i++){
            const pointPos = this.linesToPoints.get(i).positions[1];
            this.linesToPoints.get(i).positions = [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), pointPos];
        }
    }

    /**
     *
     */
    private removeLinesToEdges(): void{
        this.terrainScanningGeometryPrimitive.removeAll();
        this.camPoly.removeAll();
        this.pointsToEdges.removeAll();
    }

    /**
     * Destroys the view object so it is no longer present in the scene
     */
    private destroy(): void {
        if(this.curDrawn !== null) this.curDrawn.destroy();
    }

    /**
     * Calculate the rotation matrix to align the object to the surface of a sphere
     *
     * @param long - The longditude of the position on the sphere
     * @param lat - The latitude of the position on the sphere
     * @param elevation - The elevation of the position on the sphere
     * @param theta - the bearing of the camera
     * @param phi - the tilt of the camera
     * @param roll - the roll of the camera
     * @returns The rotation matrix to put the obect on the surface of a sphere
     */
    public getSurfaceRotationMatrix(
        long: number, lat: number, elevation: number, theta: number, phi: number, roll: number
    ): Matrix3 {
        const [xAxisNew, yAxisNew, zAxisNew] = this.getSurfaceTransform(lat, long, elevation);

        const rotationMatrix = new Matrix3(
            xAxisNew.x, yAxisNew.x, zAxisNew.x,
            xAxisNew.y, yAxisNew.y, zAxisNew.y,
            xAxisNew.z, yAxisNew.z, zAxisNew.z,
        );

        const rotMatrix = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(theta - Cesium.Math.PI_OVER_TWO, -phi + Cesium.Math.PI_OVER_TWO, 0));
        Matrix3.multiply(rotationMatrix, rotMatrix, rotationMatrix);

        const rollMatrix = Matrix3.fromRotationZ(roll);
        Matrix3.multiply(rotationMatrix, rollMatrix, rotationMatrix);

        return rotationMatrix;
    }

    /**
     * Get the plane tangent to the sphere, where the x axis is tangent to
     * the latitude axis, the y axis is tangent to the longditude and
     * the z axis is pointing directly up towards space.
     *
     * @param long - The longditude of the position on the sphere
     * @param lat - The latitude of the position on the sphere
     * @param elevation - The elevation of the position on the sphere
     * @returns The new [x axis, y axis, z axis] normalized vectors
     */
    public getSurfaceTransform(long: number, lat: number, elevation: number): [Cartesian3, Cartesian3, Cartesian3] {
        // The point in cartesian coordinates
        const cartesianPoint = Cartesian3.fromDegrees(lat, long, elevation);
        const smallChange = 0.0001;

        // The theta and phi gradients are lines tangent to the theta and phi axis in the spherical coordinates, in the standard basis cartisean coordinate system
        const thetaGrad: Cartesian3 = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(cartesianPoint, Cartesian3.fromDegrees(lat + smallChange, long, elevation), thetaGrad);

        const phiGrad = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(cartesianPoint, Cartesian3.fromDegrees(lat, long + smallChange, elevation), phiGrad);

        /*
         * Create a new axis where the x basis vector is pointing tangent to the theta axis
         * And y basis vector is pointing tangent to the phi axis
         */
        const xAxisNew = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(thetaGrad, xAxisNew);

        const yAxisNew = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(phiGrad, yAxisNew);

        // The new z axis is simply pointing away from the Earth
        const zAxisNew = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(cartesianPoint, zAxisNew);

        return [xAxisNew, yAxisNew, zAxisNew];
    }

    /**
     * Draw a debug camera, usful for determining if the FOV Frustrum and Camera have comes
     * out of sync
     *
     * @param scene - The scene in which to draw the debug camera
     */
    public drawDebugCamera(scene: Cesium.Scene): void {
        scene.primitives.add(new Cesium.DebugCameraPrimitive({
            camera: this.camera,
            color: Cesium.Color.YELLOW,
            show: true,
        }));
    }

    /**
     * Sets up the event listeners for the position of the camera
     *
     * @param positionEv - The HTML input event to change the position
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpPosListener(positionEv: HTMLInputElement): void{
        positionEv.oninput = e => {
            this.elevation = Number((e.target as HTMLInputElement).value);
            FOVLogger.debug("Updated Elevation");
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the position is changed, val is the new position
     */
    public onPosChanged(fun: (val: number) => void): void{
        this.posFns.push(fun);
    }

    /**
     * Sets up the event listeners for the heading of the camera
     *
     * @param headingEv - The HTML input event to change the position
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpHeadingListener(headingEv: HTMLInputElement): void{
        headingEv.oninput = e => {
            this.heading = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated Heading");
        };
    }

    /**
     * Run a function when the heading has changed
     *
     * @param fun - function to run when the heading has changed, val is the new heading
     */
    public onHeadingChanged(fun: (val: number) => void): void{
        this.headingFns.push(fun);
    }

    /**
     * Sets up the event listeners for the tilt of the camera
     *
     * @param tiltEv - The HTML input event to change the tilt
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpTiltListener(tiltEv: HTMLInputElement): void{
        tiltEv.oninput = e => {
            this.tilt = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated Tilt");
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the tilt is changed, val is the new tilt
     */
    public onTiltChanged(fun: (val: number) => void): void{
        this.tiltFns.push(fun);
    }

    /**
     * Sets up the event listeners for the roll of the camera
     *
     * @param rollEv - The HTML input event to change the roll
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpRollListener(rollEv: HTMLInputElement): void{
        rollEv.oninput = e => {
            this.roll = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated Roll");
        };
    }

    /**
     * Run a function when the roll is changed
     *
     * @param fun - function to run when the roll is changed, val is the new roll
     */
    public onRollChanged(fun: (val: number) => void): void{
        this.rollFns.push(fun);
    }

    /**
     * Sets up the event listeners for the tilt of the camera
     *
     * @param fovEv - The HTML input event to change the fov
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpFOVListener(fovEv: HTMLInputElement): void{
        fovEv.oninput = e => {
            this.fovDeg = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated FOV");
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the fov is changed, val is the new fov
     */
    public onFOVChanged(fun: (val: number) => void): void{
        this.fovFns.push(fun);
    }

    /**
     * Sets up the event listeners for the distance of the camera
     *
     * @param distEv - The HTML input event to change the camera far distance
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpDistanceListener(distEv: HTMLInputElement): void{
        distEv.oninput = e => {
            this.distance = Number((e.target as HTMLInputElement).value);
            FOVLogger.debug("Updated distance");
        };
    }

    /**
     * Run a function when the distance is changed
     *
     * @param fun - function to run when the distance is changed, val is the new distance
     */
    public onDistanceChanged(fun: (val: number) => void): void{
        this.distFns.push(fun);
    }

    /**
     * Sets up the event listeners for the aspect ratio of the camera
     *
     * @param arEv - The HTML input event to change the aspect ratio
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    public setUpAspectRatioListener(arEv: HTMLInputElement): void{
        arEv.oninput = e => {
            this.aspectRatio = Number((e.target as HTMLInputElement).value);
            FOVLogger.debug("Updated Aspect Ratio");
        };
    }

    /**
     * Run a function when the aspect ratio is changed
     *
     * @param fun - function to run when the aspect ratio is changed, val is the new aspect ratio
     */
    public onAspectRatioChanged(fun: (val: number) => void): void{
        this.aspectRatioFns.push(fun);
    }

    /**
     * This is only an approximation rectangle from cesium, using a polygon would usually be more accurate
     *
     * @param ellipsoid - The ellipsoid onto which to project the rectangle
     * @returns the rectangle of what the camera can see projected onto the Earth
     */
    public getCameraRect(ellipsoid: Cesium.Ellipsoid): Cesium.Rectangle | undefined {
        return this.camera.computeViewRectangle(ellipsoid);
    }

    /**
     * Draws a line from the a pixel on the camera screen to the point that pixel maps to
     * on an ellipsoid
     *
     * @param scene - The cesium scene
     * @param pixel - The pixel coordinate on the camera screen
     * @param ellipsoid - The ellopsoid the point should map to
     * @param frustrum - If the line/point is part of the frustum or not
     * @returns The line and point drawn to the sphere
     */
    public drawLineFromPixelToScreen(
        scene: Cesium.Scene, pixel: Cartesian2, ellipsoid: Cesium.Ellipsoid, frustrum: boolean
    ): boolean | null {
        let pointOnSphere = undefined;
        if(frustrum == true){
            pointOnSphere = this.camera.pickEllipsoid(pixel, ellipsoid);
        } else {
            const cameraRay = this.camera.getPickRay(pixel);
            pointOnSphere = scene.globe.pick(cameraRay, scene);
        }

        const alpha = 0.9;
        const green = 0.5;
        if(pointOnSphere != undefined) {
            // Keep this as a point cloud for now, so we can add more points in the future
            if(frustrum != false){
                this.pointsToEdges.add({
                    position: pointOnSphere,
                    color: Cesium.Color.GREEN,
                    pixelSize: 10,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                });
                this.camPoly.add(new Cesium.Primitive({
                    geometryInstances : new Cesium.GeometryInstance({
                        geometry : new Cesium.PolylineGeometry({
                            positions : [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), pointOnSphere],
                            width : 5.0,
                            arcType: Cesium.ArcType.NONE,
                            vertexFormat : Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
                        }),
                    }),
                    appearance : new Cesium.PolylineMaterialAppearance({
                        material : new Cesium.Material({
                            fabric : {
                                type : "Color",
                                uniforms : {
                                    color : new Cesium.Color(
                                        0, green, 0, alpha
                                    ),
                                },
                            },
                        }),
                    }),
                    asynchronous: false,
                }));
            } else {
                this.pointsAdded.add({
                    position: pointOnSphere,
                    color: Cesium.Color.GREEN,
                    pixelSize: 10,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                });
                this.linesToPoints.add({
                    positions: [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), pointOnSphere],
                    width : 5.0,
                    material : new Cesium.Material({
                        fabric : {
                            type : "Color",
                            uniforms : {
                                color : Cesium.Color.GREEN,
                            },
                        },
                    }),
                });
            }


            //Add lables to points that have been added from the canvas
            if(frustrum == false){
                const ellipsoidGeodesic = new Cesium.EllipsoidGeodesic(Cesium.Cartographic.fromCartesian(this.position, ellipsoid), Cesium.Cartographic.fromCartesian(pointOnSphere, ellipsoid));
                const labels = scene.primitives.add(new Cesium.LabelCollection());
                labels.add({
                    position : pointOnSphere,
                    text : ellipsoidGeodesic.surfaceDistance.toString() + " meters",
                    show: true,
                    showBackground: true,
                    font: "14px monospace",
                });
            }
            return true;
        }
        return null;
    }

    /**
     * Map a point from the camera screen to a sphere point
     *
     * @param pixel - The pixel to on the camera screen
     * @param ellipsoid - The sphere to map the camera screen to
     * @returns The point on the sphere where the ray hits
     */
    public getPointOnSphereFromScreen(pixel: Cartesian2, ellipsoid: Cesium.Ellipsoid): Cartesian3 | undefined {
        return this.camera.pickEllipsoid(pixel, ellipsoid);
    }

    /**
     * Project a ray from the camera to a set distance
     *
     * @param pixelPercent - the camera pixel to project the ray from
     * @returns The cesium ray from the point on the pixel on the screen
     */
    public getRayFromScreen(pixelPercent: Cartesian2): Cesium.Ray {
        const maxHeight = this.scene.canvas.clientHeight;
        const maxWidth = this.scene.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * pixelPercent.x, maxHeight * pixelPercent.y);
        return this.camera.getPickRay(pixel);
    }

    /**
     * Project a ray from the camera position to a set heading/tilt/bearing
     *
     * @param bearing - The bearing from the camera to project the ray
     * @param tilt - The tilt from the camera to project the ray
     * @param heading - The heading from the camera to project the ray
     * @returns The ray with this orientation from the camera position
     */
    public projectRayFromCameraPos(bearing: number, tilt: number, heading:number): Cesium.Ray{
        return new Cesium.Ray(this.position, new Cartesian3(bearing, tilt, heading));
    }

    /**
     * Get a point a set distance away from the camera which goes through a ray of a set pixel
     *
     * @param pixel - The camera pixel to project the ray from
     * @param dist - The distance away from the camera where the point is located
     * @returns The point a set distance away from the camera pointing from a pixel on the screen
     */
    public getPointAtDistFromScreen(pixel: Cartesian2, dist: number): Cesium.Cartesian3 {
        return Cesium.Ray.getPoint(this.getRayFromScreen(pixel), dist);
    }

    /**
     * A convience function to draw a point at a set distance away from the camera on a
     * ray projected through the camera screen
     *
     * @param scene - The cesium scene
     * @param pixel - The camera pixel to project the ray from
     * @param dist - The distance away from the camera where the point is located
     */
    public placePointAtDistFromScreen(scene: Cesium.Scene, pixel: Cartesian2, dist: number): void {
        const point = this.getPointAtDistFromScreen(pixel, dist);


        // Add the polyline
        const lines = scene.primitives.add(new Cesium.PolylineCollection());
        lines.add({
            positions: [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), point],
            width: 10,
            arcType: Cesium.ArcType.NONE,
            material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
        });

        // Now just draw the point
        const points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
        points.add({
            position: point,
            color: Cesium.Color.BLUE,
            pixelSize: 10,
        });
    }

    /**
     * Draws a line from the a percent(0.0 - 1.0) on the camera screen to the point that pixel maps to
     * on an ellipsoid
     *
     * @param scene - The cesium scene
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param ellipsoid - The ellopsoid the point should map to
     * @param frustum - If the line/point is part of the frustum or not
     * @returns The line and point drawn to the sphere
     */
    drawLineFromPercentToScreen(
        scene: Cesium.Scene, percent: Cartesian2, ellipsoid: Cesium.Ellipsoid, frustum = false
    ): boolean | null {
        const maxHeight = scene.canvas.clientHeight;
        const maxWidth = scene.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * percent.x, maxHeight * percent.y);
        return this.drawLineFromPixelToScreen(
            scene, pixel, ellipsoid, frustum
        );
    }

    /**
     * @param scene - The cesium scene
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param ellipsoid - The ellopsoid the point should map to
     * @returns The point on the sphere the pixel on the screen maps to
     */
    getCamPointPercent(scene: Cesium.Scene, percent: Cartesian2, ellipsoid: Cesium.Ellipsoid): Cesium.Cartesian3 | undefined{
        const maxHeight = scene.canvas.clientHeight;
        const maxWidth = scene.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * percent.x, maxHeight * percent.y);
        return this.camera.pickEllipsoid(pixel, ellipsoid);
    }

    /**
     * This is the same as `getCamPointPercent` but uses raycasing
     *
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param ellipsoid - The ellopsoid the point should map to
     * @returns The point on the sphere the pixel on the screen maps to
     */
    public getCamPointPercentRaycasting(percent: Cartesian2, ellipsoid: Cesium.Ellipsoid): Cesium.Cartesian3 | undefined{
        //Get the first intersection point of a ray and an ellipsoid.
        const ray = this.getRayFromScreen(percent);
        const intersection = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
        if(intersection == undefined){
            return undefined;
        }
        const point = Cesium.Ray.getPoint(ray, intersection.start);
        return point;
    }

    /**
     * This is the same as `getCamPointPercent` but uses globe pick
     *
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param globe - The globe the point should map to
     * @returns The point on the sphere the pixel on the screen maps to
     */
    public getCamPointPercentGlobePick(percent: Cartesian2, globe: Cesium.Globe): Cesium.Cartesian3 | undefined{
        //Get the first intersection point of a ray and a globe.
        const ray = this.getRayFromScreen(percent);
        const point = globe.pick(ray, this.scene);
        return point;
    }

    /**
     * Computes the intersection of the view and a bounding box
     *
     * @param boundingVolume - The bounding volume of the object of which to check the intersection
     * @returns The cesium intersect with the object, in essence if the object is within the FOV viewcone
     */
    public checkIntersection(boundingVolume: Cesium.BoundingRectangle | Cesium.BoundingSphere | Cesium.AxisAlignedBoundingBox | Cesium.OrientedBoundingBox): Cesium.Intersect {
        return this.camera.frustum.computeCullingVolume(this.camera.position, this.cameraDirection, this.cameraUp).computeVisibility(boundingVolume);
    }

    private terrainScanningWindowPoints: number[][][] = [];
    private terrainPoints: Cesium.Cartesian3[][] = [];

    /**
     * Take the x and y size of the camera window and split it into rectangles
     * The camera size can be treated as between 0 and 1 in this case.  (Then scale up if nessessary)
     */
    private splitViewWindowIntoRects(){
        const invRes = 1 / this.terrainScanningResolution;
        for(let y = 0; y <= 1; y += invRes){
            this.terrainScanningWindowPoints.push([]);
            for(let x = 0; x <= 1; x += invRes){
                this.terrainScanningWindowPoints[y].push([x, y]);
            }
        }
    }

    /**
     * Get the points on the terrain
     *
     * @param resolution - How many points there should be on the x and y axis
     */
    private getTerrainPoints(resolution: number){
        const TWO = 2;
        this.terrainPoints = [];
        const xDiff = 1 / resolution;
        for(let i = 0; i <= resolution; i += 1){
            this.terrainPoints.push([]);
            const y = xDiff * i;
            for(let j = 0; j <= resolution; j += 1){
                // If using terrain, use the globe pick version, if not, use a much cheaper alternative
                // Which can just use the property of a sphere being a sphere and get the points on its surface
                let p;
                if(this.shouldUseTerrainScanning){
                    p = this.getCamPointPercentGlobePick(new Cartesian2(xDiff * j, y), this.scene.globe);
                } else if(this.shouldUseEarthBoundry) {
                    p = this.getCamPointPercent(this.scene, new Cartesian2(xDiff * j, y), this.scene.globe.ellipsoid);
                } else {
                    p = undefined;
                }

                if(p != undefined && Cartesian3.distanceSquared(p, this.camera.position) < this.distance ** TWO){
                    this.terrainPoints[i].push(p);
                } else {
                    this.terrainPoints[i].push(this.getPointAtDistFromScreen(new Cartesian2(xDiff * j, y), this.distance));
                }
            }
        }
    }

    /**
     * Use pickEllipsoid to map the points to the terrain
     *
     * @param resolution - How many points there should be on the x and y axis
     */
    public mapScanningPointsToTerrain(resolution: number) : void{
        this.getTerrainPoints(resolution);
        const POINT_FIVE = 0.5;

        const material = Cesium.Material.fromType("Color");
        const alpha = POINT_FIVE;
        material.uniforms.color = Cesium.Color.ORANGE.withAlpha(alpha);

        for(let i = 0; i < this.terrainPoints.length - 1; i += 1){
            for(let j = 0; j < this.terrainPoints.length - 1; j += 1){
                this.terrainScanningGeometryPrimitive.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: new Cesium.PolygonGeometry({
                            polygonHierarchy: new Cesium.PolygonHierarchy([
                                this.terrainPoints[i][j],
                                this.terrainPoints[i + 1][j],
                                this.terrainPoints[i + 1][j + 1],
                                this.terrainPoints[i][j + 1],
                            ]),
                            perPositionHeight: true,
                            closeTop:true,
                        }),
                        id: "cam scanning primitive",
                        attributes: {
                            color: new Cesium.ColorGeometryInstanceAttribute(
                                1, 0, 1, POINT_FIVE
                            ),
                        },
                    }),
                    appearance: new Cesium.MaterialAppearance({
                        material: material,
                    }),
                    asynchronous: false,
                }));
            }
        }

        // Now for each edge point, draw a triangle from it to the origin (fill the edges)
        for(let i = 0; i < this.terrainPoints.length - 1; i += 1){
            // For y = 0 and y = max, make a triangle
            this.drawTraingleBetweenPoints(this.terrainPoints[i][0], this.terrainPoints[i + 1][0], this.camera.position);
            this.drawTraingleBetweenPoints(this.terrainPoints[i][this.terrainPoints.length - 1], this.terrainPoints[i + 1][this.terrainPoints.length - 1], this.camera.position);
        }

        for(let j = 0; j < this.terrainPoints.length - 1; j += 1){
            // For x = 0 and x = max, make a triangle
            this.drawTraingleBetweenPoints(this.terrainPoints[0][j], this.terrainPoints[0][j + 1], this.camera.position);
            this.drawTraingleBetweenPoints(this.terrainPoints[this.terrainPoints.length - 1][j], this.terrainPoints[this.terrainPoints.length - 1][j + 1], this.camera.position);
        }
    }

    /**
     * Draw a triangle between 3 points
     *
     * @param p1 - Point 1
     * @param p2 - Point 2
     * @param p3 - Point 3
     */
    private drawTraingleBetweenPoints(p1: Cartesian3, p2: Cartesian3, p3: Cartesian3){
        const POINT_FIVE = 0.5;

        const material = Cesium.Material.fromType("Color");
        const alpha = POINT_FIVE;
        material.uniforms.color = Cesium.Color.ORANGE.withAlpha(alpha);

        this.terrainScanningGeometryPrimitive.add(new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy([
                        p1,
                        p2,
                        p3,
                    ]),
                    perPositionHeight: true,
                    closeTop:true,
                }),
                id: "cam scanning primitive triangles",
                attributes: {
                    color: new Cesium.ColorGeometryInstanceAttribute(
                        1, 0, 1, POINT_FIVE
                    ),
                },
            }),
            appearance: new Cesium.MaterialAppearance({
                material: material,
            }),
            asynchronous: false,
        }));
    }

    /**
     *  Checks if a point is within the FOV object or not
     *
     * @param point - Point to check for intersection with the FOV object
     * @returns The cesium intersect object
     */
    private checkPointIntersects(point : Cesium.PointPrimitive) : Cesium.Intersect{
        const pointPos = point.position;
        const pointWidth = point.pixelSize;
        const boundingVolume = new Cesium.BoundingSphere(pointPos, pointWidth);
        return this.checkIntersection(boundingVolume);
    }

    /**
     * Checks if the points added from the canvas are visible to the camera
     */
    private checkPointsVisible(){
        for(let i = 0; i < this.pointsAdded.length; i++){
            if(this.checkPointIntersects(this.pointsAdded.get(i)) == Cesium.Intersect.INSIDE){
                //Get the direction vector to the point given the camera current location
                const dirVectorX = this.pointsAdded.get(i).position.x - this.position.x;
                const dirVectorY = this.pointsAdded.get(i).position.y - this.position.y;
                const dirVectorZ = this.pointsAdded.get(i).position.z - this.position.z;
                const cameraRay = this.projectRayFromCameraPos(dirVectorX, dirVectorY, dirVectorZ);
                const cameraIntersection = this.scene.globe.pick(cameraRay, this.scene);
                console.log(cameraIntersection);
                console.log(this.pointsAdded.get(i).position);
                if(cameraIntersection != undefined){
                    const cameraX = cameraIntersection.x;
                    const cameraY = cameraIntersection.y;
                    const cameraZ = cameraIntersection.z;
                    //Allow for a margin of error
                    if(Math.abs(cameraX - this.pointsAdded.get(i).position.x) < 1 && Math.abs(cameraY - this.pointsAdded.get(i).position.y) < 1 && Math.abs(cameraZ - this.pointsAdded.get(i).position.z) < 1){
                        this.pointsAdded.get(i).color = Cesium.Color.GREEN;
                        this.linesToPoints.get(i).material.uniforms.color = Cesium.Color.GREEN;
                        this.linesToPoints.get(i).show = true;
                    } else {
                        this.pointsAdded.get(i).color = Cesium.Color.RED;
                        this.linesToPoints.get(i).material.uniforms.color = Cesium.Color.RED;
                        this.linesToPoints.get(i).show = true;
                    }
                }
            } else {
                this.pointsAdded.get(i).color = Cesium.Color.RED;

                this.linesToPoints.get(i).show = false;
            }
        }
    }
}
