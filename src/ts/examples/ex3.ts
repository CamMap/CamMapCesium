/**
 * This shoud run correcly and could be used for a test, if it does not run
 * something must be failing.  To use this, require() this in index.
 *
 * This example draws a red sphere and a line comming out of it.
 * The camera also flys to and centers on the red circle.
 *
 * @packageDocumentation
 */

/* eslint @typescript-eslint/no-magic-numbers: off */

import * as Cesium from "cesium_source/Cesium";

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

// A massive Red Sphere, wouldn't be this big in the application
viewer.entities.add({
    name: "Red sphere with black outline",
    position: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 30000.0),
    ellipsoid: {
        radii: new Cesium.Cartesian3(30000.0, 30000.0, 30000.0),
        material: Cesium.Color.RED.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
    },
});

// A line
viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([-107.0, 40.0, 30000,
            -107.0, 30.0, 3000]),
        width: 5,
        material: Cesium.Color.RED,
    },
});

// Fly the Camera to a point
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    },
});
