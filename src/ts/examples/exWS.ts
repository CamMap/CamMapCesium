/**
 * This should run correcly and could be used for a test, if it does not run
 * something must be failing.  To use this, require() this in index.
 *
 * This example shows how data can be transfered over websockets to allow
 * the data of the camera to be dynamically modified by webserver geolocation data
 *
 * @packageDocumentation
 */

import * as Cesium from "cesium_source/Cesium";
import { FOV } from "./../fov";
import { Image } from "./../image";
import { Video } from "../video";
/* eslint @typescript-eslint/no-magic-numbers: off */

// Set up basic viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false,
});

//
// See https://www.cesium.com/docs/tutorials/creating-entities/
// For creating entities
//

// Create a new fov
const fovCam = new FOV(
    viewer, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
);

//Create a new imageHandler
const imageHandler = new Image(fovCam);
new Video();

//Listen for click events on the canvas
window.onload = () =>{
    imageHandler.addPoints();
};

// Draw a the actual camera view
//FovCam.draw(viewer.scene);

// Draw a debug camera view to make sure they are kept in check
fovCam.drawDebugCamera(viewer.scene);

fovCam.setUpPosListener(document.getElementById("cam_height") as HTMLInputElement);
fovCam.onPosChanged((val) => {
    (document.getElementById("cam_height_result") as HTMLOutputElement).value = String(val); console.log("Called");
});

fovCam.setUpHeadingListener(document.getElementById("cam_heading") as HTMLInputElement);
fovCam.onHeadingChanged((val) => {
    (document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(val);
});

fovCam.setUpTiltListener(document.getElementById("cam_tilt") as HTMLInputElement);
fovCam.onTiltChanged((val) => {
    (document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(val);
});

fovCam.setUpFOVListener(document.getElementById("fov_hor") as HTMLInputElement);
fovCam.onFOVChanged((val) => {
    (document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(val);
});

fovCam.setShouldDrawEdgeLines(true);
fovCam.setUpVGIPWebSocket("ws://localhost:8081");

// Set the camera to look at the view cone
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    },
});
