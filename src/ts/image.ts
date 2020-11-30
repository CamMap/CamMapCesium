import Cesium from "cesium_source/Cesium";
import { FOV } from "./fov";
import {ImageLogger} from "./logger";
import exifr from "exifr";

/**
 * When an image is loaded into page, modifies specied FOV
 */
export class Image {
    /// The FOV which should be modified when an image is uploaded
    /// TODO - do this through event listeners, abstract away from FOV
    private viewModel : FOV;

    /**
     * Constructs an image object
     *
     * @param viewModel - The FOV object that the image EXIF should modify
     */
    constructor(viewModel : FOV){
        this.viewModel = viewModel;
        const uploadFile = document.getElementById("uploadFile");
        if(uploadFile != null) {
            uploadFile.onchange = (e) => this.onUploadImage(e);
        } else {
            ImageLogger.error("Could not get the file input element which would open an image uploading box.  This means something went wrong with the html.  This is a bug, to fix it try restarting the application.  If that does not help, submit a bug report.");
        }
    }

    /**
     * Called when a file is uploaded, only uploads a file if one was selected
     *
     * @param event - The file open event, retunred from the file opening box
     */
    private onUploadImage(event: Event): void {
        ImageLogger.info("Uploaded Image");
        if(event.target != null && event.target instanceof HTMLInputElement) {
            const files = event.target.files;
            if(files != null) {
                if(files.length == 0){
                    ImageLogger.warn("You not selected any images and so none will be used.  If you did select an image and are seeing this message, this is most likely a problem with the browser.");
                    return;
                }
                if(files.length > 1){
                    ImageLogger.warn("You have selected multiple images, the first one will be the only one used.  This application does not support multiple images.");
                }
                this.showUploadedImage(files[0]);
            } else {
                ImageLogger.error("The filelist containing the file selected returned null.  To fix this, try selecting the file again.  If that doesn't work, submit a bug report.");
            }
        } else {
            ImageLogger.error("The event target for uploading the image was not a HTMLInputElement.  This is a bug and should not have happened, submit a bug report.  This function is most likely being used incorrectly internally.");
        }
    }

    /**
     * Sets the "target" image in html to display the uploaded image
     * once the uploaded image has been loaded
     *
     * @param imageFile - The image file to read/upload
     */
    showUploadedImage(imageFile: File): void {
        const imageElement = document.getElementById("target");
        if(imageElement != null) {
            const fileReader = new FileReader();

            fileReader.onload = (e) => this.onImageRead(e, imageFile, imageElement as HTMLImageElement);
            fileReader.readAsDataURL(imageFile);
        } else {
            ImageLogger.error("Could not get the image element on which to display the video.  This means something went wrong with the html.  This is a bug, to fix it try restarting the application.  If that does not help, submit a bug report.");
        }
    }

    /**
     * @param fileReader - The file reader for the image
     * @param imageFile - The file to load the image from, this must be an image that the webbrowser can load e.g .png, .jpeg, .tiff...
     * @param imageElement - The html image element on which to display the image
     * @returns A boolean representing whether the opperation of reading the image was successful, true if it was, false if it wasn't
     */
    public onImageRead(fileReader: ProgressEvent<FileReader>, imageFile: File, imageElement: HTMLImageElement) : boolean{
        // Display the loaded image
        if(fileReader.target) {
            imageElement.onload = createImageOnCanvas;
            if(fileReader.target.result != null){
                // The user selected an image file
                imageElement.src = fileReader.target.result as string;

                // Attempt to get the heading
                exifr.parse(imageFile).then(output => {
                    const heading = output.GPSImgDirection;
                    if(heading != null) {
                        this.viewModel.heading = Cesium.Math.toRadians(heading as number);
                    } else {
                        ImageLogger.warn("Heading of uploaded image could not be found, the image most likely does not have this(i.e the image does not have heading metadata).  To fix this, check that the image does have heading metadata and if it does, submit a bug report.  This is to do with the orientation of the image.");
                    }
                }).catch(() => {
                    ImageLogger.warn("The image metadata could not be parsed, is the image metadata in the correct format.  If it is, submit a bug report.  However, this is most likely a problem with the image.");
                });

                // Attempt to get the GPS cordinates
                exifr.gps(imageElement.src).then((gps) => {
                    if(gps.latitude != null && gps.longitude != null){
                        this.viewModel.latitude = gps.latitude;
                        this.viewModel.longitude = gps.longitude;
                    } else {
                        ImageLogger.warn("GPS coordinates of image could not be found, the image most likely does not have this(i.e the image is not geolocated).  To fix this, check that the image does have latitude and lontitude metadata and if it does, submit a bug report.");
                    }
                }).catch(() => {
                    ImageLogger.warn("The image metadata could not be parsed, is the image metadata in the correct format.  If it is, submit a bug report.  However, this is most likely a problem with the image.");
                });
                return true;
            }
        }
        // Failure, reading the image was not successful
        return false;
    }

    /**
     * Draws a line from the FOV camera to the 3D map when the cavas is clicked
     * TODO - Do this through event listeners where FOV draws the line only through
     * event listeners
     */
    addPoints(): void{
        const localViewModel = this.viewModel as FOV;
        const canvas = document.getElementById("imageVideoCanvas") as HTMLCanvasElement;
        if(canvas){
            canvas.addEventListener("click", function(e){
                const span = document.getElementById("image-cord");
                const points = getCanvasCursorPosition(canvas, e);
                if(span){
                    span.innerText = `X: ${points[0]}, Y: ${points[1]}`;
                }

                const precentPoints = new Cesium.Cartesian2(points[1] / canvas.height, points[0] / canvas.width);
                ImageLogger.info("Clicked image " + precentPoints);
                localViewModel.drawLineFromPercentToScreen(localViewModel.viewer, precentPoints, localViewModel.viewer.scene.globe.ellipsoid);
            });
        }
    }
}

/**
 * Draw the image in the image element on the Canvas
 */
function createImageOnCanvas(){
    const canvas = document.getElementById("imageVideoCanvas") as HTMLCanvasElement;
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
function getCanvasCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent): [number, number]{
    const rect = canvas.getBoundingClientRect();
    const x = -(event.clientX - rect.right);
    const y = event.clientY - rect.top;
    return [x, y];
}
