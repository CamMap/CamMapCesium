import * as Cesium from "cesium_source/Cesium";
import { FOVCanvasSetUp, FOVEventTriggerSetup, FOVImageSetup, FOVVGIPWebSocketSetUp, FOVVideoSetup } from "./fov_setup";
import { FOVLogger, GeneralLogger } from "./logger";
import { globalFOV, globalPoints } from "./globalObjects";
import { DictionaryLike } from "Cesium";
import { FOV } from "./fov";
import { onClickTabButton } from "./tabHandler";

/**
 * Generates the HTML for a FOV object
 */
export class TLMFovElement{
    private fovObject : FOV;
    private removeFuns: { (fov : FOV): void; }[];
    private containerElements: HTMLElement[];
    /**
     * Constructor for the TLM element
     *
     * @param fovObject - The FOV object to be displayed
     */
    constructor(fovObject : FOV, geoDataServer : string | null){
        this.fovObject = fovObject;
        this.removeFuns = [];
        this.containerElements = [];
        const [tlmContainer, removeElement, selectElement] = this.setupTLMHTML(this.fovObject.identifier);
        const sliderContainer = this.setupSliderHTML(this.fovObject.identifier);
        const canvasContainer = this.setupCanvasHTML(this.fovObject.identifier);
        const tabContainer = this.setupTabHTML(this.fovObject.identifier);
        this.containerElements.push(tlmContainer);
        this.containerElements.push(sliderContainer);
        this.containerElements.push(tlmContainer);
        this.containerElements.push(canvasContainer);
        this.containerElements.push(tabContainer);
        globalFOV.push(fovObject);

        FOVEventTriggerSetup(this.fovObject);
        FOVImageSetup(fovObject);
        FOVVideoSetup(fovObject);
        FOVCanvasSetUp(fovObject);

        if(geoDataServer){
            FOVVGIPWebSocketSetUp(fovObject, geoDataServer);
        } else {
            GeneralLogger.info("No GeoData server provided, camera will be static");
        }
        removeElement.onclick = () => {
            this.destroy(this.containerElements);
            FOVLogger.info("FOV Object Removed");
        };

        selectElement.onclick = () => {
            const len = globalFOV.length;
            const prevSelectedFOV = document.getElementById("selectedFOV");
            GeneralLogger.debug("Selected TLM object");
            //If point already selected remove id and change inner HTML
            if(prevSelectedFOV){
                prevSelectedFOV.removeAttribute("id");
                prevSelectedFOV.parentElement?.classList.remove("selectedDiv");
                prevSelectedFOV.innerHTML = "Select";
            }
            //No way to reference point in primitive collection with the point primitive
            for(let i = 0; i < len; ++i) {
                const fov = globalFOV[i];
                if(fov.identifier == fovObject.identifier){
                    if(!fov.select){
                        selectElement.innerHTML = "Selected";
                        selectElement.id = "selectedFOV";
                        tlmContainer.classList.add("selectedDiv");
                        fov.select = true;
                    } else {
                        selectElement.innerHTML = "Select";
                        tlmContainer.classList.remove("selectedDiv");
                        selectElement.removeAttribute("id");
                        fov.select = false;
                    }
                } else {
                    fov.select = false;
                }
            }
        };

        tabContainer.onclick = () => {
            onClickTabButton(tabContainer, canvasContainer);
        };
    }

    /**
     * Generates all the TLM section HTML for this FOV object
     *
     * @param fovId - ID of the fov object
     * @returns the HTML element used to deconstruct the FOV object and the container element
     */
    private setupTLMHTML(fovId : string) : [HTMLElement, HTMLElement, HTMLElement]{
        const parentElement = document.getElementById("ManagerContainer") as HTMLDivElement;
        if(parentElement == null){
            GeneralLogger.error("Could not get the div to hold the TLM FOV objects");
        }
        const fovElement = generateHTMLElement("div", {id: "", class: "targetElement"}, fovId);
        fovElement.appendChild(generateHTMLElement("h3", {id: "label", innerHTML: "FOV object: " + fovId}, fovId));
        const selectElement = fovElement.appendChild(generateHTMLElement("h3", {innerHTML: "Select", class: "selectElement"}));
        fovElement.appendChild(generateHTMLElement("p", {id: "Height", innerHTML: "Height: " + this.fovObject.elevation.toString()}, fovId));
        fovElement.appendChild(generateHTMLElement("p", {id: "Tilt", innerHTML: "Tilt: " + this.fovObject.tilt.toString()}, fovId));
        fovElement.appendChild(generateHTMLElement("p", {id: "Heading", innerHTML:  "Heading: " + this.fovObject.heading.toString()}, fovId));
        fovElement.appendChild(generateHTMLElement("p", {id: "FovDeg", innerHTML: "Fov degrees: " + this.fovObject.aspectRatio.toString()}, fovId));
        fovElement.appendChild(generateHTMLElement("p", {id: "Location", innerHTML: "Location: " + this.fovObject.latitude + " " + this.fovObject.longitude}, fovId));
        const removeElement = fovElement.appendChild(generateHTMLElement("p", {id: "remove", class: "removePoint", innerHTML: "Remove Object"}, fovId));
        parentElement.appendChild(fovElement);
        return [fovElement, removeElement, selectElement];
    }

