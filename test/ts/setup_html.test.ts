/* eslint @typescript-eslint/no-magic-numbers: off */
import * as canvasImage from "../../src/ts/image";
import { Cartesian2, Math, PointPrimitive, Polyline, Viewer } from "cesium_source/Cesium";
import { TLMFovElement, TLMPointElement } from "../../src/ts/targetManager";
import { addPoint, generalBaseSetup, setCameraView } from "../../src/ts/main_helper";
import { globalFOV, globalPoints } from "../../src/ts/globalObjects";
import { ConfigHandler } from "../../src/ts/configHandler";
import { FOV } from "../../src/ts/fov";
import { GeneralLogger } from "../../src/ts/logger";


let viewer : Viewer;

/**
 * HTML setup
 */
function setup() {
    document.body.innerHTML = "";
    const xhr = new XMLHttpRequest();
    /**
     * Load HTML document and append to test enviroment
     */
    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            document.body.innerHTML = xhr.responseText;
            addCss("/base/test-dist/css/main.css");
            addCss("/base/test-dist/css/sidebar.css");
            const mapContainer = document.getElementById("cesiumContainer") as HTMLElement;
            for(const child of mapContainer.children){
                mapContainer.removeChild(child);
            }
            viewer = generalBaseSetup();
            require("../../src/ts/index");
        }
    };

    xhr.open("get", "/base/test-dist/index.html", false);
    xhr.send();

    /**
     * @param fileName - css stylesheet name
     */
    function addCss(fileName : string) {
        const head = document.head;
        const link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = fileName;

        head.appendChild(link);
    }
}

/**
 * Funky JS sleep function
 *
 * @param ms - time in ms
 * @returns - A promise
 */
function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


