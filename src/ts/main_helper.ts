/* eslint-disable sort-imports */
//I cant figure out how this is not in aphabetical order...
import * as Cesium from "cesium_source/Cesium";
import { CanvasHandler } from "./canvasHandler";
import { Cartesian2 } from "cesium_source/Cesium";
import { Config } from "./configHandler";
import { FOV } from "./fov";
import { GeneralLogger } from "./logger";
import { globalPoints} from "./globalObjects";
import { Image } from "./image";
import { TLMFovElement, TLMPointElement} from "./targetManager";
import { Video } from "./video";


/* eslint @typescript-eslint/no-magic-numbers: off */

/**
 * Set up the image in an example
 *
 * @param fov - The FOV object the image should modify, metadata dependent
 */
export function imageSetup(fov: FOV) : void{
    //Create a new imageHandler
    const imageHandler = new Image(fov);
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

    fov.onDistanceChanged(() => {
        imageHandler.redrawImage();
    });

    fov.onPosChanged(() => {
        imageHandler.redrawImage();
    });

    fov.onHeadingChanged(() => {
        imageHandler.redrawImage();
    });

    fov.onTiltChanged(() => {
        imageHandler.redrawImage();
    });

    fov.onFOVChanged(() => {
        imageHandler.redrawImage();
    });

    fov.onFOVChanged(() => {
        imageHandler.redrawImage();
    });
}

/**
 * Setup the video logging
 *
 * @param fov - FOV object
 */
export function videoSetup(fov : FOV) : void{
    new Video(fov);
}

/**
 * Set up the canvas
 *
 * @param fov - The FOV object to draw the dots from (to hit the Earth)
 */
export function canvasSetUp(fov: FOV) : void{
    // Get the canvas and listen for clicks
    const canvas = document.getElementById(fov.identifier + "canvas");
    if(canvas != null && canvas instanceof HTMLCanvasElement){
        const ch = new CanvasHandler(canvas);
        const span = document.getElementById(fov.identifier + "image-cord");
        ch.onClick(([x, y]) => {
            if(span != null){
                span.innerText = `X: ${x}, Y: ${y}`;
            }
            const precentPoints = new Cartesian2(Number(y / canvas.clientHeight), Number(x / canvas.clientWidth));
            const point = fov.drawLineFromPercentToScreen(fov.scene, precentPoints, fov.scene.globe.ellipsoid);
            if(point != null){
                new TLMPointElement(point);
            }


            //Const p = fov.getCamPointPercent(fov.scene, precentPoints, fov.scene.globe.ellipsoid);
            //If(p != null){
            //   Fov.getPointFromMapOnScreen(p);
            //}
        });
    }
}

/**
 * Set up the fov event triggers
 *
 * @param fov - The FOV on which to set up the event triggers
 */
export function FOVEventTriggerSetup(fov: FOV) : void{
    fov.setUpDistanceListener(document.getElementById(fov.identifier + "cam_dist") as HTMLInputElement);
    fov.onDistanceChanged((val) => {
        (document.getElementById(fov.identifier + "cam_dist_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpPosListener(document.getElementById(fov.identifier + "cam_height") as HTMLInputElement);
    fov.onPosChanged((val) => {
        (document.getElementById(fov.identifier + "cam_height_result") as HTMLOutputElement).value = String(val); console.log("Called");
    });

    fov.setUpHeadingListener(document.getElementById(fov.identifier + "cam_heading") as HTMLInputElement);
    fov.onHeadingChanged((val) => {
        (document.getElementById(fov.identifier + "cam_heading_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpTiltListener(document.getElementById(fov.identifier + "cam_tilt") as HTMLInputElement);
    fov.onTiltChanged((val) => {
        (document.getElementById(fov.identifier + "cam_tilt_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpFOVListener(document.getElementById(fov.identifier + "fov_hor") as HTMLInputElement);
    fov.onFOVChanged((val) => {
        (document.getElementById(fov.identifier + "fov_hor_result") as HTMLOutputElement).value = String(val);
    });

    fov.setUpFOVListener(document.getElementById(fov.identifier + "fov_hor") as HTMLInputElement);
    fov.onFOVChanged((val) => {
        (document.getElementById(fov.identifier + "fov_hor_result") as HTMLOutputElement).value = String(val);
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
 * @param config -  the config for the application
 * @returns The viewer and the FOV object which have been created
 */
export function generalBaseSetup(config?: Config): Cesium.Viewer{
    // The tiles used below are open source at https://github.com/stamen/terrain-classic
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
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
        imageryProvider: imageryProvider,
        terrainProvider: config ? config.defaultTerrainServer ? new Cesium.CesiumTerrainProvider({
            url : config.defaultTerrainServer,
        }) : undefined : undefined,
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;

    const fov = new FOV(
        "Camera 1", viewer.scene, [ -4.946793, 56.615756, 10.0], 60, 1, 90, 90, 0, 100, 3000
    );
    viewer.scene.primitives.add(globalPoints);

    new TLMFovElement(fov, null);
    //
    // See https://www.cesium.com/docs/tutorials/creating-entities/
    // For creating entities
    //
    setupTerrainServerConnectButton(viewer.scene);
    setCameraView(viewer.camera);

    return viewer;
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

//TODO: needs to changed so all point ids generated from global counter
let numFormPoints = 0;

/**
 * Adds a new point to the map from given coordinates
 *
 * @param lat - latitude of the point
 * @param long - longitude of the point
 * @returns Cesium point generated
 */
export function addPoint(lat: number, long: number) : Cesium.PointPrimitive {
    numFormPoints += 1;
    const point = globalPoints.add({
        id: "form" + "Point" + numFormPoints.toString(),
        position: Cesium.Cartesian3.fromDegrees(lat, long),
        color: Cesium.Color.GREEN,
        pixelSize: 10,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    });
    return point;
}
