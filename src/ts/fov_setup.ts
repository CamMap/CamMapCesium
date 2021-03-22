/**
 * Functions to set up all the FOV-HTML connections
 *
 * @packageDocumentation
 */

import * as constants from "./consts";
import { CanvasHandler } from "./canvasHandler";
import { Cartesian2 } from "cesium_source/Cesium";
import { FOV } from "./fov";
import { GeneralLogger } from "./logger";
import { Image } from "./image";
import { VGIPReciever } from "./vgipReciever";
import { Video } from "./video";
import { VideoGeoData } from "./vgip";

/**
 * Sets up the sliders for a given fov object
 *
 * @param fov -The fov object
 */
export function FOVEventTriggerSetup(fov: FOV) : void{
    fov.onPosChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_HEIGHT) as HTMLElement).innerHTML = "Height: " + String(val);
    });

    fov.onTiltChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_TILT) as HTMLElement).innerHTML = "Tilt: " + String(val);
    });

    fov.onHeadingChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_HEADING) as HTMLElement).innerHTML = "Heading: " + String(val);
    });

    fov.onFOVChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_FOVDEG) as HTMLElement).innerHTML = "FovDeg: " + String(val);
    });

    // Setup HTML interaction

    fov.setUpDistanceListener(document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_DISTANCE) as HTMLInputElement);
    fov.onDistanceChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_DISTANCE + constants.FOV_IDENTIFIER_CAM_RESULT_SUFFIX) as HTMLOutputElement).value = String(val);
    });

    fov.setUpPosListener(document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HEIGHT) as HTMLInputElement);
    fov.onPosChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HEIGHT + constants.FOV_IDENTIFIER_CAM_RESULT_SUFFIX) as HTMLOutputElement).value = String(val); console.log("Called");
    });

    fov.setUpHeadingListener(document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HEADING) as HTMLInputElement);
    fov.onHeadingChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HEADING + constants.FOV_IDENTIFIER_CAM_RESULT_SUFFIX) as HTMLOutputElement).value = String(val);
    });

    fov.setUpTiltListener(document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_TILT) as HTMLInputElement);
    fov.onTiltChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_TILT + constants.FOV_IDENTIFIER_CAM_RESULT_SUFFIX) as HTMLOutputElement).value = String(val);
    });

    fov.setUpFOVListener(document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HOR) as HTMLInputElement);
    fov.onFOVChanged((val) => {
        (document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CAM_HOR + constants.FOV_IDENTIFIER_CAM_RESULT_SUFFIX) as HTMLOutputElement).value = String(val);
    });
}

/**
 * Set up the image in an example
 *
 * @param fov - The FOV object the image should modify, metadata dependent
 */
export function FOVImageSetup(fov: FOV) : void{
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
export function FOVVideoSetup(fov : FOV) : void{
    new Video(fov);
}

/**
 * Set up the canvas
 *
 * @param fov - The FOV object to draw the dots from (to hit the Earth)
 */
export function FOVCanvasSetUp(fov: FOV) : void{
    // Get the canvas and listen for clicks
    const canvas = document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CANVAS);
    if(canvas != null && canvas instanceof HTMLCanvasElement){
        const ch = new CanvasHandler(canvas);
        const span = document.getElementById(fov.identifier + constants.FOV_IDENTIFIER_CANVAS_COORD);
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
 * A wrapper over `FOV.setUpVGIPWebSocket()`, just so main does not need to change
 * if the underlying implementation does
 *
 * TODO change this to use an interface for recieving VGIP connections
 * And should return boolean representing success
 *
 * @param fov - The FOV camera
 * @param websocketAddress - The websocket address to connect to
 */
export function FOVVGIPWebSocketSetUp(fov: FOV, websocketAddress: string): void{
    /**
     * Set up a websocket to recieve geolocation data and dynamically modify the camera based on it
     *
     * @param address - The URL of the websocket which serves the geodata
     */

    const vgipReciever = new VGIPReciever();
    vgipReciever.addWebSocketWithAddress(websocketAddress);
    vgipReciever.onRecieveData((geoData: VideoGeoData) => {
        // Modify the lat, long, heading ... depending on what was recieved

        if(geoData.latitude != null && geoData.latitude != undefined){
            fov.latitude = geoData.latitude;
        }

        if(geoData.longitude != null && geoData.longitude != undefined){
            fov.longitude = geoData.longitude;
        }

        if(geoData.bearing != null && geoData.bearing != undefined){
            fov.heading = geoData.bearing;
        }

        if(geoData.tilt != null && geoData.tilt != undefined){
            fov.tilt = geoData.tilt;
        }

        if(geoData.heading != null && geoData.heading != undefined){
            fov.roll = geoData.heading;
        }
    });
}
