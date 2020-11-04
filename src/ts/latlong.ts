/** 
 * Functions for dealing with latditude and longitude 
 * @packageDocumentation
*/

import * as Cesium from "cesium_source/Cesium";

const RADIUS_EARTH = 6378.1;

/** 
 * Calculate the latidude and longditude offset from a point by a given `distance` and `bearing`
 * 
 * @param lat - the latutde coordinate (in degrees)
 * @param long - the longditude coordinate (in degrees)
 * @param distance - The distance to the other point, in km
 * @param bearing - the angle from north to the other point
 * 
 * @returns The latitude and longditude of the other point, which is offset from `lat` and `long` by `distance` and `bearing`
 */
export function calc_lat_long([lat, long]: [number, number], distance: number, bearing: number): [number, number] {
    let lat1 = Cesium.Math.toRadians(lat);
    let long1 = Cesium.Math.toRadians(long);

    let lat2: number = Math.asin(Math.sin(lat1) * Math.cos(distance / RADIUS_EARTH) + Math.cos(lat1) * Math.sin(distance / RADIUS_EARTH) * Math.cos(bearing));

    let long2 = long1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / RADIUS_EARTH) * Math.cos(lat1), Math.cos(distance / RADIUS_EARTH) - Math.sin(lat1) * Math.sin(lat2));

    return [Cesium.Math.toDegrees(lat2), Cesium.Math.toDegrees(long2)];
}