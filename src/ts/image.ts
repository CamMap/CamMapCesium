import Cesium from "cesium_source/Cesium";
import { FOV } from "./fov";
import exifr from "exifr";

/**
 * When an image is loaded into page, modifies specied FOV
 */
export default class image {
    viewModel : FOV;
    public uploadFile : HTMLInputElement;

    /**
     * Constructs an image object
     *
     * @param viewModel - The FOV object that the image EXIF should modify
     */
    constructor(viewModel : FOV){
        this.viewModel = viewModel;
        const uploadFile = document.getElementById("uploadFile");
        if(uploadFile != null) {
            this.uploadFile = uploadFile as HTMLInputElement;
        } else {
            throw console.error("Could not get 'uploadFile' element, is it in HTML");
        }
    }

    /**
     * Called when a file is uploaded/ the upload file has changed,
     * This only uploads a file if one was selected
     *
     * @param event - The input event
     */
    onUploadImage(event: Event): void {
        console.log("onUploadImage");
        if(event.target && event.target instanceof HTMLInputElement) {
            const files = event.target.files;
            if(files && files.length) {
                this.showUploadedImage(files[0]);
            }
        }
    }

    /**
     * Sets the "target" image in html to display the uploaded image
     * once the uploaded image has been loaded
     *
     * @param file - The file url to upload
     */
    showUploadedImage(file: File): void {
        let img : HTMLImageElement;
        const tempImg = document.getElementById("target");
        if(tempImg != null) {
            img = tempImg as HTMLImageElement;
        } else {
            throw console.error("Could not get 'target' element, is it in HTML");
        }

        ///////////////////////
        // For putting the data to a canvas which will be helpful for
        // Pixel click events use
        // Ctx.putImageData(??, 0, 0);
        ////////////////////////
        const localViewModel = this.viewModel as FOV;
        const fileReader = new FileReader();
        /**
         * @param e - TODO
         */
        fileReader.onload = function(e) {
            // Switch Image to display the loaded image
            if(e.target) {
                console.log(e.target, img);
                img.onload = createImageOnCanvas;
                img.src = e.target.result as string;

                // Attempt to get the heading
                exifr.parse(file).then(output => {
                    const heading = output.GPSImgDirection as number;
                    if(heading) {
                        localViewModel.heading = Cesium.Math.toRadians(heading);
                    }
                }).catch(() => {
                    console.error("Heading could not be found");
                    return;
                });

                // Attempt to get the GPS cordinates
                exifr.gps(img.src).then((gps) => {
                    localViewModel.latitude = gps.latitude;
                    localViewModel.longitude = gps.longitude;
                }).catch(() => {
                    console.error("Couldn't read image GPS coordinates");
                    return;
                });
            }
        };
        fileReader.readAsDataURL(file);
    }

    /**
     *  Draws a line from the FOV camera to the map when the cavas is clicked
     */
    addPoints():void{
        const localViewModel = this.viewModel as FOV;
        const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        if(canvas){
            canvas.addEventListener("click", function(e){
                const span = document.getElementById("image-cord");
                const points = getCursorPosition(canvas, e);
                if(span){
                    span.innerText = `X: ${points[0]}, Y: ${points[1]}`;
                }

                const precentPoints = new Cesium.Cartesian2(points[1] / canvas.height, points[0] / canvas.width);
                console.log(precentPoints);
                localViewModel.drawLineFromPercentToScreen(localViewModel.viewer, precentPoints, localViewModel.viewer.scene.globe.ellipsoid);
            });
        }

        document.getElementById("drawImage")?.addEventListener("click", ()=>{
            createImageOnCanvas();
        });
    }
}

/**
 * It reads the image and draws it on the Canvas
 */
function createImageOnCanvas(){
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const target = document.getElementById("target") as HTMLImageElement;
    const canvasX = 350;
    const canvasY = 300;
    context?.drawImage(
        target, 0, 0, canvasX, canvasY
    );
    target.style.display = "none";
}

/**
 * Get the x and y points of the canvas where it was clicked
 *
 * @param canvas - The canvas the image is drawn onto
 * @param event - The mouse click event that triggered eventlistener
 * @returns [x,y] coordinates in a number array where [0,0] is the top left corner and [canvas.width, canvas.height] is the bottom right
 */
function getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent): [number, number]{
    const rect = canvas.getBoundingClientRect();
    const x = -(event.clientX - rect.right);
    const y = event.clientY - rect.top;
    return [x, y];
}
