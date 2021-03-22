import * as constants from "./consts";
import { FOVLogger, GeneralLogger } from "./logger";
import { TLMFovElement, TLMPointElement } from "./targetManager";
import { FOV } from "./fov";
import { addPoint } from "./main_helper";
import { globalFOV } from "./globalObjects";

const DEFAULT_VAL = 0;

/**
 * Interface to be used by the forms
 */
interface Form{
    submitElement: HTMLFormElement;
    onSubmit(scene? : Cesium.Scene): void;
}

/**
 * Handles the FOV form
 */
class fovForm implements Form{
    submitElement = document.getElementById(constants.INPUT_FOV_SUBMIT) as HTMLFormElement;

    /**
     * Handles a form submition for a new FOV object - TODO: needs to be reworked to correctly error handle input
     *
     * @param scene - the scene used to display the FOV object
     */
    public onSubmit(scene : Cesium.Scene){
        const name = handleNameInput(constants.INPUT_FOV_NAME);
        const lat = handleNumberInput(constants.INPUT_FOV_LAT);
        const long = handleNumberInput(constants.INPUT_FOV_LONG);
        const elev = handleNumberInput(constants.INPUT_FOV_ELEV);
        const fovDeg = handleNumberInput(constants.INPUT_FOV_DEGREES);
        const aspectRatio = handleNumberInput(constants.INPUT_FOV_RATIO);
        const heading = handleNumberInput(constants.INPUT_FOV_HEADING);
        const tilt = handleNumberInput(constants.INPUT_FOV_TILT);
        const roll = handleNumberInput(constants.INPUT_FOV_ROLL);
        const near = handleNumberInput(constants.INPUT_FOV_NEAR);
        const far = handleNumberInput(constants.INPUT_FOV_FAR);
        const geoServer = (document.getElementById(constants.INPUT_GEODATA) as HTMLInputElement).value;

        const fov = new FOV(
            scene, [long, lat, elev], fovDeg, aspectRatio, heading, tilt, roll, near, far, name
        );
        new TLMFovElement(fov, geoServer);
        FOVLogger.info("New FOV Object Created");
    }
}

/**
 * Handles the point form
 */
class pointForm implements Form{
    submitElement = document.getElementById(constants.INPUT_POINT_SUBMIT) as HTMLFormElement;

    /**
     * Handles a form submition for a new point object - TODO: needs to be reworked to correctly error handle input
     */
    public onSubmit(){
        const lat = handleNumberInput(constants.INPUT_POINT_LAT);
        const long = handleNumberInput(constants.INPUT_POINT_LONG);
        const point = addPoint(lat, long);
        new TLMPointElement(point);
        GeneralLogger.debug("Generated Point at" + lat.toString() + " " + long.toString());
    }
}


/**
 * Handles submission of the different forms
 */
export class formHandler{
    scene : Cesium.Scene;
    forms : Form[];
    constructor(scene : Cesium.Scene){
        this.scene = scene;
        this.forms = [new fovForm(), new pointForm()];
        for(const form of this.forms){
            if(form.submitElement != null){
                form.submitElement.onclick = () => form.onSubmit(this.scene);
            } else {
                GeneralLogger.error("Couldnt find input form in the HTML");
            }
        }
    }
}

/**
 * Handles number input HTML elements
 *
 * @param elementId - the id of the HTML input element
 * @returns the value given by the input element or a default value if no input element can be found
 */
function handleNumberInput(elementId : string) : number{
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
function handleNameInput(elementId : string) : string | undefined{
    const currentFovObjects = globalFOV;
    const inputElement = document.getElementById(elementId) as HTMLInputElement;
    if(inputElement != null){
        for(const fov of currentFovObjects){
            if(inputElement.value == fov.identifier){
                //Should probably display this in the HTML form
                GeneralLogger.error("That FOV name is already in use! Please select a different one.");
                return undefined;
            }
        }
        return inputElement.value;
    } else {
        GeneralLogger.warn("Could not find HTML input element. Reload the webpage and if this problem continues, submit a bug report.");
        return undefined;
    }
}
