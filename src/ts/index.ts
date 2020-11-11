import * as Cesium from "cesium_source/Cesium";
import CameraViewModel from './cameraViewModel';
import image from './image';
//TODO: someone migrate this to ES6 later on
require('../css/main.css');
require('cesium_source/Widgets/widgets.css');
require('./image');

//sliders
const cam_height = document.getElementById("cam_height") as HTMLInputElement;
const cam_tilt = document.getElementById("cam_tilt") as HTMLInputElement;
const fov_hor = document.getElementById("fov_hor") as HTMLInputElement;
const fov_vert = document.getElementById("fov_vert") as HTMLInputElement;
const cam_heading = document.getElementById("cam_heading") as HTMLInputElement;

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
const imageHandler = new image(viewModel);

//set sliders to default value
cam_height.value = String(viewModel.height);
(document.getElementById("cam_height_result") as HTMLOutputElement).value = String(viewModel.height);
cam_tilt.value = String(viewModel.tilt);
(document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(viewModel.tilt);
fov_hor.value = String(viewModel.fovHor);
(document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(viewModel.fovHor);
fov_vert.value = String(viewModel.fovVer);
(document.getElementById("fov_vert_result") as HTMLOutputElement).value = String(viewModel.fovVer);
cam_heading.value = String(viewModel.heading);
(document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(viewModel.heading);

//This could probably have been done in the image class
//but it works and I dont have time to refactor before the costumer day
imageHandler.uploadFile.onchange = imageHandler.onUploadImage.bind(imageHandler);

/**
 * Sets the height attribute for the viewModel from slider value
 */
cam_height.oninput = function() { 
    viewModel.height = (Number(cam_height.value)); 
    (document.getElementById("cam_height_result") as HTMLOutputElement).value = String(viewModel.height);
};

/**
 * Sets the tilt attribute for the viewModel from slider value
 */
cam_tilt.oninput = function() {
    viewModel.tilt = (Number(cam_tilt.value)); 
    (document.getElementById("cam_tilt_result") as HTMLOutputElement).value = String(viewModel.tilt);
};

/**
 * Sets the horizontal FOV attribute for the viewModel from slider value
 */
fov_hor.oninput = function() { 
    viewModel.fovHor = (Number(fov_hor.value)); 
    (document.getElementById("fov_hor_result") as HTMLOutputElement).value = String(viewModel.fovHor);
};

/**
 * Sets the vertical FOV attribute for the viewModel from slider value
 */
fov_vert.oninput = function() { 
    viewModel.fovVer = (Number(fov_vert.value)); 
    (document.getElementById("fov_vert_result") as HTMLOutputElement).value = String(viewModel.fovVer);
};

/**
 * Sets the heading attribute for the viewModel from slider value
 */
cam_heading.oninput = function() { 
    viewModel.heading = (Number(cam_heading.value)); 
    (document.getElementById("cam_heading_result") as HTMLOutputElement).value = String(viewModel.heading);
};

/**
 * It reads the image and draws it on the Canvas
 */

function createImageOnCanvas(){
    const canvas = (document.getElementById('myCanvas') as HTMLCanvasElement);
    const context  = canvas.getContext('2d');
    const target = document.getElementById("target") as HTMLImageElement;
    console.log (target);
    context?.drawImage(target,0,0,350,300);
    target.style.display = 'none';
}

/**
 * @param canvas gets the image on canvas
 * 
 * @param event this gets the x and y positions when selected
 * 
 */
function getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent ): [number, number]{

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = -(event.clientY - rect.bottom);
    return [x,y];

}

window.onload = ()=>{
    console.log('on load fired');
    const canvas = document.getElementById("myCanvas");
    if(canvas){
        canvas.addEventListener("click", function(e){
            console.log('click event called.');
            const span = document.getElementById('image-cord');
            const points = getCursorPosition(document.getElementById("myCanvas") as HTMLCanvasElement, e);
            if(span){
                span.innerText = `X: ${points[0]}, Y: ${points[1]}`;
            }
            viewModel.addDot(points[0]/350, points[1]/300);
        });
    }
    
    document.getElementById("drawImage")?.addEventListener('click',()=>{
        console.log('button clicked');
        createImageOnCanvas();
    });
};

