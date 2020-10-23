import * as Cesium from "cesium_source/Cesium";
require('../css/main.css');
require('cesium_source/Widgets/widgets.css');

import { calc_lat_long } from "./latlong";

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
/*
var greenBox = viewer.entities.add({
    name: "Green box with beveled corners and outline",
    polylineVolume: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            -90.0,
            32.0,
            0.0,
            -90.0,
            36.0,
            100000.0,
            //-94.0,
            // 36.0,
            // 0.0,
        ]),
        shape: [
            new Cesium.Cartesian2(-50000, -50000),
            new Cesium.Cartesian2(100000, -100000),
            new Cesium.Cartesian2(50000, 50000),
            new Cesium.Cartesian2(-50000, 50000),
        ],
        cornerType: Cesium.CornerType.BEVELED,
        material: Cesium.Color.GREEN.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
    },
});*/

var orangePolygon = viewer.entities.add({
    name: "Orange polygon with per-position heights and outline",
    polygon: {
        hierarchy: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                -105.0,
                25.0,
                100000,
                -103.0,
                25.0,
                100000,
                -100.0,
                30.0,
                300000,
                -108.0,
                30.0,
                300000,
            ]),
            holes: []
        },
        extrudedHeight: 0,
        perPositionHeight: true,
        material: Cesium.Color.ORANGE.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
    },
});

// Fly the Camera to a point
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 700000.0), //Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
    }
});
