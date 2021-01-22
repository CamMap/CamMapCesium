import {FOV} from "../../src/ts/fov";
import { Viewer } from "cesium_source/Cesium";

//Import fov = require("./fov");
//Const FOV = fov.FOV;
//Cartographic, Scene,
/* eslint @typescript-eslint/no-magic-numbers: off */

describe("Sample test", function() {
    it("Condition is true", function() {
        expect("AngularJS").toBe("AngularJS");
    });
});

describe("Sample test", function() {
    it("Condition is true", function() {
        const c = document.createElement("canvas");
        c.width = 10;
        c.height = 10;
        c.id = "ID";
        document.body.appendChild(c);


        const viewer = new Viewer("ID", {
            animation: false,
            timeline: false,
            geocoder: false,
            selectionIndicator: false,
            infoBox: false,
            vrButton: false,
            fullscreenButton: false,
        });


        //  Const s = new Scene({
        //     Canvas: c,
        // });
        new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
    });
});

/*
Test("FOV starts correctly", () => {
    expect(Cartographic.toCartesian(Cartographic.fromDegrees(40.0, -107.0, 100000.0))).toStrictEqual(Cartographic.toCartesian(Cartographic.fromDegrees(40.0, -107.0, 100000.0)));
});

test("Set FOV.position", () => {
    expect(true).toBe(true);
});

test("Get FOV.position", () => {
    expect(false).toBe(false);
});


test("FOV starts correctly", () => {
    //Const c = new OffscreenCanvas(1, 1);
    //Const c = new HTMLCanvasElement();
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    const s = new Scene({
        canvas: c,
    });
    const fovCam = new FOV(
        s, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
    );
});*/
