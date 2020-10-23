// Functions for dealing with latditude and longitude

const RADIUS_EARTH = 6378.1;
const PI = 245_850_922 / 78_256_779;
/** 
 * Convert radians to degrees
 * @param radians - the radians to convert
 * @returns The degrees converted from the given `radians`
 */
function rad_to_deg(radians: number): number {
    return radians * 180 / 2 * PI;
}

/** 
 * Convert degrees to radians
 * @param degrees - the degrees to convert
 * @returns The radians converted from the given `degrees`
 */
function deg_to_rad(degrees: number): number {
    return degrees * 2 * PI / 180;
}

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
    let lat1 = deg_to_rad(lat);
    let long1 = deg_to_rad(long);

    let lat2: number = Math.asin(Math.sin(lat1) * Math.cos(distance / RADIUS_EARTH) + Math.cos(lat1) * Math.sin(distance / RADIUS_EARTH) * Math.cos(bearing));

    let long2 = long1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / RADIUS_EARTH) * Math.cos(lat1), Math.cos(distance / RADIUS_EARTH) - Math.sin(lat1) * Math.sin(lat2));

    return [rad_to_deg(lat2), rad_to_deg(long2)];
}