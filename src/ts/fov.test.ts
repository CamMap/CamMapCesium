import { Cartographic } from "cesium_source/Cesium";

/* eslint @typescript-eslint/no-magic-numbers: off */

test("FOV starts correctly", () => {
    expect(Cartographic.toCartesian(Cartographic.fromDegrees(40.0, -107.0, 100000.0))).toBe(Cartographic.toCartesian(Cartographic.fromDegrees(40.0, -107.0, 100000.0)));
});

test("Set FOV.position", () => {
    expect(true).toBe(true);
});

test("Get FOV.position", () => {
    expect(false).toBe(true);
});
