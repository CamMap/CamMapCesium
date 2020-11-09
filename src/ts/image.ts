import exifr from 'exifr';

// The upload file button
let uploadFile = document.getElementById('uploadFile');
if (uploadFile !== null) {
    uploadFile = uploadFile as HTMLInputElement;
    uploadFile.onchange = onUploadImage;
} else {
    throw console.error("Could not get 'uploadFile' element, is it in HTML");
}

/**
 * Called when a file is uploaded/ the upload file has changed,
 * This only uploads a file if one was selected
 * @param event The input event
 */
function onUploadImage(event: Event): void | null {
    if (event.target && event.target instanceof HTMLInputElement) {
        const files = event.target.files;
        if (files && files.length) {
            showUploadedImage(files[0]);
        }
    }
}

/**
 * Sets the "target" image in html to display the uploaded image
 * once the uploaded image has been loaded
 * @param file The file url to upload
 */
function showUploadedImage(file: File): void {
    const img = document.getElementById("target") as HTMLImageElement;
    if (!img) {
        return;
    }

    ///////////////////////
    // For putting the data to a canvas which will be helpful for 
    // pixel click events use
    // ctx.putImageData(??, 0, 0);
    ////////////////////////

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        // Switch Image to display the loaded image
        if (e.target) {
            img.src = e.target.result as string;

            // Attempt to get GPS coordinates
            exifr.gps(img.src).then((gps) => {
                console.log("GPS data: Latitude: " + gps.latitude + " | Longitude: " + gps.longitude);
            }).catch(() => {
                console.log("Couldn't read image GPS coordinates");
            });
            console.log("Loaded Image:" + e.target.result);
        }
    };
    fileReader.readAsDataURL(file);
}
