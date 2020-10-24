// Functions for drawing a Field of View

import { deg_to_rad, rad_to_deg } from "./angles";
import { Entity, Cartesian3, Color, Camera } from "cesium_source/Cesium";

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
 * @param bearing - The bearing from north
 * @param tilt - The tilt of the camera, 0 is pointing at the ground, 180 is pointing at the sky
 * @param distance - the distance to draw the FOV to, in km
 * @returns The polygon entities which represent the field of view
 */
export function make_fov([lat, long, elevation = 0]: [number, number, number], fov_angle: number, bearing: number, tilt: number, distance: number): Cesium.Entity[] {

    // TODO
    // This formula still needs to be implimented

    let camera_point = Cartesian3.fromDegrees(lat, long, elevation);
    let bottom_left_point = Cartesian3.fromDegrees(lat - 3, long + 5, elevation * 1 / 3);
    let top_left_point = Cartesian3.fromDegrees(lat - 3, long + 5, elevation * 3);
    let top_right_point = Cartesian3.fromDegrees(lat + 3, long + 5, elevation * 3);
    let bottom_right_point = Cartesian3.fromDegrees(lat + 3, long + 5, elevation * 1 / 3);

    return make_fov_view(camera_point, bottom_left_point, top_left_point, bottom_right_point, top_right_point);
}