/**
 * Functions for drawing a Field of View
 *
 * @packageDocumentation
 */

import { Cartesian2, Cartesian3, Cartographic, default as Cesium, HeadingPitchRoll, Matrix3 } from "cesium_source/Cesium";

/**
 * A wrapper around cesium camera viewer.
 */
export class FOV {
    position: Cesium.Cartesian3;
    camera: Cesium.Camera;
    cameraUp: Cesium.Cartesian3;
    cameraDirection: Cesium.Cartesian3;
    lat: number;
    long: number;
    elevation: number;
    theta: number;
    phi: number;
    roll: number;
    viewer: Cesium.Viewer;
    fov: number;

    curDrawn: Cesium.Primitive | null;

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
        viewer: Cesium.Viewer, [lat, long, elevation]: [number, number, number], fov: number, aspectRatio: number, theta: number, phi: number, roll: number, near: number, far: number
    ) {
        this.position = Cesium.Cartesian3.fromDegrees(lat, long, elevation);
        this.viewer = viewer;
        this.lat = lat;
        this.long = long;
        this.elevation = elevation;
        this.theta = Cesium.Math.toRadians(theta);
        this.phi = Cesium.Math.toRadians(phi);
        this.roll = Cesium.Math.toRadians(roll);
        this.fov = Cesium.Math.toRadians(fov);
        this.curDrawn = null;

        this.camera = new Cesium.Camera(viewer.scene);
        const frustum = new Cesium.PerspectiveFrustum({
            fov: this.fov,
            aspectRatio: aspectRatio,
            near: near,
            far: far,
        });

        const [, yAxisNew, zAxisNew] = this.getSurfaceTransform(lat, long, elevation);

        const rotationMatrix = this.getSurfaceRotationMatrix(
            lat, long, elevation, this.theta, this.phi - Cesium.Math.PI_OVER_TWO, this.roll
        );
        this.camera.frustum = frustum;
        this.camera.position = Cesium.Cartesian3.fromDegrees(lat, long, elevation);
        this.camera.up = Cesium.Cartesian3.clone(zAxisNew);
        this.camera.right = Cesium.Cartesian3.clone(yAxisNew);

        const xOnNewAxis = Cartesian3.clone(Cartesian3.ZERO);
        Cesium.Matrix3.multiplyByVector(rotationMatrix, Cesium.Cartesian3.UNIT_X, xOnNewAxis);
        this.camera.direction = xOnNewAxis;

        this.cameraUp = this.camera.up;
        this.cameraDirection = this.camera.direction;
    }

    /**
     * Draw a FOV in a cesium scene
     *
     * @param scene - The cesium scene in which the object should be drawn
     */
    draw(scene: Cesium.Scene): void {
        const rotationMatrix = this.getSurfaceRotationMatrix(
            this.lat, this.long, this.elevation, this.theta, this.phi, this.roll
        );

        const geom: Cesium.Geometry | undefined = Cesium.FrustumGeometry.createGeometry(new Cesium.FrustumGeometry({
            frustum: this.camera.frustum as Cesium.PerspectiveFrustum,
            origin: Cesium.Cartesian3.fromDegrees(this.lat, this.long, this.elevation),
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
     * Destroys the view object so it is no longer present in the scene
     */
    destroy(): void {
        if(this.curDrawn !== null) this.curDrawn.destroy();
    }

    /**
     * Calculate the rotation matrix to align the object to the surface of a sphere
     *
     * @param lat - The latitude of the position on the sphere
     * @param long - The longditude of the position on the sphere
     * @param elevation - The elevation of the position on the sphere
     * @param theta - the bearing of the camera
     * @param phi - the tilt of the camera
     * @param roll - the roll of the camera
     * @returns The rotation matrix to put the obect on the surface of a sphere
     */
    getSurfaceRotationMatrix(
        lat: number, long: number, elevation: number, theta: number, phi: number, roll: number
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
     * @param lat - The latitude of the position on the sphere
     * @param long - The longditude of the position on the sphere
     * @param elevation - The elevation of the position on the sphere
     * @returns The new [x axis, y axis, z axis] normalized vectors
     */
    getSurfaceTransform(lat: number, long: number, elevation: number): [Cartesian3, Cartesian3, Cartesian3] {
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
     * @param ellipsoid - The ellopsoid the point shoudl map to
     */
    drawLineFromPixelToScreen(viewer: Cesium.Viewer, pixel: Cartesian2, ellipsoid: Cesium.Ellipsoid): void {
        let pointOnSphere = this.camera.pickEllipsoid(pixel, ellipsoid);
        if(pointOnSphere != undefined) {
            pointOnSphere = pointOnSphere as Cesium.Cartesian3;
            viewer.entities.add({
                name: "Cam Line",
                polyline: {
                    positions: [Cesium.Cartesian3.fromDegrees(this.lat, this.long, this.elevation), pointOnSphere],
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
        }
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
                positions: [Cesium.Cartesian3.fromDegrees(this.lat, this.long, this.elevation), point],
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
     * @param ellipsoid - The ellopsoid the point shoudl map to
     */
    drawLineFromPercentToScreen(viewer: Cesium.Viewer, percent: Cartesian2, ellipsoid: Cesium.Ellipsoid): void {
        const maxHeight = viewer.canvas.clientHeight;
        const maxWidth = viewer.canvas.clientWidth;
        const pixel = new Cesium.Cartesian2(maxWidth * percent.x, maxHeight * percent.y);
        this.drawLineFromPixelToScreen(viewer, pixel, ellipsoid);
    }

    /**
     * Move the camera to a specified location
     *
     * @param location - The location to move the camera to
     */
    moveCameraToCartesian(location: Cartesian3): void {
        // Switch Camera to lat, long, elevation and move it
        this.moveCameraToCartographic(Cartographic.fromCartesian(location));
    }

    /**
     * Moves the camera to the specified location
     *
     * @param cart - The position in Cartographic coordinates
     */
    moveCameraToCartographic(cart: Cartographic): void {
        // First destroy drawn 3d object
        this.destroy();

        const lat = cart.latitude;
        const long = cart.longitude;
        const elevation = cart.height;

        const [, yAxisNew, zAxisNew] = this.getSurfaceTransform(lat, long, elevation);

        const rotationMatrix = this.getSurfaceRotationMatrix(
            lat, long, elevation, this.theta, this.phi - Cesium.Math.PI_OVER_TWO, this.roll
        );
        this.camera.position = Cesium.Cartesian3.fromDegrees(lat, long, elevation);
        this.camera.up = Cesium.Cartesian3.clone(zAxisNew);
        this.camera.right = Cesium.Cartesian3.clone(yAxisNew);

        const xOnNewAxis = new Cartesian3(0, 0, 0);
        Cesium.Matrix3.multiplyByVector(rotationMatrix, Cesium.Cartesian3.UNIT_X, xOnNewAxis);
        this.camera.direction = xOnNewAxis;

        this.cameraUp = this.camera.up;
        this.cameraDirection = this.camera.direction;

        // Then redraw after changing position
        this.draw(this.viewer.scene);
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