    /**
     * Generates all the slider section HTML for this FOV object
     *
     * @param fovId - id of the fov object
     *
     * @returns Container element
     */
    private setupSliderHTML(fovId : string): HTMLElement{
        const parentElement = document.getElementById("sliderbox") as HTMLDivElement;
        if(parentElement == null){
            GeneralLogger.error("Could not get the div to hold the FOV sliders");
        }
        const sliderContainer = generateHTMLElement("div", {class: "slidecontainer"});
        sliderContainer.appendChild(generateHTMLElement("h3", {innerHTML: fovId}));
        sliderContainer.appendChild(this.generateSliderHTML(
            "cam_dist", "0", "10000", "1000", "Camera Distance:"
        ));
        sliderContainer.appendChild(this.generateSliderHTML(
            "fov_hor", "0", "180", "0", "Horizontal FOV:"
        ));
        sliderContainer.appendChild(this.generateSliderHTML(
            "cam_height", "0", "2000", "0", "Camera Height:"
        ));
        sliderContainer.appendChild(this.generateSliderHTML(
            "cam_tilt", "-180", "180", "0", "Camera Tilt:"
        ));
        sliderContainer.appendChild(this.generateSliderHTML(
            "cam_heading", "0", "360", "0", "Camera Heading:"
        ));
        parentElement.appendChild(sliderContainer);
        return sliderContainer;
    }

    /**
     * Generates all the canvas section HTML for this FOV object
     *
     * @param fovId - The id of the FOV object
     *
     * @returns Container element
     */
    private setupCanvasHTML(fovId : string) : HTMLElement{
        const parentElement = document.getElementById("previewImage") as HTMLDivElement;
        if(parentElement == null){
            GeneralLogger.error("Could not get the div to hold the FOV canvas");
        }
        const canvasContainer = generateHTMLElement("div", {class: "canvasContainer tabClosed"});
        const canvasLabels = generateHTMLElement("div", {class: "canvasLabels"});

        canvasLabels.appendChild(generateHTMLElement("h2", {innerHTML: this.fovObject.name}, fovId));
        canvasLabels.appendChild(generateHTMLElement("span", {id: "image-coord"}, fovId));
        canvasLabels.appendChild(generateHTMLElement("label", {innerHTML: "Choose an image/video"}, fovId));
        canvasLabels.appendChild(generateHTMLElement("input", {type: "file", id: "_uploadFile", name: "image"}, fovId));
        canvasLabels.appendChild(generateHTMLElement("input", {type: "file", id: "_uploadVideo", name: "videoUploaded"}, fovId));
        canvasContainer.appendChild(canvasLabels);

        const canvasImages = generateHTMLElement("div", {class: "canvasImages"});

        canvasImages.appendChild(generateHTMLElement("img", {id: "target" }, fovId));
        canvasImages.appendChild(generateHTMLElement("video", {id: "videoUploaded" }, fovId));
        canvasImages.appendChild(generateHTMLElement("canvas", {id:"canvas", class: "imageVideoCanvas"}, fovId));
        canvasContainer.appendChild(canvasImages);

        parentElement.appendChild(canvasContainer);
        return canvasContainer;
    }

    /**
     * Generates the tab HTML for a FOV object
     *
     * @param fovId - The id of the FOV object
     * @returns the Container elemenet
     */
    private setupTabHTML(fovId : string) : HTMLElement{
        const parentElement = document.getElementById("tabContainer") as HTMLDivElement;
        if(parentElement == null){
            GeneralLogger.error("Could not get the div to hold the FOV tab");
        }
        const tabDiv = generateHTMLElement("div", {class: "tabDiv notSelectedTabButton"});
        tabDiv.appendChild(generateHTMLElement("h2", {id:"Tab", class: "tabSVG", innerHTML: this.fovObject.name}, fovId));
        parentElement.appendChild(tabDiv);
        return tabDiv;
    }

    /**
     * Generates the HTML elements used to display a slider
     *
     * @param id - id used for the slider elements
     * @param min - the minimum value of the slider
     * @param max - the maximum value of the slider
     * @param value - the default value of the slider
     * @param innerHTML - the inner HTML of the label for the slider
     * @returns HTML slider generated
     */
    private generateSliderHTML(
        id : string, min : string, max : string, value : string, innerHTML : string
    ) : HTMLElement{
        const slider = generateHTMLElement("p", {innerHTML: innerHTML});
        slider.appendChild(generateHTMLElement("output", {id: id + "_result", innerHTML: "0"}, this.fovObject.identifier));
        slider.appendChild(generateHTMLElement("br", {}));
        slider.appendChild(generateHTMLElement("input", {id: id, class: "slider", min: min, max: max, type: "range", value: value}, this.fovObject.identifier));
        return slider;
    }

