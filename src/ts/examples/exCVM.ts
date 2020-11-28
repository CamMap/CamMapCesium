import * as Cesium from "cesium_source/Cesium";
import CameraViewModel from "./../cameraViewModel";

//Sliders
const camHeight = document.getElementById("cam_height") as HTMLInputElement;
const camTilt = document.getElementById("cam_tilt") as HTMLInputElement;
const fovHor = document.getElementById("fov_hor") as HTMLInputElement;
const fovVert = document.getElementById("fov_vert") as HTMLInputElement;
const camHeading = document.getElementById("cam_heading") as HTMLInputElement;


// Setup cesium root panel reference;
const cesiumRoot = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    vrButton: false,
    fullscreenButton: false,
});

const camLongditude = -4.291606;
const camLatitude = 55.873704;
const camElevation = 30.0;

const camPitch = -45.0;

// Set default view
cesiumRoot.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(camLongditude, camLatitude, camElevation),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(camPitch),
    },
});

const viewModel = new CameraViewModel(cesiumRoot);

//Set sliders to default value
camHeight.value = String(viewModel.height);
(document.getElementById("cam_height_result") as HTMLOutputElement).value = String(viewModel.height);
camTilt.value = String(viewModel.tilt);
(document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(viewModel.tilt);
fovHor.value = String(viewModel.fovHor);
(document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(viewModel.fovHor);
fovVert.value = String(viewModel.fovVer);
(document.getElementById("fov_vert_result") as HTMLOutputElement).value = String(viewModel.fovVer);
camHeading.value = String(viewModel.heading);
(document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(viewModel.heading);


/**
 * Sets the height attribute for the viewModel from slider value
 */
camHeight.oninput = function() {
    viewModel.height = Number(camHeight.value);
    (document.getElementById("cam_height_result") as HTMLOutputElement).value = String(viewModel.height);
};

/**
 * Sets the tilt attribute for the viewModel from slider value
 */
camTilt.oninput = function() {
    viewModel.tilt = Number(camTilt.value);
    (document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(viewModel.tilt);
};

/**
 * Sets the horizontal FOV attribute for the viewModel from slider value
 */
fovHor.oninput = function() {
    viewModel.fovHor = Number(fovHor.value);
    (document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(viewModel.fovHor);
};

/**
 * Sets the vertical FOV attribute for the viewModel from slider value
 */
fovVert.oninput = function() {
    viewModel.fovVer = Number(fovVert.value);
    (document.getElementById("fov_vert_result") as HTMLOutputElement).value = String(viewModel.fovVer);
};

/**
 * Sets the heading attribute for the viewModel from slider value
 */
camHeading.oninput = function() {
    viewModel.heading = Number(camHeading.value);
    (document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(viewModel.heading);
};

const canvasX = 350;
const canvasY = 300;

/**
 * It reads the image and draws it on the Canvas
 */
function createImageOnCanvas(){
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const target = document.getElementById("target") as HTMLImageElement;
    console.log(target);
    context?.drawImage(
        target, 0, 0, canvasX, canvasY
    );
    target.style.display = "none";
}

/**
 * @param canvas - gets the image on canvas
 *
 * @param event - this gets the x and y positions when selected
 * @returns The cursor position
 *
 */
function getCanvasCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent): [number, number]{
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = -(event.clientY - rect.bottom);
    return [x, y];
}

window.onload = ()=>{
    console.log("on load fired");
    const canvas = document.getElementById("myCanvas");
    if(canvas){
        canvas.addEventListener("click", function(e){
            console.log("click event called.");
            const span = document.getElementById("image-cord");
            const points = getCanvasCursorPosition(document.getElementById("myCanvas") as HTMLCanvasElement, e);
            if(span){
                span.innerText = `X: ${points[0]}, Y: ${points[1]}`;
            }
            viewModel.addDot(points[0] / canvasX, points[1] / canvasY);
        });
    }

    document.getElementById("drawImage")?.addEventListener("click", ()=>{
        console.log("button clicked");
        createImageOnCanvas();
    });
};
