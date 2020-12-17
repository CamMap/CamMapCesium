import {ImageLogger} from "./logger";
import exifr from "exifr";

export interface LoadedGeoMetadata{
    latitude?: number | null;
    longtitude?: number | null;
    bearing?: number | null;
}

/**
 * When an image is loaded into page, modifies specied FOV
 */
export class Image {
    private metadataFuns: { (data: LoadedGeoMetadata): void; }[];

    /**
     * Constructs an image object
     */
    constructor(){
        this.metadataFuns = [];
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

            fileReader.onload = (e) => this.onImageUploaded(e, imageFile, imageElement as HTMLImageElement);
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
    public onImageUploaded(fileReader: ProgressEvent<FileReader>, imageFile: File, imageElement: HTMLImageElement) : boolean{
        // Display the loaded image
        if(fileReader.target) {
            imageElement.onload = createImageOnCanvas;
            if(fileReader.target.result != null){
                // The user selected an image file
                imageElement.src = fileReader.target.result as string;

                // Attempt to get the metadata
                exifr.parse(imageFile).then(parsedOutput => {
                    for(const fn of this.metadataFuns){
                        fn({latitude: parsedOutput.latitude, longtitude: parsedOutput.longitude, bearing: parsedOutput.GPSImgDirection});
                    }
                }).catch(() => {
                    ImageLogger.warn("The image metadata could not be parsed, is the image metadata in the correct format?  If it is, submit a bug report.  However, this is most likely a problem with the image.");
                    return false;
                });
                return true;
            }
        }
        // There was no filereader target
        return false;
    }

    /**
     * Run a function when the metadata of the image is read
     *
     * @param fun - The function to run, taking an object of the image bearing, latitude and longtitude, which may not all be present
     */
    public onImageMetadataRead(fun: (data: LoadedGeoMetadata) => void): void{
        this.metadataFuns.push(fun);
    }
}

/**
 * Draw the image in the image element on the Canvas
 */
function createImageOnCanvas(){
    const canvas = document.getElementById("imageVideoCanvas");
    if(canvas != null){
        const context = (canvas as HTMLCanvasElement).getContext("2d");
        if(context != null){
            const target = document.getElementById("target");
            if(target != null){
                context.drawImage(
                    target as HTMLImageElement, 0, 0, canvas.clientWidth, canvas.clientHeight
                );
                target.style.display = "none";
            }
        }
    } else {
        ImageLogger.error("Unable to find canvas element.  This is an error, to fix it, try restarting the application.  If that does not work, submit a bug report.");
    }
}
