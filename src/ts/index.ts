import * as Cesium from "cesium_source/Cesium";
require('../css/main.css');
require('cesium_source/Widgets/widgets.css');
require('./image');

import { FOV } from "./fov";

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
fov_cam.draw(viewer.scene);
fov_cam.draw_debug_camera(viewer.scene);

const r = fov_cam.getCameraRect(viewer.scene.globe.ellipsoid);
viewer.entities.add({
    name: "Cam Rect",
    rectangle: {
        coordinates: r,
        material: Cesium.Color.RED.withAlpha(0.5)
    },

});

fov_cam.drawLineFromPixelToScreen(viewer,
    new Cesium.Cartesian2(100, 200),
    viewer.scene.globe.ellipsoid);

fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(1.0, 1.0),
    viewer.scene.globe.ellipsoid);

fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(1.0, 0.0),
    viewer.scene.globe.ellipsoid);

fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(0.0, 0.0),
    viewer.scene.globe.ellipsoid);

fov_cam.drawLineFromPercentToScreen(viewer,
    new Cesium.Cartesian2(0.0, 1.0),
    viewer.scene.globe.ellipsoid);

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
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([-107.0, 40.0, 30000, -107.0, 30.0, 3000]),
        width: 5,
        material: Cesium.Color.RED
    }
});

// Fly the Camera to a point
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    }
});

//viewer.camera.lookAt(Cesium.Cartographic.toCartesian(Cesium.Rectangle.center(r), viewer.scene.globe.ellipsoid), new Cesium.Cartesian3(1, 1, 1));
