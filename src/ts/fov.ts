/**
 * Functions for drawing a Field of View
 *
 * @packageDocumentation
 */

import * as Cesium from "cesium_source/Cesium";
import { Cartesian2, Cartesian3, HeadingPitchRoll, Matrix3, PerspectiveFrustum } from "cesium_source/Cesium";
import { FOVLogger } from "./logger";


/**
 * A wrapper around cesium camera viewer.
 */
export class FOV {
    _position: Cesium.Cartesian3;
    camera: Cesium.Camera;
    cameraUp: Cesium.Cartesian3;
    cameraDirection: Cesium.Cartesian3;
    long: number;
    lat: number;
    _elevation: number;
    theta: number;
    phi: number;
    roll: number;
    viewer: Cesium.Viewer;
    fov: number;
    camPoly: Cesium.PrimitiveCollection;

    /** Should lines be drawn at the corners of the screen */
    shouldDrawEdgeLines: boolean;
    linesToEdges: Cesium.Entity[];
    pointsToEdges: Cesium.PointPrimitiveCollection[];

    curDrawn: Cesium.Primitive | null;

    posFns: { (val: number): void; }[];
    headingFns: { (val: number): void; }[];
    tiltFns: { (val: number): void; }[];
    fovFns: { (val: number): void; }[];
    aspectRatioFns: { (val: number): void; }[];

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

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
    }

    /** @returns The position of the camera */
    public get position(): Cesium.Cartesian3{
        return this.camera.position;
    }

    /** Set the elevation of the camera, in meters */
    public set elevation(ele: number){
        const posCarto = this.camera.positionCartographic;
        posCarto.height = ele;
        this.camera.position = Cesium.Cartographic.toCartesian(posCarto);

        this._elevation = ele;

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
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
                roll : this.roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
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
                roll : this.roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
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
                roll : this.roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
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
                roll : this.roll + Cesium.Math.PI_OVER_TWO,
            },
        });

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
    }

    /** @returns The tilt of the camera, in radians */
    public get tilt(): number{
        return this.phi;
    }


    /**
     *  Set the fov of the camera, in radians
     *
     *  @param f - The fov in radians
     */
    public set fovDeg(f: number){
        (this.camera.frustum as PerspectiveFrustum).fov = f;

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
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

        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
    }

    /** @returns The aspect ratio of the camera */
    public get aspectRatio(): number{
        return (this.camera.frustum as PerspectiveFrustum).aspectRatio;
    }

    /**
     * Constructs an FOV object, call draw() to draw it in a scene
     *
     * @param viewer - The cesium viewer to be used (should this be scene)
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
        viewer: Cesium.Viewer, [long, lat, elevation]: [number, number, number], fov: number, aspectRatio: number, theta: number, phi: number, roll: number, near: number, far: number
    ) {
        this._position = Cesium.Cartesian3.fromDegrees(long, lat, elevation);
        this.viewer = viewer;
        this.long = long;
        this.lat = lat;
        this._elevation = elevation;
        this.theta = Cesium.Math.toRadians(theta);
        this.phi = Cesium.Math.toRadians(phi);
        this.roll = Cesium.Math.toRadians(roll);
        this.fov = Cesium.Math.toRadians(fov);
        this.curDrawn = null;
        this.camPoly = this.viewer.scene.primitives.add(new Cesium.PrimitiveCollection());

        this.linesToEdges = [];

        this.pointsToEdges = [];
        this.shouldDrawEdgeLines = false;

        this.posFns = [];
        this.headingFns = [];
        this.tiltFns = [];
        this.fovFns = [];
        this.aspectRatioFns = [];

        this.camera = new Cesium.Camera(viewer.scene);
        const frustum = new Cesium.PerspectiveFrustum({
            fov: this.fov,
            aspectRatio: aspectRatio,
            near: near,
            far: far,
        });

        const [, yAxisNew, zAxisNew] = this.getSurfaceTransform(long, lat, elevation);

        const rotationMatrix = this.getSurfaceRotationMatrix(
            long, lat, elevation, this.theta, this.phi - Cesium.Math.PI_OVER_TWO, this.roll
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
                roll : this.roll + Cesium.Math.PI_OVER_TWO,
            },
        });
        this.viewer.scene.primitives.remove(this.curDrawn);
        this.draw(this.viewer.scene);
        this.redrawLinesToEdges();
    }

    /**
     * Draw a FOV in a cesium scene
     *
     * @param scene - The cesium scene in which the object should be drawn
     */
    draw(scene: Cesium.Scene): void {
        const rotationMatrix = this.getSurfaceRotationMatrix(
            this.long, this.lat, this._elevation, this.theta, this.phi, this.roll
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

    /**
     * Set if the edge lines should be drawn
     *
     * @param b - Set if the edge lines of the camera should be drawn
     */
    setShouldDrawEdgeLines(b: boolean): void{
        this.shouldDrawEdgeLines = b;
    }

    /**
     * Draw lines to the edges of the camera
     */
    redrawLinesToEdges(): void{
        //First remove the lines ot the edges
        this.removeLinesToEdges();
        this.camPoly.removeAll();

        // Draw line to Top Right, Top Left
        let returnLine = this.drawLineFromPercentToScreen(this.viewer,
            new Cesium.Cartesian2(0.0, 0.0),
            this.viewer.scene.globe.ellipsoid);
        if(returnLine != null){
            const [l, p] = returnLine;
            this.linesToEdges.push(l);
            this.pointsToEdges.push(p);
        }

        // Draw line to Bottom Right, Top Left
        returnLine = this.drawLineFromPercentToScreen(this.viewer,
            new Cesium.Cartesian2(1.0, 0.0),
            this.viewer.scene.globe.ellipsoid);
        if(returnLine != null){
            const [l, p] = returnLine;
            this.linesToEdges.push(l);
            this.pointsToEdges.push(p);
        }

        // Draw line to Top Right, Bottom Left
        returnLine = this.drawLineFromPercentToScreen(this.viewer,
            new Cesium.Cartesian2(0.0, 1.0),
            this.viewer.scene.globe.ellipsoid);
        if(returnLine != null){
            const [l, p] = returnLine;
            this.linesToEdges.push(l);
            this.pointsToEdges.push(p);
        }

        // Draw line to Bottom Right, Bottom Left
        returnLine = this.drawLineFromPercentToScreen(this.viewer,
            new Cesium.Cartesian2(1.0, 1.0),
            this.viewer.scene.globe.ellipsoid);
        if(returnLine != null){
            const [l, p] = returnLine;
            this.linesToEdges.push(l);
            this.pointsToEdges.push(p);
        }
        this.drawCamPolygon();
    }

    /**
     * Draw the polygon of what the camera can see on the surface of the Earth
     */
    drawCamPolygon(): void{
        // Get edge points, then draw polygon
        const topLeft = this.getCamPointPercent(this.viewer, new Cartesian2(0, 0), this.viewer.scene.globe.ellipsoid);
        const topRight = this.getCamPointPercent(this.viewer, new Cartesian2(0, 1), this.viewer.scene.globe.ellipsoid);
        const bottomLeft = this.getCamPointPercent(this.viewer, new Cartesian2(1, 0), this.viewer.scene.globe.ellipsoid);
        const bottomRight = this.getCamPointPercent(this.viewer, new Cartesian2(1, 1), this.viewer.scene.globe.ellipsoid);
        const POINT_FIVE = 0.5;

        if(topLeft != undefined && topRight != undefined && bottomLeft != undefined && bottomRight != undefined){
            this.camPoly.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.PolygonGeometry({
                        polygonHierarchy: new Cesium.PolygonHierarchy([topLeft, topRight, bottomRight, bottomLeft]),
                        perPositionHeight: false,
                        closeTop:true,
                    }),
                    id: "cam tri 1",
                    attributes: {
                        // Blue
                        color: new Cesium.ColorGeometryInstanceAttribute(
                            0, 0, 1, POINT_FIVE
                        ),
                    },
                }),
                appearance: new Cesium.PerInstanceColorAppearance({
                    closed: true,
                }),
            }));
        }
    }

    /**
     *
     */
    removeLinesToEdges(): void{
        for(const l of this.linesToEdges){
            this.viewer.entities.remove(l);
        }
        for(const p of this.pointsToEdges){
            this.viewer.scene.primitives.remove(p);
        }
    }

    /**
     * Destroys the view object so it is no longer present in the scene
     */
    destroy(): void {
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
    getSurfaceRotationMatrix(
        long: number, lat: number, elevation: number, theta: number, phi: number, roll: number
    ): Matrix3 {
        const [xAxisNew, yAxisNew, zAxisNew] = this.getSurfaceTransform(lat, long, elevation);

        const rotationMatrix = new Matrix3(
            xAxisNew.x, yAxisNew.x, zAxisNew.x,
            xAxisNew.y, yAxisNew.y, zAxisNew.y,
            xAxisNew.z, yAxisNew.z, zAxisNew.z,
        );

        const rotMatrix = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(theta - Cesium.Math.PI_OVER_TWO, -phi + Cesium.Math.PI_OVER_TWO, roll));
        Matrix3.multiply(rotationMatrix, rotMatrix, rotationMatrix);

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
    getSurfaceTransform(long: number, lat: number, elevation: number): [Cartesian3, Cartesian3, Cartesian3] {
        // The point in cartesian coordinates
        const cartesianPoint = Cartesian3.fromDegrees(lat, long, elevation);
        const smallChange = 0.0001;

        // The theta and phi gradients are lines tangent to the theta and phi axis in the spherical coordinates, in the standard basis cartisean coordinate system
        const thetaGrad: Cartesian3 = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(cartesianPoint, Cartesian3.fromDegrees(lat + smallChange, long, elevation), thetaGrad);

        const phiGrad = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(cartesianPoint, Cartesian3.fromDegrees(lat, long + smallChange, elevation), phiGrad);

        // Create a new axis where the x basis vector is pointing tangent to the theta axis
        // And y basis vector is pointing tangent to the phi axis
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
    drawDebugCamera(scene: Cesium.Scene): void {
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
    setUpPosListener(positionEv: HTMLInputElement): void{
        positionEv.oninput = e => {
            this.elevation = Number((e.target as HTMLInputElement).value);
            FOVLogger.debug("Updated Elevation");

            // Call event listeners
            for(const fn of this.posFns){
                fn(this.elevation);
            }
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the position is changed, val is the new position
     */
    onPosChanged(fun: (val: number) => void): void{
        this.posFns.push(fun);
    }

    /**
     * Sets up the event listeners for the heading of the camera
     *
     * @param headingEv - The HTML input event to change the position
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    setUpHeadingListener(headingEv: HTMLInputElement): void{
        headingEv.oninput = e => {
            this.heading = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated Heading");

            // Call event listeners
            for(const fn of this.headingFns){
                fn(this.heading);
            }
        };
    }

    /**
     * Run a function when the heading has changed
     *
     * @param fun - function to run when the heading has changed, val is the new heading
     */
    onHeadingChanged(fun: (val: number) => void): void{
        this.headingFns.push(fun);
    }

    /**
     * Sets up the event listeners for the tilt of the camera
     *
     * @param tiltEv - The HTML input event to change the tilt
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    setUpTiltListener(tiltEv: HTMLInputElement): void{
        tiltEv.oninput = e => {
            this.tilt = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated Tilt");

            // Call event listeners
            for(const fn of this.tiltFns){
                fn(this.tilt);
            }
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the tilt is changed, val is the new tilt
     */
    onTiltChanged(fun: (val: number) => void): void{
        this.tiltFns.push(fun);
    }

    /**
     * Sets up the event listeners for the tilt of the camera
     *
     * @param fovEv - The HTML input event to change the fov
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    setUpFOVListener(fovEv: HTMLInputElement): void{
        fovEv.oninput = e => {
            this.fovDeg = Cesium.Math.toRadians(Number((e.target as HTMLInputElement).value));
            FOVLogger.debug("Updated FOV");

            // Call event listeners
            for(const fn of this.fovFns){
                fn(this.fovDeg);
            }
        };
    }

    /**
     * Run a function when the position is changed
     *
     * @param fun - function to run when the fov is changed, val is the new fov
     */
    onFOVChanged(fun: (val: number) => void): void{
        this.fovFns.push(fun);
    }

    /**
     * Sets up the event listeners for the aspect ratio of the camera
     *
     * @param arEv - The HTML input event to change the aspect ratio
     * TODO Generalise this so it takes an event with a value, not just HTML events, perhaps use a different function for generic event
     */
    setUpAspectRatioListener(arEv: HTMLInputElement): void{
        arEv.oninput = e => {
            this.aspectRatio = Number((e.target as HTMLInputElement).value);
            FOVLogger.debug("Updated Aspect Ratio");

            // Call event listeners
            for(const fn of this.aspectRatioFns){
                fn(this.aspectRatio);
            }
        };
    }

    /**
     * Run a function when the aspect ratio is changed
     *
     * @param fun - function to run when the aspect ratio is changed, val is the new aspect ratio
     */
    onAspectRatioChanged(fun: (val: number) => void): void{
        this.aspectRatioFns.push(fun);
    }

    /**
     * This is only an approximation rectangle from cesium, using a polygon would usually be more accurate
     *
     * @param ellipsoid - The ellipsoid onto which to project the rectangle
     * @returns the rectangle of what the camera can see projected onto the Earth
     */
    getCameraRect(ellipsoid: Cesium.Ellipsoid): Cesium.Rectangle | undefined {
        return this.camera.computeViewRectangle(ellipsoid);
    }

    /**
     * Draws a line from the a pixel on the camera screen to the point that pixel maps to
     * on an ellipsoid
     *
     * @param viewer - The cesium viewer
     * @param pixel - The pixel coordinate on the camera screen
     * @param ellipsoid - The ellopsoid the point should map to
     * @returns The line and point drawn to the sphere
     */
    drawLineFromPixelToScreen(viewer: Cesium.Viewer, pixel: Cartesian2, ellipsoid: Cesium.Ellipsoid): [Cesium.Entity, Cesium.PointPrimitiveCollection] | null {
        let pointOnSphere = this.camera.pickEllipsoid(pixel, ellipsoid);
        if(pointOnSphere != undefined) {
            pointOnSphere = pointOnSphere as Cesium.Cartesian3;
            const line = viewer.entities.add({
                name: "Cam Line",
                polyline: {
                    positions: [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), pointOnSphere],
                    width: 10,
                    arcType: Cesium.ArcType.NONE,
                    material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
                },
            });

            // Keep this as a point cloud for now, so we can add more points in the future
            const points = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            points.add({
                position: pointOnSphere,
                color: Cesium.Color.GREEN,
                pixelSize: 10,
            });
            return [line, points];
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
    getPointOnSphereFromScreen(pixel: Cartesian2, ellipsoid: Cesium.Ellipsoid): Cartesian3 | undefined {
        return this.camera.pickEllipsoid(pixel, ellipsoid);
    }

    /**
     * Project a ray from the camera to a set distance
     *
     * @param pixel - the camera pixel to project the ray from
     * @returns The cesium ray from the point on the pixel on the screen
     */
    getRayFromScreen(pixel: Cartesian2): Cesium.Ray {
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
    projectRayFromCameraPos(bearing: number, tilt: number, heading:number): Cesium.Ray{
        return new Cesium.Ray(this.position, new Cartesian3(bearing, tilt, heading));
    }

    /**
     * Get a point a set distance away from the camera which goes through a ray of a set pixel
     *
     * @param pixel - The camera pixel to project the ray from
     * @param dist - The distance away from the camera where the point is located
     * @returns The point a set distance away from the camera pointing from a pixel on the screen
     */
    getPointAtDistFromScreen(pixel: Cartesian2, dist: number): Cesium.Cartesian3 {
        return Cesium.Ray.getPoint(this.getRayFromScreen(pixel), dist);
    }

    /**
     * A convience function to draw a point at a set distance away from the camera on a
     * ray projected through the camera screen
     *
     * @param viewer - The cesium viewer
     * @param pixel - The camera pixel to project the ray from
     * @param dist - The distance away from the camera where the point is located
     */
    placePointAtDistFromScreen(viewer: Cesium.Viewer, pixel: Cartesian2, dist: number): void {
        const point = this.getPointAtDistFromScreen(pixel, dist);

        // Add the polylien
        viewer.entities.add({
            name: "Cam Line to ray distance",
            polyline: {
                positions: [Cesium.Cartesian3.fromDegrees(this.long, this.lat, this._elevation), point],
                width: 10,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
            },
        });

        // Now just draw the point
        const points = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
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
     * @param viewer - The cesium viewer
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param ellipsoid - The ellopsoid the point should map to
     * @returns The line and point drawn to the sphere
     */
    drawLineFromPercentToScreen(viewer: Cesium.Viewer, percent: Cartesian2, ellipsoid: Cesium.Ellipsoid): [Cesium.Entity, Cesium.PointPrimitiveCollection] | null {
        const maxHeight = viewer.canvas.clientHeight;
        const maxWidth = viewer.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * percent.x, maxHeight * percent.y);
        return this.drawLineFromPixelToScreen(viewer, pixel, ellipsoid);
    }

    /**
     * @param viewer - The cesium viewer
     * @param percent - The percent coordinate on the camera screen, bewteen 0.0 and 1.0
     * @param ellipsoid - The ellopsoid the point should map to
     * @returns The point on the sphere the pixel on the screen maps to
     */
    getCamPointPercent(viewer: Cesium.Viewer, percent: Cartesian2, ellipsoid: Cesium.Ellipsoid): Cesium.Cartesian3 | undefined{
        const maxHeight = viewer.canvas.clientHeight;
        const maxWidth = viewer.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * percent.x, maxHeight * percent.y);
        return this.camera.pickEllipsoid(pixel, ellipsoid);
    }

    /**
     * Computes the intersection of the view and a bounding box
     *
     * @param boundingVolume - The bounding volume of the object of which to check the intersection
     * @returns The cesium intersect with the object, in essence if the object is within the FOV viewcone
     */
    checkIntersection(boundingVolume: Cesium.BoundingRectangle | Cesium.BoundingSphere | Cesium.AxisAlignedBoundingBox | Cesium.OrientedBoundingBox): Cesium.Intersect {
        return this.camera.frustum.computeCullingVolume(this.camera.position, this.cameraDirection, this.cameraUp).computeVisibility(boundingVolume);
    }
}
