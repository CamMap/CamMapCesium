/**
 * This shoud run correcly and could be used for a test, if it does not run
 * something must be failing.  To use this, require() this in index.
 *
 * This example displays a camera view with 4 lines pointing from each corner.
 * to points on the surface of the Earth.
 *
 * @packageDocumentation
 */
import * as Cesium from "cesium_source/Cesium";
import { CanvasHandler } from "../canvasHandler";
import { Cartesian2 } from "cesium_source/Cesium";
import { FOV } from "./../fov";
import { GeneralLogger } from "../logger";
import { Image } from "./../image";
import { Video } from "../video";

/* eslint @typescript-eslint/no-magic-numbers: off */

// The tiles used below are open source at https://github.com/stamen/terrain-classic
const terrainProvider = new Cesium.UrlTemplateImageryProvider({
    url : "http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
    credit : "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
});

// Set up basic viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false,
    imageryProvider: terrainProvider,
    terrainProvider : new Cesium.CesiumTerrainProvider({
        url : "http://localhost:8082/tilesets/test_full_OS",
    }),
});
viewer.scene.globe.depthTestAgainstTerrain = true;
//
// See https://www.cesium.com/docs/tutorials/creating-entities/
// For creating entities
//

// Create a new fov
const fovCam = new FOV(
    viewer, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 100, 300000
);

//Create a new imageHandler
const imageHandler = new Image();
imageHandler.onImageMetadataRead((imageGeoMetadata) => {
    if(imageGeoMetadata.latitude != null){
        fovCam.latitude = imageGeoMetadata.latitude;
    } else {
        GeneralLogger.warn("No latitude metadata parsed in the image");
    }
    if(imageGeoMetadata.longtitude != null){
        fovCam.longitude = imageGeoMetadata.longtitude;
    } else {
        GeneralLogger.warn("No longtitude metadata parsed in the image");
    }
    if(imageGeoMetadata.bearing != null){
        fovCam.heading = imageGeoMetadata.bearing;
    } else {
        GeneralLogger.warn("No bearing/heading metadata parsed in the image");
    }
});

new Video();

// Get the canvas and listen for clicks
const canvas = document.getElementById("imageVideoCanvas");
if(canvas != null && canvas instanceof HTMLCanvasElement){
    const ch = new CanvasHandler(canvas);
    const span = document.getElementById("image-cord");
    ch.onClick(([x, y]) => {
        if(span != null){
            span.innerText = `X: ${x}, Y: ${y}`;
        }
        const precentPoints = new Cartesian2(Number(y / canvas.clientHeight), Number(x / canvas.clientWidth));
        fovCam.drawLineFromPercentToScreen(fovCam.viewer, precentPoints, fovCam.viewer.scene.globe.ellipsoid);
    });
}


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

fovCam.setUpDistanceListener(document.getElementById("cam_dist") as HTMLInputElement);
fovCam.onDistanceChanged((val) => {
    (document.getElementById("cam_dist_result") as HTMLOutputElement).value = String(val);
});

//FovCam.setUpAspectRatioListener(document.getElementById("aspect_ratio") as HTMLInputElement);
//FovCam.onAspectRatioChanged((val) => {
//    (document.getElementById("aspect_ratio_result") as HTMLOutputElement).value = String(val);
//});
//
// // Draw line to Top Right, Top Left
// FovCam.drawLineFromPercentToScreen(viewer,
//     New Cesium.Cartesian2(0.0, 0.0),
//     Viewer.scene.globe.ellipsoid);
//
// // Draw line to Bottom Right, Top Left
// FovCam.drawLineFromPercentToScreen(viewer,
//     New Cesium.Cartesian2(1.0, 0.0),
//     Viewer.scene.globe.ellipsoid);
//
// // Draw line to Top Right, Bottom Left
// FovCam.drawLineFromPercentToScreen(viewer,
//     New Cesium.Cartesian2(0.0, 1.0),
//     Viewer.scene.globe.ellipsoid);
//
// // Draw line to Bottom Right, Bottom Left
// FovCam.drawLineFromPercentToScreen(viewer,
//     New Cesium.Cartesian2(1.0, 1.0),
//     Viewer.scene.globe.ellipsoid);
//
fovCam.setShouldDrawEdgeLines(true);

// Set the camera to look at the view cone
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    },
});
