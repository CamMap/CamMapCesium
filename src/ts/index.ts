import * as Cesium from "cesium_source/Cesium";
require('../css/main.css');
require('cesium_source/Widgets/widgets.css');

import { make_fov } from "./fov";

//var viewer = new Cesium.Viewer('cesiumContainer');
//var widget = new Cesium.CesiumWidget("cesiumContainer");

//var terrain = Cesium.createDefaultTerrainProviderViewModels();
var viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false
    // terrainProviderViewModels: terrain,
    // selectedTerrainProviderViewModel: terrain[1]
});

/*
See https://www.cesium.com/docs/tutorials/creating-entities/
for creating entities
*/

// A massive Red Sphere, wouldn't be this big in the application
var redSphere = viewer.entities.add({
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
var line = viewer.entities.add({
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([-107.0, 40.0, 30000,
        -107.0, 30.0, 3000]),
        width: 5,
        material: Cesium.Color.RED
    }
});

// A FOV frustum
let fov: Cesium.Entity[] = make_fov([-105, 25, 100000], 10, 0, 0, 600000);

let fov_2: Cesium.Entity[] = make_fov([-105, 20, 100000], 10, 0, 0, 600000);

let fov_3: Cesium.Entity[] = make_fov([-105, 15, 100000], 10, 0, 0, 600000);


for (var e of fov) {
    viewer.entities.add(e);
}

for (var e of fov_2) {
    viewer.entities.add(e);
}

for (var e of fov_3) {
    viewer.entities.add(e);
}

// Fly the Camera to a point
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    }
});
