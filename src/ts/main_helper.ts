import * as Cesium from "cesium_source/Cesium";
import { CanvasHandler } from "./canvasHandler";
import { Cartesian2 } from "cesium_source/Cesium";
import { FOV } from "./fov";
import { GeneralLogger } from "./logger";
import { Image } from "./image";
import { Video } from "./video";

/* eslint @typescript-eslint/no-magic-numbers: off */

/**
 * Set up the image in an example
 *
 * @param fov - The FOV object the image should modify, metadata dependent
 */
function imageSetup(fov: FOV){
    //Create a new imageHandler
    const imageHandler = new Image();
    imageHandler.onImageMetadataRead((imageGeoMetadata) => {
        if(imageGeoMetadata.latitude != null){
            fov.latitude = imageGeoMetadata.latitude;
        } else {
            GeneralLogger.warn("No latitude metadata parsed in the image");
        }
        if(imageGeoMetadata.longtitude != null){
            fov.longitude = imageGeoMetadata.longtitude;
        } else {
            GeneralLogger.warn("No longtitude metadata parsed in the image");
        }
        if(imageGeoMetadata.bearing != null){
            fov.heading = imageGeoMetadata.bearing;
        } else {
            GeneralLogger.warn("No bearing/heading metadata parsed in the image");
        }
    });
}

/**
 * Setup the video logging
 */
function videoSetup(){
    new Video();
}

/**
 * Set up the canvas
 *
 * @param fov - The FOV object to draw the dots from (to hit the Earth)
 */
function canvasSetUp(fov: FOV){
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
            fov.drawLineFromPercentToScreen(fov.scene, precentPoints, fov.scene.globe.ellipsoid);
        });
    }
}

/**
 * Set up the fov event triggers
 *
 * @param fov - The FOV on which to set up the event triggers
 */
function FOVEventTriggerSetup(fov: FOV){
    fov.setUpDistanceListener(document.getElementById("cam_dist") as HTMLInputElement);
    fov.onDistanceChanged((val) => {
        (document.getElementById("cam_dist_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpPosListener(document.getElementById("cam_height") as HTMLInputElement);
    fov.onPosChanged((val) => {
        (document.getElementById("cam_height_result") as HTMLOutputElement).value = String(val); console.log("Called");
    });

    fov.setUpHeadingListener(document.getElementById("cam_heading") as HTMLInputElement);
    fov.onHeadingChanged((val) => {
        (document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpTiltListener(document.getElementById("cam_tilt") as HTMLInputElement);
    fov.onTiltChanged((val) => {
        (document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpFOVListener(document.getElementById("fov_hor") as HTMLInputElement);
    fov.onFOVChanged((val) => {
        (document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpFOVListener(document.getElementById("fov_hor") as HTMLInputElement);
    fov.onFOVChanged((val) => {
        (document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(val);
    });
}

/**
 * @param camera - The camera to set the view
 */
function setCameraView(camera: Cesium.Camera){
    // Set the camera to look at the view cone
    camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(-4.946793, 56.615756, 10000.0),
        orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
        },
    });
}

/**
 * Sets up the terrain server button in the slidinng menu
 * allowing for connecting to a terrain server and using it as a layer
 *
 * @param scene - The cesium scene onto which to add the terrain layer
 */
export function setupTerrainServerConnectButton(scene: Cesium.Scene): void{
    const terSerButton = document.getElementById("terSerButton");
    if(terSerButton != null){
        terSerButton.onclick = () => {
            const terSerText = document.getElementById("terSer");
            if(terSerText != null){
                const serverToConnectTo = (terSerText as HTMLInputElement).value;
                if(serverToConnectTo != null){
                    GeneralLogger.info("Attempting to connect to terrain server with address: " + serverToConnectTo);
                    scene.terrainProvider = new Cesium.CesiumTerrainProvider({
                        url : serverToConnectTo,
                    });
                }
            } else {
                GeneralLogger.warn("Could not find terrain server connect button, will be unable to add a terrain server, was this id renamed in the HTML?");
            }
        };
    }

    // Just set the terrain provider to the default flat EllipsoidTerrainProvider on disconnect
    const terSerButtonDisconnect = document.getElementById("terSerButtonDisconnect");
    if(terSerButtonDisconnect != null){
        terSerButtonDisconnect.onclick = () => {
            scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        };
    }
}


/**
 * Set up everything and return the viewer and the FOV objects
 *
 * @returns The viewer and the FOV object which have been created
 */
export function generalBaseSetup(): [Cesium.Viewer, FOV]{
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

    setupTerrainServerConnectButton(viewer.scene);

    // Create a new fov
    const fovCam = new FOV(
        viewer.scene, [ -4.946793, 56.615756, 10.0], 60, 1, 90, 90, 0, 100, 3000
    );

    imageSetup(fovCam);
    videoSetup();
    canvasSetUp(fovCam);

    FOVEventTriggerSetup(fovCam);

    fovCam.drawDebugCamera(viewer.scene);
    fovCam.setShouldDrawEdgeLines(true);

    setCameraView(viewer.camera);

    return [viewer, fovCam];
}

/**
 * A wrapper over `FOV.setUpVGIPWebSocket()`, just so main does not need to change
 * if the underlying implementation does
 *
 * TODO change this to use an interface for recieving VGIP connections
 * And should return boolean representing success
 *
 * @param fov - The FOV camera
 * @param websocketAddress - The websocket address to connect to
 */
export function setUpVGIPWebSocket(fov: FOV, websocketAddress: string): void{
    fov.setUpVGIPWebSocket(websocketAddress);
}
