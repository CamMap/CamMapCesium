import {VideoLogger} from "./logger";

/**
 * Hold a video which can be loaded into the application
 */
export class Video {
    private playing: boolean;
    private fps: number;
    private videoCanvas: HTMLCanvasElement | undefined;
    private videoHTML: HTMLVideoElement | undefined;
    private canPlayVideo: boolean;
    private canvasScaleVideo: number;
    private videoCanvasContext: CanvasRenderingContext2D | undefined;

    constructor(){
        this.playing = true;
        // TODO - make use of FPS and an advance frame function
        this.fps = 30;
        this.canPlayVideo = false;
        this.canvasScaleVideo = 1;
        const canvas = document.getElementById("imageVideoCanvas");

        if(canvas != null){
            this.videoCanvas = canvas as HTMLCanvasElement;
            this.videoCanvas.onclick = this.switchPlayPause;
            const canvasContext = this.videoCanvas.getContext("2d");
            if(canvasContext != null){
                this.videoCanvasContext = canvasContext;
            }

            this.canPlayVideo = true;

            const videoHTML = document.getElementById("videoUploaded");
            if(videoHTML == null){
                VideoLogger.error("Failed to create a video element");
            } else {
                this.videoHTML = videoHTML as HTMLVideoElement;
                // This is purposeful, do not display the video, display the canvas instead
                this.videoHTML.style.display = "none";
                this.videoHTML.autoplay = true;
                this.videoHTML.loop = false;
                this.videoHTML.oncanplay = () => this.playVideo(this);

                const uploadVideoElement = document.getElementById("uploadVideo");
                if(uploadVideoElement != null){
                    uploadVideoElement.onchange = () => this.onVideoSelected(uploadVideoElement as HTMLInputElement, this);
                } else {
                    VideoLogger.error("[error] HTML upload video button for uploading the video was not found, this is a bug.  Try restarting the application, if that doesn't work, submit a bug report.");
                }
                VideoLogger.info("Video set up correctly");
            }
        } else {
            VideoLogger.error("[error] HTML Canvas for displaying the video was not found, this is a bug.  Try restarting the application, if that doesn't work, submit a bug report.");
        }
    }

    /**
     * Set up the links to the html elements to render the video and the canvas
     * TODO
     */
    //Public setUpHTMLElements(){

    //}

    /**
     * Switch the video between playing and paused state
     */
    public switchPlayPause(): void {
        if(this.videoHTML != undefined && this.canPlayVideo){
            if(this.videoHTML.paused) {
                this.videoHTML.play();
                this.playing = true;
            } else {
                this.videoHTML.pause();
                this.playing = false;
            }
        }
    }

    /**
     * Called when a video is selected to be uploaded
     *
     * @param elem - The HTML video input element
     * @param video - The video class to attach the video to
     */
    private onVideoSelected(elem: HTMLInputElement, video: this):void {
        VideoLogger.info("Selected video, processing...");
        const fileReader = new FileReader();
        fileReader.onload = (fr) => this.onUploadVideo(fr, video);
        if(elem && elem.files){
            fileReader.readAsDataURL(elem.files[0]);
        }
    }


    /**
     * When a video is uploaded/selected
     *
     * @param fileReader - The video file
     * @param video - The video class to attach the video to
     */
    private onUploadVideo(fileReader: ProgressEvent<FileReader>, video: this):void {
        VideoLogger.info("Checking can upload video");
        if(fileReader.target != null && video.videoHTML != undefined){
            VideoLogger.info("Uploading video");
            video.videoHTML.src = fileReader.target.result as string;
        } else {
            if(fileReader.target == null){
                VideoLogger.error("[error] The video upload failed.  Try again, if this does not work, submit a bug report.");
            }
            if(this.videoHTML == undefined){
                VideoLogger.error("[error] The video html element is not working correctly.  Try again, if this does not work, submit a bug report.  If the program is here, it generally should not error.");
            }
        }
    }

    /**
     * Start playing the video, if the video is already playing, use this.switchPlayPause()
     *
     * @param video - The video class to play
     */
    private playVideo(video: this){
        if(video.videoCanvas != undefined && video.videoHTML != undefined){
            VideoLogger.info("Playing video");
            video.canvasScaleVideo = this.getScaleVideoOnCanvas(video.videoCanvas, video.videoHTML.videoWidth, video.videoHTML.videoHeight);
            requestAnimationFrame(() => this.updateCanvas(video));
        } else {
            VideoLogger.error("[error] Either the video element did not initialise correctly or the canvas element did not.  Try restarting the application, if that does not help, submit a bug report.");
        }
    }

    /**
     * Get what the canvas should be scaled to to fit the video correctly
     *
     * @param canvas - The canvas onto which the video is being projected
     * @param videoWidth - The width of the video
     * @param videoHeight - The hieght of the video
     * @returns The value to scale the video by on either the width or the height, whichever is largest
     */
    private getScaleVideoOnCanvas(canvas: HTMLCanvasElement, videoWidth: number, videoHeight: number): number{
        return Math.min(canvas.width / videoWidth, canvas.height / videoHeight);
    }

    /**
     * Update the canvas with the next video frame.
     * TODO - This should be done with an advance frame function.
     * Not the way it's doing it right now.
     *
     * @param video - The video element to update the canvas of
     */
    private updateCanvas(video: this): void {
        if(video.videoCanvas != undefined && video.videoHTML != undefined){
            if(video.videoCanvasContext != null){
                // TODO - This is only required if the video contains transparent frames,
                // Should we check or just do it anyway?
                //This.videoCanvasContext.clearRect(
                //    0, 0, this.videoCanvas.width, this.videoCanvas.height
                //);

                if(video.canPlayVideo && video.playing){
                    const scale = video.canvasScaleVideo;
                    const videoHeight = video.videoHTML.videoHeight;
                    const videoWidth = video.videoHTML.videoWidth;
                    const top = 0;
                    const left = 0;

                    video.videoCanvas.width = video.videoHTML.videoWidth * scale;
                    video.videoCanvas.height = video.videoHTML.videoHeight * scale;
                    video.videoCanvasContext.drawImage(
                        video.videoHTML, left, top, videoWidth * scale, videoHeight * scale
                    );
                }

                // Loop round, TODO, make new function for advance frame and use that
                requestAnimationFrame(() => video.updateCanvas(video));
            }
        }
    }
}
