/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Cartesian2, Cartesian3, Polyline, Viewer} from "cesium_source/Cesium";
import { FOV } from "../../src/ts/fov";

describe("FOV tests", function() {
    let viewer : Viewer;
    beforeAll(() => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        container.id = "Test";
        viewer = new Viewer("Test");
    });

    it("Sets up an FOV", function() {
        new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
    });

    it("Sets up an FOV and sets latitude", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.latitude = 100;
        fov.latitude += 10;
        fov.latitude -= 20;
        expect(fov.latitude).toBe(90);
    });

    it("Sets up an FOV and sets longitude", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.longitude = 100;
        fov.longitude += 10;
        fov.longitude -= 20;
        expect(fov.longitude).toBe(90);
    });

    it("Sets up an FOV and sets position", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.position = new Cartesian3(10, 9, 8);
        fov.position = Cartesian3.add(fov.position, new Cartesian3(10, 10, 10), new Cartesian3(0, 0, 0));
        expect(fov.position).toEqual(new Cartesian3(20, 19, 18));
    });

    it("Sets up an FOV and sets distance", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.distance = 11000;
        fov.distance += 100;
        fov.distance -= 200;
        expect(fov.distance).toBe(10900);
    });


    it("Sets up an FOV and sets elevation", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.elevation = 100;
        fov.elevation += 10;
        fov.elevation -= 20;
        expect(fov.elevation).toBe(90);
    });

    it("Sets up an FOV and sets heading", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.heading = 100;
        fov.heading += 10;
        fov.heading -= 20;
        expect(fov.heading).toBe(90);
    });

    it("Sets up an FOV and sets tilt", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.tilt = 100;
        fov.tilt += 10;
        fov.tilt -= 20;
        expect(fov.tilt).toBe(90);
    });

    it("Sets up an FOV and sets roll", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.roll = 100;
        fov.roll += 10;
        fov.roll -= 20;
        expect(fov.roll).toBe(90);
    });

    it("Sets up an FOV and sets the FOV degree", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.fovDeg = 1;
        fov.fovDeg += 1;
        fov.fovDeg -= 1.9;
        expect(parseFloat(fov.fovDeg.toPrecision(2))).toBe(0.1);
    });

    it("Sets up an FOV and sets aspect ratio", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.aspectRatio = 100;
        fov.aspectRatio += 10;
        fov.aspectRatio -= 20;
        expect(fov.aspectRatio).toBe(90);
    });

    it("Sets up an FOV and gets name", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000, "Camera 1"
        );
        expect(fov.name).toBe("Camera 1");
    });

    it("Sets up an FOV and gets a point on the ellipsoid", function() {
        const fov = new FOV(
            viewer.scene, [ -4.946793, 56.615756, 900.0], 60, 1, 90, -90, 0, 100, 3000
        );
        const point = fov.getCamPointPercent(viewer.scene, new Cartesian2(0.0, 0.0), fov.scene.globe.ellipsoid);
        expect(point).toBeInstanceOf(Cartesian3);
    });

    it("Sets up an FOV and gets a point on the ellipsoid using ray casting", function() {
        const fov = new FOV(
            viewer.scene, [ -4.946793, 56.615756, 900.0], 60, 1, 90, -90, 0, 100, 3000
        );
        const point = fov.drawLineFromPercentToScreen(viewer.scene, new Cartesian2(0.5, 0.5), fov.scene.globe.ellipsoid);
        expect(point).toBeNull();
    });

    it("should check if the point is visible to the camera", function() {
        const fov = new FOV(
            viewer.scene, [ -4.946793, 56.615756, 900.0], 60, 1, 90, -90, 0, 100, 3000
        );
        const point = fov.drawLineFromPercentToScreen(viewer.scene, new Cartesian2(0.5, 0.5), fov.scene.globe.ellipsoid);
        fov.elevation = 900;
        expect(point).toBeNull();
        if(point){
            expect(fov.getLineById(point.id)).toBeInstanceOf(Polyline);
            fov.tilt = 0;
            expect(fov.getLineById(point.id)).toBeNull();
        }
    });
});

