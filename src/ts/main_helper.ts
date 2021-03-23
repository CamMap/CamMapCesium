/* eslint-disable sort-imports */
//I cant figure out how this is not in aphabetical order...
import * as Cesium from "cesium_source/Cesium";
import * as constants from "./consts";
import { Config } from "./configHandler";
import { FOV } from "./fov";
import { GeneralLogger } from "./logger";
import { globalPoints} from "./globalObjects";
import { TLMFovElement} from "./targetManager";
import { Video } from "./video";


/* eslint @typescript-eslint/no-magic-numbers: off */


/**
 * Setup the video logging
 *
 * @param fov - FOV object
 */
export function videoSetup(fov : FOV) : void{
    new Video(fov);
}

/**
 * @param camera - The camera to set the view
 * @param lat - camera latitude
 * @param lng - camera longtitude
 * @param elevation - camera elevation
 */
export function setCameraView(
    camera: Cesium.Camera, lat: number, lng: number, elevation: number
): void{
    // Set the camera to look at the view cone
    camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, elevation),
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
    const terSerButton = document.getElementById(constants.TERRAIN_SERVER_BUTTON);
    if(terSerButton != null){
        terSerButton.onclick = () => {
            const terSerText = document.getElementById(constants.TERRAIN_SERVER);
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
    const terSerButtonDisconnect = document.getElementById(constants.TERRAIN_SERVER_DISCONNECT);
    if(terSerButtonDisconnect != null){
        terSerButtonDisconnect.onclick = () => {
            scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();
        };
    }
}


/**
 * Set up base and return the viewer and the FOV objects
 *
 * @returns The viewer and the FOV object which have been created
 */
export function generalBaseSetup(): Cesium.Viewer{
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
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.scene.primitives.add(globalPoints);

    //
    // See https://www.cesium.com/docs/tutorials/creating-entities/
    // For creating entities
    //
    setupTerrainServerConnectButton(viewer.scene);

    return viewer;
}

/**
 * Applies the config to the viewer
 *
 * @param viewer -  viewer
 * @param config -  the config for the application
 */
export function applyConfig(viewer:Cesium.Viewer, config?: Config): void{
    if(config?.defaultTerrainServer) {
        viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
            url : config.defaultTerrainServer,
        });
    }
    if(config?.cameras) {
        config.cameras.forEach(camera => {
            const fov = new FOV(
                viewer.scene, [ camera.lng, camera.lat, camera.elevation], camera.fov, camera.aspectRatio, camera.theta, camera.phi, camera.roll, camera.near, camera.far, camera.name,
            );
            new TLMFovElement(fov, camera.vgip);
        });
    }
    if(config?.position) {
        setCameraView(
            viewer.camera, config.position.lat, config.position.lng, config.position.elevation
        );
    }
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
        position: Cesium.Cartesian3.fromDegrees(long, lat),
        color: Cesium.Color.GREEN,
        pixelSize: 10,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    });
    return point;
}
