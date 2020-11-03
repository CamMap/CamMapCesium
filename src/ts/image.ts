import exifr from 'exifr';

// The upload file button
let uploadFile = document.getElementById('uploadFile')! as HTMLInputElement;
uploadFile.onchange = onUploadImage;

/**
 * Called when a file is uploaded/ the upload file has changed,
 * This only uploads a file if one was selected
 * @param event The input event
 */
function onUploadImage(event: Event): any {
    let files = (event.target! as HTMLInputElement).files;
    if (files && files.length) {
        showUploadedImage(files![0]);
    }
}

/**
 * Sets the "target" image in html to display the uploaded image
 * once the uploaded image has been loaded
 * @param file The file url to upload
 */
function showUploadedImage(file: File) {
    let img = document.getElementById("target")! as HTMLImageElement;

    ///////////////////////
    // For putting the data to a canvas which will be helpful for 
    // pixel click events use
    // ctx.putImageData(??, 0, 0);
    ////////////////////////

    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        // Switch Image to display the loaded image
        img.src = e.target!.result as string;

        // Attempt to get GPS coordinates
        exifr.gps('./myimage.jpg').then((gps) => {
            console.log("GPS data: Latitude: " + gps.latitude + " | Longitude: " + gps.longitude);
        }).catch((_) => {
            console.log("Couldn't read image GPS coordinates");
        });
        console.log("Loaded Image:" + e.target!.result);
    }
    fileReader.readAsDataURL(file);
}
