/**
 * This shoud run correcly and could be used for a test, if it does not run
 * something must be failing.  The use this, require() this in index.
 * 
 * This example displays a camera view with 4 lines pointing from each corner.
 * to points on the surface of the Earth.
 * @packageDocumentation
 */

import * as Cesium from "cesium_source/Cesium";
import { FOV } from "./../fov";

// Set up basic viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false
});

/*
See https://www.cesium.com/docs/tutorials/creating-entities/
for creating entities
*/

// Create a new fov
const fov_cam = new FOV(viewer, [-107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000);

// Draw a the actual camera view
fov_cam.draw(viewer.scene);

// Draw a debug camera view to make sure they are kept in check
fov_cam.draw_debug_camera(viewer.scene);

// Draw line to Top Right, Top Left
fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(0.0, 0.0),
    viewer.scene.globe.ellipsoid);

// Draw line to Bottom Right, Top Left
fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(1.0, 0.0),
    viewer.scene.globe.ellipsoid);

// Draw line to Top Right, Bottom Left
fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(0.0, 1.0),
    viewer.scene.globe.ellipsoid);

// Draw line to Bottom Right, Bottom Left
fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(1.0, 1.0),
    viewer.scene.globe.ellipsoid);

// Set the camera to look at the view cone
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    }
});