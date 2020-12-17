/**
 * The handler for the canvas, deals with displaying either the image or the video
 * and registering clicks.
 *
 * @packageDocumentation
 */

/**
 * A class to deal with the canvas displayin the image or the videos
 */
export class CanvasHandler{
    canvasElement: HTMLCanvasElement;
    clickFuns: { ([x, y]: [number, number]): void; }[];

    constructor(canvasElement: HTMLCanvasElement){
        this.canvasElement = canvasElement;
        this.clickFuns = [];

        this.setUpRegisterClicks();
    }

    /**
     * Sets up the canvas to register clicks
     */
    public setUpRegisterClicks(): void{
        this.canvasElement.onclick = (e) => {
            for(const fn of this.clickFuns){
                const cursorPosition = this.getCursorPosition(e);
                fn(cursorPosition);
            }
        };
    }

    /**
     * Call a function then the canvas is clicked
     *
     * @param fun - The function to run when the canvas is clicked
     */
    public onClick(fun: ([x, y]: [number, number]) => void): void{
        this.clickFuns.push(fun);
    }

    /**
     * Get the x and y points of the canvas where it was clicked
     *
     * @param event - The mouse click event that triggered eventlistener
     * @returns [x,y] coordinates in a number array where [0,0] is the top left corner and [canvas.width, canvas.height] is the bottom right
     */
    private getCursorPosition(event: MouseEvent): [number, number]{
        const rect = this.canvasElement.getBoundingClientRect();
        const x = -(event.clientX - rect.right);
        const y = event.clientY - rect.top;
        return [x, y];
    }
}
