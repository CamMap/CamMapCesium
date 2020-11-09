import exifr from 'exifr';
import CameraViewModel from './cameraViewModel';

/**
 * When an image is loaded into page, modifies specied CameraViewModel
 */
class image { 

    viewModel : CameraViewModel;
    public uploadFile : HTMLInputElement;

    /**
     * Constructs an image object 
     * @param viewModel - The CameraViewModel object that the image EXIF should modify
     */
    constructor(viewModel : CameraViewModel){ 
        this.viewModel = viewModel;

        const uploadFile = document.getElementById('uploadFile');
        if (uploadFile != null) {
            this.uploadFile = uploadFile as HTMLInputElement;
        }else{
            throw console.error("Could not get 'uploadFile' element, is it in HTML");
        }
    }

    /**
     * Called when a file is uploaded/ the upload file has changed,
     * This only uploads a file if one was selected
     * @param event The input event
     */
    onUploadImage(event: Event): void {
        if (event.target && event.target instanceof HTMLInputElement) {
            const files = event.target.files;
            if (files && files.length) {
                this.showUploadedImage(files[0]);
            }
        }
    }
    
    /**
     * Sets the "target" image in html to display the uploaded image
     * once the uploaded image has been loaded
     * @param file The file url to upload
     */
    showUploadedImage(file: File): void {
        let img : HTMLImageElement;
        const tempImg = document.getElementById("target");
        if (tempImg != null) {
            img = tempImg as HTMLImageElement;
        }else{ 
            throw console.error("Could not get 'target' element, is it in HTML");
        }
        

        ///////////////////////
        // For putting the data to a canvas which will be helpful for 
        // pixel click events use
        // ctx.putImageData(??, 0, 0);
        ////////////////////////
        const localViewModel = this.viewModel as CameraViewModel;
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            // Switch Image to display the loaded image
            if (e.target) {
                img.src = e.target.result as string;

                // Attempt to get the heading 
                exifr.parse(file).then(output => {
                    localViewModel.setHeading(output.GPSImgDirection as number);
                    localViewModel.setCamera();
                    
                }).catch(() => {
                    console.error("Heading could not be found");
                    return;
                });

                // Attempt to get the GPS cordinates
                exifr.gps(img.src).then((gps) => {
                    localViewModel.setLatLng(gps.latitude, gps.longitude);
                    localViewModel.setCamera();
                }).catch(() => {
                    console.error("Couldn't read image GPS coordinates");
                    return;
                });
            }   
        };
        
        fileReader.readAsDataURL(file);
    }
}

export default image;