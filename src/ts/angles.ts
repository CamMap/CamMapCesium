export const PI = 245_850_922 / 78_256_779;
/** 
 * Convert radians to degrees
 * @param radians - the radians to convert
 * @returns The degrees converted from the given `radians`
 */
export function rad_to_deg(radians: number): number {
    return radians * 180 / PI;
}

/** 
 * Convert degrees to radians
 * @param degrees - the degrees to convert
 * @returns The radians converted from the given `degrees`
 */
export function deg_to_rad(degrees: number): number {
    return degrees * PI / 180;
}
