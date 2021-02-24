import { Cartesian2, Cartesian3, Viewer } from "cesium_source/Cesium";
import { FOV } from "../../src/ts/fov";

/* eslint @typescript-eslint/no-magic-numbers: off */

/**
 * Sets up a viewer attached to a canvas
 *
 * @returns the viewer in the canvas
 */
function setUpEnviroment(): Viewer{
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    c.id = "ID";
    document.body.appendChild(c);


    return new Viewer("ID", {
        animation: false,
        timeline: false,
        geocoder: false,
        selectionIndicator: false,
        infoBox: false,
        vrButton: false,
        fullscreenButton: false,
    });
}

describe("Sample test", function() {
    it("Condition is true", function() {
        expect("AngularJS").toBe("AngularJS");
    });
});

describe("FOV tests", function() {
    const viewer = setUpEnviroment();

    it("Sets up an FOV", function() {
        const viewer = setUpEnviroment();
        new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
    });

    it("Sets up an FOV and sets latitude", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.latitude = 100;
        fov.latitude += 10;
        fov.latitude -= 20;
        expect(fov.latitude).toBe(90);
    });

    it("Sets up an FOV and sets longitude", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.longitude = 100;
        fov.longitude += 10;
        fov.longitude -= 20;
        expect(fov.longitude).toBe(90);
    });

    it("Sets up an FOV and sets position", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.position = new Cartesian3(10, 9, 8);
        fov.position = Cartesian3.add(fov.position, new Cartesian3(10, 10, 10), new Cartesian3(0, 0, 0));
        expect(fov.position).toEqual(new Cartesian3(20, 19, 18));
    });

    it("Sets up an FOV and sets distance", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.distance = 11000;
        fov.distance += 100;
        fov.distance -= 200;
        expect(fov.distance).toBe(10900);
    });


    it("Sets up an FOV and sets elevation", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.elevation = 100;
        fov.elevation += 10;
        fov.elevation -= 20;
        expect(fov.elevation).toBe(90);
    });

    it("Sets up an FOV and sets heading", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.heading = 100;
        fov.heading += 10;
        fov.heading -= 20;
        expect(fov.heading).toBe(90);
    });

    it("Sets up an FOV and sets tilt", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.tilt = 100;
        fov.tilt += 10;
        fov.tilt -= 20;
        expect(fov.tilt).toBe(90);
    });

    it("Sets up an FOV and sets roll", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.roll = 100;
        fov.roll += 10;
        fov.roll -= 20;
        expect(fov.roll).toBe(90);
    });

    it("Sets up an FOV and sets the FOV degree", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.fovDeg = 1;
        fov.fovDeg += 1;
        fov.fovDeg -= 1.9;
        expect(parseFloat(fov.fovDeg.toPrecision(2))).toBe(0.1);
    });

    it("Sets up an FOV and sets aspect ratio", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.aspectRatio = 100;
        fov.aspectRatio += 10;
        fov.aspectRatio -= 20;
        expect(fov.aspectRatio).toBe(90);
    });

    it("Sets up an FOV and gets id", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        expect(fov.identifier).toBe("Camera 1");
    });

    it("Sets up an FOV and gets a point on the ellipsoid", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -4.946793, 56.615756, 900.0], 60, 1, 90, -90, 0, 100, 3000
        );
        fov.getCamPointPercent(viewer.scene, new Cartesian2(0.0, 0.0), fov.scene.globe.ellipsoid);
    });

    it("Sets up an FOV and gets a point on the ellipsoid", function() {
        const fov = new FOV(
            "Camera 1", viewer.scene, [ -4.946793, 56.615756, 900.0], 60, 1, 90, -90, 0, 100, 3000
        );
        fov.getCamPointPercent(viewer.scene, new Cartesian2(0.0, 0.0), fov.scene.globe.ellipsoid);
    });
});

