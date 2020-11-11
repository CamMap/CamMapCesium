import exifr from 'exifr';
import CameraViewModel from './cameraViewModel';

/**
 * When an image is loaded into page, modifies specied CameraViewModel
 */
export default class image { 

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
        console.log('onUploadImage');
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
                console.log(e.target, img);
                img.onload = createImageOnCanvas;
                img.src = e.target.result as string;

                // Attempt to get the heading 
                exifr.parse(file).then(output => {
                    localViewModel.heading = (output.GPSImgDirection as number);
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


function getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent ) {

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
    const span = document.getElementById('image-cord');
    if(span){
        span.innerText = `X: ${x}, Y: ${y}`;
    }
}
window.onload = ()=>{
    console.log('on load fired');
    const canvas = document.getElementById("myCanvas");
    if(canvas){
        canvas.addEventListener("click", function(e){
            console.log('click event called.');
            getCursorPosition(document.getElementById("myCanvas") as HTMLCanvasElement, e);
        });
    }
    document.getElementById("drawImage")?.addEventListener('click',()=>{
        console.log('button clicked');
        createImageOnCanvas();
    });

};
