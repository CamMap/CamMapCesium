// Functions for drawing a Field of View

import { deg_to_rad } from "./angles";
import { Entity, Cartesian3, Color, Matrix3, Viewer, HeadingPitchRoll } from "cesium_source/Cesium";

/** 
 * Make a field of view frustum from points, this does not calculate `angles`, `distance` or `bearing`
 * @returns The polygon entities which represent the field of view from the given points
 */
export function make_fov_view(
    camera_point: Cartesian3,
    bottom_left: Cartesian3,
    top_left: Cartesian3,
    bottom_right: Cartesian3,
    top_right: Cartesian3,
    polygon_opts: Cesium.PolygonGraphics.ConstructorOptions = {
        perPositionHeight: true,
        closeBottom: true,
        closeTop: true,
        material: Color.ORANGE.withAlpha(0.5),
        outline: true,
        outlineColor: Color.BLACK,
    }
): Cesium.Entity[] {

    let left = new Entity({
        polygon: {
            hierarchy: {
                positions:
                    [
                        camera_point,
                        top_left,
                        bottom_left,
                        camera_point

                    ],
                holes: []
            },
            ...polygon_opts
        },

    });

    let top = new Entity({
        polygon: {
            hierarchy: {
                positions:
                    [
                        camera_point,
                        top_left,
                        top_right,
                        camera_point
                    ],
                holes: []
            },
            ...polygon_opts
        }
    });

    let right = new Entity({
        polygon: {
            hierarchy: {
                positions:
                    [
                        camera_point,
                        top_right,
                        bottom_right,
                        camera_point
                    ],
                holes: []
            },
            ...polygon_opts
        }
    });

    let bottom = new Entity({
        polygon: {
            hierarchy: {
                positions:
                    [
                        camera_point,
                        bottom_right,
                        bottom_left,
                        camera_point,
                    ],
                holes: []
            },
            ...polygon_opts
        }
    });

    let center = new Entity({
        polygon: {
            hierarchy: {
                positions:
                    [
                        camera_point,
                        bottom_right,
                        bottom_left,
                        top_left,
                        top_right,
                        camera_point
                    ],
                holes: []
            },
            ...polygon_opts
        }
    });

    return [left, right, top, bottom, center];
}

/** 
 * TODO Make a field of view frustum, the angle should be less than 60 degrees and strictly less than 90.
 * @param lat - the latutde coordinate (in degrees)
 * @param long - the longditude coordinate (in degrees)
 * @param elevation - the elevation coordinate, in km
 * @param fov_angle - The FOV angle of the camera, controlling how wide the view is.
 * @param bearing - The bearing from north
 * @param tilt - The tilt of the camera, -90 is pointing at the ground, 90 is pointing at the sky
 * @param distance - the distance to draw the FOV to, in km
 * @returns The polygon entities which represent the field of view
 */
export function make_fov([lat, long, elevation = 0]: [number, number, number], fov_angle: number, bearing: number, tilt: number, distance: number): Cesium.Entity[] {

    // Draw a sphere of visibility, the distance is the radius of this sphere
    // then the FOV is an arc of the sphere
    let radius: number = distance;
    let theta: number = tilt;
    let phi: number = bearing;

    // Make sure the angles point north 
    // to begin with, otherwise they point looking 
    // into space
    //theta += 90;
    //phi -= 90;

    // theta = 0;
    //phi = 0;

    // Camera point is the center of the sphere
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

    // The transformation matrix is given by aligning the x, y, z new basis
    // vectors in a column and so, the x component of each multipled by the x, y, z of the new basis
    // respectively will give the new x coordinate, in the new basis

    let transformation_matrix = new Matrix3(
        x_axis_new.x, y_axis_new.x, z_axis_new.x,
        x_axis_new.y, y_axis_new.y, z_axis_new.y,
        x_axis_new.z, y_axis_new.z, z_axis_new.z
    );

    let rotation_matrix = Matrix3.fromHeadingPitchRoll(new HeadingPitchRoll(deg_to_rad(theta), deg_to_rad(0), deg_to_rad(phi)));

    Matrix3.multiply(transformation_matrix, rotation_matrix, transformation_matrix);

    // Convert the spherical coordinates to cartesian, then transform the cartesian axis to point along the correct axis, where the x and y lie tangent to the Earths surace and the z points away from the center of the Earth.  This is done using the transformation matrix created above.

    let theta_offset = 90;
    let phi_offset = -90;

    let top_left_cart = new Cartesian3(0, 0, 0);
    Matrix3.multiplyByVector(transformation_matrix, spherical_to_cartesian(radius, theta_offset - fov_angle, phi_offset - fov_angle), top_left_cart);

    let bottom_right_cart = new Cartesian3(0, 0, 0);
    Matrix3.multiplyByVector(transformation_matrix, spherical_to_cartesian(radius, theta_offset + fov_angle, phi_offset - fov_angle), bottom_right_cart);

    let bottom_left_cart = new Cartesian3(0, 0, 0);
    Matrix3.multiplyByVector(transformation_matrix, spherical_to_cartesian(radius, theta_offset + fov_angle, phi_offset + fov_angle), bottom_left_cart);

    let top_right_cart = new Cartesian3(0, 0, 0);
    Matrix3.multiplyByVector(transformation_matrix, spherical_to_cartesian(radius, theta_offset - fov_angle, phi_offset + fov_angle), top_right_cart);

    // Now put the point at an offset from the camera, otherwise they would simply be at the center of the Earth.  This moves the cartesian axis to be where the camera is located.

    let top_left_point: Cartesian3 = new Cartesian3(0, 0, 0);
    Cartesian3.add(camera_point, top_left_cart, top_left_point);

    let bottom_right_point: Cartesian3 = new Cartesian3(0, 0, 0);
    Cartesian3.add(camera_point, bottom_right_cart, bottom_right_point);

    let bottom_left_point: Cartesian3 = new Cartesian3(0, 0, 0);
    Cartesian3.add(camera_point, bottom_left_cart, bottom_left_point);

    let top_right_point: Cartesian3 = new Cartesian3(0, 0, 0);
    Cartesian3.add(camera_point, top_right_cart, top_right_point);

    return make_fov_view(camera_point, bottom_right_point, top_left_point, bottom_left_point, top_right_point);
}

/* TODO
function make_fov_cone(viewer: Viewer); Entity[]{
    // To make a cone, apply sin and cos to 
    // build a circle, like in an argand diagram.
    // This is done in spherical coordinates
}
*/

export function spherical_to_cartesian(radius: number, theta: number, phi: number): Cartesian3 {
    // For spherical coordinates
    // x = rsin(theta)cos(phi)
    // y = rsin(theta)sin(phi)
    // z = rcos(theta)

    let theta_rad = deg_to_rad(theta);
    let phi_rad = deg_to_rad(phi);

    return new Cartesian3(
        radius * Math.sin(theta_rad) * Math.cos(phi_rad),
        radius * Math.sin(theta_rad) * Math.sin(phi_rad),
        radius * Math.cos(theta_rad),

    )
}