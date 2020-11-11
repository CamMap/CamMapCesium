/**
 * This shoud run correcly and could be used for a test, if it does not run
 * something must be failing.  To use this, require() this in index.
 *
 * This example draws an FOV and displays a red rectangle enclosing it on Earth.
 * @packageDocumentation
 */

/* eslint @typescript-eslint/no-magic-numbers: off */

import * as Cesium from "cesium_source/Cesium";
import { FOV } from "./../fov";

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
    viewer, [-107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
);

// Draw a the actual camera view
fovCam.draw(viewer.scene);

// Draw a debug camera view to make sure they are kept in check
fovCam.drawDebugCamera(viewer.scene);

// Add a rectangle to the Earth enclosing what the camera can see
const r = fovCam.getCameraRect(viewer.scene.globe.ellipsoid);
viewer.entities.add({
    name: "Cam Rect",
    rectangle: {
        coordinates: r,
        material: Cesium.Color.RED.withAlpha(0.5),
    },

});

// Set the camera to look at the view cone
viewer.camera.setView({
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        pitch: Cesium.Math.toRadians(-90.0),
    },
});