describe("Tests requiring HTML setup", function() {
    beforeAll((done) => {
        //Wait for tiles to be loaded in
        return new Promise(resolve => {
            setup();
            resolve(true);
        }).then(()=>{
            setCameraView(
                viewer.camera, -4.946793, 56.615756, 5000
            );
        }).then(() => {
            viewer.scene.globe.tileLoadProgressEvent.addEventListener(async function(tiles){
                if(tiles == 0){
                    //Sleep primarly for local testing. Raycasting can fail because tiles still not loaded in
                    //Adjust when running locally
                    await sleep(1000);
                    done();
                }
            });
        });
    }, 40000);

    it("should set up FOV and Point TLMs, select them, and destroy them", function() {
        //Test setup
        const point = addPoint(0, 0);
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );

        //Check TLMs are set up correctly
        const pointTLM = new TLMPointElement(point);
        const fovTLM = new TLMFovElement(fov, null);

        expect(pointTLM).toBeInstanceOf(TLMPointElement);
        expect(fovTLM).toBeInstanceOf(TLMFovElement);

        //Check that point HTML is changed when clicked
        pointTLM.togglePoint();
        const selectPoint = document.getElementById(point.id + "point") as HTMLElement;
        expect(selectPoint.childNodes[1].textContent as string).toBe("Selected");
        pointTLM.togglePoint();
        expect(selectPoint.childNodes[1].textContent as string).toBe("Select");

        //Check that fov HTML is changed when clicked
        fovTLM.toggleFOV();
        const selectFov = document.getElementById(fov.identifier) as HTMLElement;
        expect(selectFov.childNodes[1].textContent as string).toBe("Selected");
        fovTLM.toggleFOV();
        expect(selectPoint.childNodes[1].textContent as string).toBe("Select");

        //Check fov HTML is destroyed
        fovTLM.destroy();
        expect(document.getElementById(fov.identifier)).toBeNull();

        //Check point HTML is destroyed
        pointTLM.destroy();
        expect(document.getElementById(point.id + "point")).toBeNull();
    });

    it("should add image to canvas", function(){
        //Setup test
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        new TLMFovElement(fov, null);
        const image = new canvasImage.Image(fov);
        const img = new Image();
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d") as CanvasRenderingContext2D;

        //TODO: Replace image with one that has geodata
        img.src = "/Images/EiffelTowerPublicDomain.jpg";
        /**
         * Make sure the onload event is fired before finishing test
         */
        return new Promise(resolve => {
            /**
             * Wait till the img has loaded
             * Creates an image blob to pass into a function that requires a file
             */
            img.onload = function() {
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                c.toBlob(function(blob) {
                    const imgFile = new File([blob as Blob], "image.png");
                    //This is hard to test as the function calls onload() so the tests are getting executed before the function returns
                    //Possible add another promise?
                    image.showUploadedImage(imgFile);
                    resolve(true);
                }, "image/jpeg", 0.75);
            };
        });
    });

    it("should submit a fov form", function(){
        const numOfFOVs = globalFOV.length;
        (document.getElementById("fov_name") as HTMLInputElement).value = "Camera1";
        (document.getElementById("fov_lat") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_long") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_elev") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_fovDeg") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_ratio") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_head") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_tilt") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_roll") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_near") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("fov_far") as HTMLInputElement).valueAsNumber = 11;
        (document.getElementById("submitFov") as HTMLInputElement).click();
        expect(globalFOV.length).toBe(numOfFOVs + 1);
    });

    it("should submit a point form", function(){
        const numOfPoints = globalPoints.length;
        (document.getElementById("point_lat") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("point_long") as HTMLInputElement).valueAsNumber = 1;
        (document.getElementById("submitPoint") as HTMLInputElement).click();
        expect(globalPoints.length).toBe(numOfPoints + 1);
    });

    it("should open and close the sidebar", function(){
        const sidebarButton = document.getElementById("sideBarSlidersButton") as HTMLInputElement;
        const sidebar = document.getElementById("sideBarSlidersContainer") as HTMLInputElement;
        expect(sidebar.className).toContain("sideBarClosed");
        sidebarButton.click();
        expect(sidebar.className).toContain("sideBarOpen");
        sidebarButton.click();
        expect(sidebar.className).toContain("sideBarClosed");
    });

    it("should change fov values using sliders", function(){
        //Set up test
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 1000.0], 60, 1, 90, -45, 0, 100, 1000
        );
        const inputEvent = new Event("input");
        new TLMFovElement(fov, null);
        const sliderIds = ["cam_dist", "fov_hor", "cam_height", "cam_tilt", "cam_heading"];
        const sliderVals = ["900", "90", "900", "0", "90"];
        for(const i in sliderIds){
            const sliderElement = document.getElementById(fov.identifier + sliderIds[i]) as HTMLInputElement;
            sliderElement.value = sliderVals[i];
            sliderElement.dispatchEvent(inputEvent);
        }
        expect(fov.distance).toBe(900);
        expect(fov.fovDeg).toBe(Math.toRadians(90));
        expect(fov.elevation).toBe(900);
        expect(fov.tilt).toBe(Math.toRadians(0));
        expect(fov.heading).toBe(Math.toRadians(90));
    });

    it("should add a FOV object through a config file", function() {
        const handleConf = new ConfigHandler(viewer);
        const obj = {
            "cameras": [
                {
                    "name": "default",
                    "lng": -4.946793,
                    "lat": 56.615756,
                    "elevation": 10.0,
                    "fov": 60,
                    "aspectRatio": 1,
                    "theta": 90,
                    "phi": 90,
                    "roll": 0,
                    "near": 100,
                    "far": 3000,
                },
            ],
            "position": {
                "lng": -4.946793,
                "lat": 56.615756,
                "elevation": 10000.0,
            },
        };
        const blob = new Blob([JSON.stringify(obj, null, 2)], {type : "application/json"});
        const file = new File([blob], "example_config_1cam_fixed.json");
        //This is hard to test as the function calls onload() so the tests are getting executed before the function returns
        handleConf.loadConfigFromClient(file);
    });

    it("should trigger map scanning camera", function(){
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 1000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        fov.shouldUseTerrainScanning = true;
        const raycastFunction = spyOn(fov, "getCamPointPercentGlobePick");
        const resolution = 5;
        fov.mapScanningPointsToTerrain(resolution);
        expect(raycastFunction).toHaveBeenCalledTimes((resolution + 1) * (resolution + 1));
    });

    it("should test the loggers", function(){
        const consoleLogSpy = spyOn(console, "log");
        const consoleErrorSpy = spyOn(console, "error");
        GeneralLogger.custom("[Custom]", "Test");
        expect(consoleLogSpy).toHaveBeenCalledWith("[Custom][General] Test");
        GeneralLogger.error("Test");
        expect(consoleErrorSpy).toHaveBeenCalledWith("[General] Test");
        GeneralLogger.fatal("Test");
        expect(consoleErrorSpy).toHaveBeenCalledWith("[General] Test");
    });
});
