// Functions for drawing a Field of View

import { Cartesian3, Matrix3, HeadingPitchRoll } from "cesium_source/Cesium";
import * as Cesium from "cesium_source/Cesium";

/**
 * A wrapper around cesium debug camera viewer.
 */
export class FOV {

    position: Cesium.Cartesian3;
    camera: Cesium.Camera;
    lat: number;
    long: number;
    elevation: number;
    theta: number;
    phi: number;
    roll: number;
    viewer: Cesium.Viewer;

    cur_drawn: any;

    constructor(viewer: Cesium.Viewer, [lat, long, elevation]: [number, number, number], theta: number, phi: number, roll: number, near: number, far: number) {

        this.position = Cesium.Cartesian3.fromDegrees(lat, long, elevation);
        this.viewer = viewer;
        this.lat = lat;
        this.long = long;
        this.elevation = elevation;
        this.theta = Cesium.Math.toRadians(theta);
        this.phi = Cesium.Math.toRadians(phi);
        this.roll = Cesium.Math.toRadians(roll);

        let rotation_matrix = this.getSurfaceRotationMatrix(this.lat, this.long, this.elevation, this.theta, this.phi, this.roll);

        this.camera = new Cesium.Camera(viewer.scene);
        var frustum = new Cesium.PerspectiveFrustum({
            fov: Cesium.Math.PI_OVER_THREE,
            aspectRatio: 1,
            near: 10000.0,
            far: 100000.0
        });
        this.camera.frustum = frustum;
        this.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(long, lat, elevation),
            orientation: Cesium.Quaternion.fromRotationMatrix(rotation_matrix)
        })
    }

    /**
     * Draw the fow, with the assigned viewer
     */
    draw(scene: Cesium.Scene) {
        let rotation_matrix = this.getSurfaceRotationMatrix(this.lat, this.long, this.elevation, this.theta, this.phi, this.roll);

        let geom: Cesium.Geometry = Cesium.FrustumGeometry.createGeometry(new Cesium.FrustumGeometry({
            frustum: this.camera.frustum as Cesium.PerspectiveFrustum,
            origin: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 30000.0),
            orientation: Cesium.Quaternion.fromRotationMatrix(rotation_matrix)
        }))!;
        var instance = new Cesium.GeometryInstance({
            geometry: geom
        });

        var material = Cesium.Material.fromType('Color');
        material.uniforms.color = Cesium.Color.ORANGE.withAlpha(0.5);

        this.cur_drawn = scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.MaterialAppearance({
                material: material
            }),
            asynchronous: false
        }));
    }

    destroy() {
        this.cur_drawn.destroy();
    }


    getSurfaceRotationMatrix(lat: number, long: number, elevation: number, theta: number, phi: number, roll: number): Matrix3 {
        let [x_axis_new, y_axis_new, z_axis_new] = this.getSurfaceTransform(lat, long, elevation);

        let rotation_matrix = new Matrix3(
            x_axis_new.x, y_axis_new.x, z_axis_new.x,
            x_axis_new.y, y_axis_new.y, z_axis_new.y,
            x_axis_new.z, y_axis_new.z, z_axis_new.z,
        )

        let rot_matrix = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(theta - Cesium.Math.PI_OVER_TWO, (phi * -1) + Cesium.Math.PI_OVER_TWO, roll));
        Matrix3.multiply(rotation_matrix, rot_matrix, rotation_matrix);

        return rotation_matrix;
    }

    getSurfaceTransform(lat: number, long: number, elevation: number): [Cartesian3, Cartesian3, Cartesian3] {
        let camera_point = Cartesian3.fromDegrees(lat, long, elevation);


        // The theta and phi gradients are lines tangent to the theta and phi axis in the spherical coordinates, in the standard basis cartisean coordinate system
        let theta_grad: Cartesian3 = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(camera_point, Cartesian3.fromDegrees(lat + 0.0001, long, elevation), theta_grad);

        let phi_grad = new Cartesian3(0, 0, 0);
        Cartesian3.subtract(camera_point, Cartesian3.fromDegrees(lat, long + 0.0001, elevation), phi_grad);


        // Create a new axis where the x basis vector is pointing tangent to the theta axis and y basis vector is pointing tangent to the phi axis
        let x_axis_new = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(theta_grad, x_axis_new);

        let y_axis_new = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(phi_grad, y_axis_new);

        // The new z axis is simply pointing away from the Earth
        let z_axis_new = new Cartesian3(0, 0, 0);
        Cartesian3.normalize(camera_point, z_axis_new);

        return [x_axis_new, y_axis_new, z_axis_new];

    }
}