    /**
     * Removes all the HTML for this FOV object
     *
     * @param containers - Div elements containing the HTML for the HTML object
     */
    private destroy(containers : HTMLElement[]) : void{
        for(const container of containers){
            container.remove();
        }
        this.fovObject.destroy();
        const index = globalFOV.indexOf(this.fovObject);
        if(index >= 0) {
            globalFOV.splice(index, 1);
        }
    }
}

/**
 * Generates the HTML for a point primitive
 */
export class TLMPointElement{
    private point: Cesium.PointPrimitive;
    private pointContainer: HTMLElement;
    private removeFuns: { (point : Cesium.PointPrimitive): void; }[];
    constructor(point : Cesium.PointPrimitive){
        this.point = point;
        this.removeFuns = [];
        const [container, removeElement, selectElement] = this.setupPointHTML(point.id as string);
        this.pointContainer = container;
        removeElement.onclick = () => {
            this.destroy(this.pointContainer);
            FOVLogger.info("FOV Point Removed");
        };
        selectElement.onclick = () => {
            const len = globalPoints.length;
            const prevSelectedPoint = document.getElementById("selectedPoint");

            //If point already selected remove id and change inner HTML
            if(prevSelectedPoint){
                prevSelectedPoint.removeAttribute("id");
                prevSelectedPoint.parentElement?.classList.remove("selectedDiv");
                prevSelectedPoint.innerHTML = "Select";
            }

            //No way to reference point in primitive collection with the point primitive
            for(let i = 0; i < len; ++i) {
                const p = globalPoints.get(i);
                if(p.id == point.id){
                    if(p.color.equals(Cesium.Color.GREEN)){
                        p.color = Cesium.Color.ORANGE;
                        p.pixelSize = 20;
                        selectElement.innerHTML = "Selected";
                        container.classList.add("selectedDiv");
                        selectElement.id = "selectedPoint";
                    } else {
                        p.color = Cesium.Color.GREEN;
                        p.pixelSize = 10;
                        selectElement.innerHTML = "Select";
                        container.classList.remove("selectedDiv");
                        selectElement.removeAttribute("id");
                    }
                } else {
                    p.color = Cesium.Color.GREEN;
                    p.pixelSize = 10;
                }
            }
        };
    }

    /**
     * Generates the HTML for a point in the TLM section of the webpage
     *
     * @param pointId - the id of the point
     * @returns HTML conatiner and HTML element used to remove point
     */
    private setupPointHTML(pointId : string) : [HTMLElement, HTMLElement, HTMLElement]{
        const parentElement = document.getElementById("ManagerContainer") as HTMLDivElement;
        const pointPosRad = Cesium.Cartographic.fromCartesian(this.point.position);
        if(parentElement == null){
            GeneralLogger.error("Couldn't get the div to contain the FOV canvas");
        }
        const pointDiv = parentElement.appendChild(generateHTMLElement("div", {id:"point", class: "targetElement"}, pointId));
        pointDiv.appendChild(generateHTMLElement("h3", {innerHTML: "Point"}));
        const selectElement = pointDiv.appendChild(generateHTMLElement("h3", {innerHTML: "Select", class: "selectElement"}));
        pointDiv.appendChild(generateHTMLElement("p", {id:"point", innerHTML: "Point location: " + Cesium.Math.toDegrees(pointPosRad.latitude) + " " + Cesium.Math.toDegrees(pointPosRad.longitude)}, pointId));
        pointDiv.appendChild(generateHTMLElement("p", {id:"vis", innerHTML:"Visibile: True"}, pointId));
        const removeElement = pointDiv.appendChild(generateHTMLElement("p", {id:"Remove", class: "removePoint", innerHTML:"Remove Point"}, pointId));
        return [pointDiv, removeElement, selectElement];
    }

    /**
     * Removes all the HTML for this FOV object
     *
     * @param pointContainer - element containing the point HTML
     */
    public destroy(pointContainer : HTMLElement) : void{
        pointContainer.remove();
        globalPoints.remove(this.point);
        for(const fov of globalFOV){
            fov.removeLineById(this.point.id);
        }
    }
}

/**
 * Generates a HTML element for given the elements tag and the elements attributes,
 * parentId is used when setting up unique ids for map objects
 *
 * @param el - The tag of the element to be generated
 * @param attrs - The attributes to be added to the HTML element
 * @param parentId - ID of the object creating the HTML (only needs to be specified in id attribute is declared)
 * @returns HTML element generated
 */
function generateHTMLElement(el : string, attrs : DictionaryLike, parentId? : string) {
    const newElement = document.createElement(el);
    for(const key in attrs) {
        if(key == "id"){
            newElement.setAttribute(key, parentId + attrs[key]);
        } else if(key == "innerHTML"){
            newElement.innerHTML = attrs[key];
        } else {
            newElement.setAttribute(key, attrs[key]);
        }
    }
    return newElement;
}
