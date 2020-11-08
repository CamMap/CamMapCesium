import * as Cesium from "cesium_source/Cesium";
import CameraViewModel from './cameraViewModel';

//TODO: someone migrate this to ES6 later on
require('../css/main.css');
require('cesium_source/Widgets/widgets.css');
require('./image');

// setup cesium root panel reference;
const cesiumRoot = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false
});

// set default view
cesiumRoot.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-4.291606, 55.873704, 30.0),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
    }
});

const viewModel = new CameraViewModel(cesiumRoot);
