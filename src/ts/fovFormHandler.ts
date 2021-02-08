import { TLMFovElement, globalFOV } from "./targetManager";
import { FOV } from "./fov";
import {GeneralLogger} from "./logger";
const DEFAULT_VAL = 0;

/**
 * Handles input from the FOV input form
 */
export class fovFormHandler{
    scene : Cesium.Scene;
    constructor(scene : Cesium.Scene){
        this.scene = scene;
        const sumbmitButton = document.getElementById("submitFov") as HTMLFormElement;
        if(sumbmitButton != null){
            sumbmitButton.onclick = () => this.onFovFormSubmit();
        } else {
            GeneralLogger.error("Couldnt find FOV input form in the HTML");
        }
    }

    /**
     * Handles a form submition for a new FOV object - TODO: needs to be reworked to correctly error handle input
     *
     */
    private onFovFormSubmit(){
        const id = this.handleIdInput("fov_id");
        const lat = this.handleNumberInput("fov_lat");
        const long = this.handleNumberInput("fov_long");
        const elev = this.handleNumberInput("fov_elev");
        const fovDeg = this.handleNumberInput("fov_fovDeg");
        const aspectRatio = this.handleNumberInput("fov_ratio");
        const heading = this.handleNumberInput("fov_head");
        const tilt = this.handleNumberInput("fov_tilt");
        const roll = this.handleNumberInput("fov_roll");
        const near = this.handleNumberInput("fov_near");
        const far = this.handleNumberInput("fov_far");
        const geoServer = (document.getElementById("geoData") as HTMLInputElement).value;
        if(id != null){
            const fov = new FOV(
                id, this.scene, [lat, long, elev], fovDeg, aspectRatio, heading, tilt, roll, near, far,
            );
            new TLMFovElement(fov, geoServer);
        } else {
            GeneralLogger.error("Could not generate FOV objects, please try again.");
        }
    }

    /**
     * Handles number input HTML elements
     *
     * @param elementId - the id of the HTML input element
     * @returns the value given by the input element or a default value if no input element can be found
     */
    private handleNumberInput(elementId : string) : number{
        const inputElement = document.getElementById(elementId) as HTMLInputElement;
        if(inputElement != null){
            const inputVal = Number(inputElement.value);
            if(isNaN(inputVal)){
                GeneralLogger.warn("Value for input element " + elementId + " could not be parsed. Using default value " + DEFAULT_VAL);
                return DEFAULT_VAL;
            } else {
                return inputVal;
            }
        } else {
            GeneralLogger.error("Could not get the HTML element for id: " + elementId + ". Using default value " + DEFAULT_VAL);
            return DEFAULT_VAL;
        }
    }

    /**
     * Handles text input of HTML input elements
     *
     * @param elementId - the id of the HTML input element
     * @returns the value of the input element
     */
    private handleIdInput(elementId : string) : string | null{
        const currentFovObjects = globalFOV;
        const inputElement = document.getElementById(elementId) as HTMLInputElement;
        if(inputElement != null){
            for(const fov of currentFovObjects){
                if(inputElement.value == fov.identifier){
                    //Should probably display this in the HTML form
                    GeneralLogger.error("That FOV id is already in use! Please select a different one.");
                    return null;
                }
            }
            return inputElement.value;
        } else {
            GeneralLogger.warn("Could not find HTML input element. Reload the webpage and if this problem continues, submit a bug report.");
            return null;
        }
    }
}

