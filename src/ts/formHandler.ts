import { TLMFovElement, TLMPointElement, globalFOV } from "./targetManager";
import { FOV } from "./fov";
import {GeneralLogger} from "./logger";
import { addPoint } from "./main_helper";
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
    submitElement = document.getElementById("submitFov") as HTMLFormElement;

    /**
     * Handles a form submition for a new FOV object - TODO: needs to be reworked to correctly error handle input
     *
     * @param scene - the scene used to display the FOV object
     */
    public onSubmit(scene : Cesium.Scene){
        const id = handleIdInput("fov_id");
        const lat = handleNumberInput("fov_lat");
        const long = handleNumberInput("fov_long");
        const elev = handleNumberInput("fov_elev");
        const fovDeg = handleNumberInput("fov_fovDeg");
        const aspectRatio = handleNumberInput("fov_ratio");
        const heading = handleNumberInput("fov_head");
        const tilt = handleNumberInput("fov_tilt");
        const roll = handleNumberInput("fov_roll");
        const near = handleNumberInput("fov_near");
        const far = handleNumberInput("fov_far");
        const geoServer = (document.getElementById("geoData") as HTMLInputElement).value;
        if(id != null){
            const fov = new FOV(
                id, scene, [lat, long, elev], fovDeg, aspectRatio, heading, tilt, roll, near, far,
            );
            new TLMFovElement(fov, geoServer);
        } else {
            GeneralLogger.error("Could not generate FOV objects, please try again.");
        }
    }
}

/**
 * Handles the point form
 */
class pointForm implements Form{
    submitElement = document.getElementById("submitPoint") as HTMLFormElement;

    /**
     * Handles a form submition for a new point object - TODO: needs to be reworked to correctly error handle input
     */
    public onSubmit(){
        const lat = handleNumberInput("point_lat");
        const long = handleNumberInput("point_long");
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
function handleIdInput(elementId : string) : string | null{
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
