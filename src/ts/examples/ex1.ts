/**
 * This shoud run correcly and could be used for a test, if it does not run
 * something must be failing.  The use this, require() this in index.
 * 
 * This example draws an FOV and displays a red rectangle enclosing it on Earth.
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

// Add a rectangle to the Earth enclosing what the camera can see
const r = fov_cam.getCameraRect(viewer.scene.globe.ellipsoid);
viewer.entities.add({
    name: "Cam Rect",
    rectangle: {
        coordinates: r,
        material: Cesium.Color.RED.withAlpha(0.5)
    },

});

// Set the camera to look at the view cone
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    }
});