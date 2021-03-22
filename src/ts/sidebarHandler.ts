import * as constants from "./consts";

const sideBarSliderButtons = document.getElementById("sideBarSlidersButtonContainer");

const sideBarSlidersButton = document.getElementById("sideBarSlidersButton");
const sideBarSliders = document.getElementById("sideBarSliders");

const sideBarSettingsButton = document.getElementById("sideBarSettingsButton");
const sideBarSettings = document.getElementById("sideBarSettings");

const sideBarLoggerButton = document.getElementById("sideBarLoggerButton");
const sideBarLogger = document.getElementById("sideBarLogger");

const sideBarManagerButton = document.getElementById("sideBarManagerButton");
const sideBarManager = document.getElementById("sideBarManager");

const sideBarAddButton = document.getElementById("sideBarAddButton");
const sideBarAdd = document.getElementById("sideBarAdd");


const sideBarSlidersContainer = document.getElementById("sideBarSlidersContainer") as HTMLElement;

/**
 * Handles the clicks on a side bar button
 *
 * @param buttonContainer - The container for the buttons
 * @param buttonElement - The button of the slected slider been selected
 * @param slider - The actual sliding menu to slide out
 */
function onClicksideBarSlidersButton(buttonContainer: HTMLElement, buttonElement: HTMLElement, slider: HTMLElement): void{
    if(slider.classList.contains(constants.SIDEBAR_CLOSED)){
        CloseAll();
        slider.classList.remove(constants.SIDEBAR_CLOSED);
        slider.classList.add(constants.SIDEBAR_OPEN);
        buttonContainer.classList.remove(constants.SIDEBAR_BUTTONS_CLOSED);
        buttonContainer.classList.add(constants.SIDEBAR_BUTTONS_OPEN);
        sideBarSlidersContainer.classList.remove(constants.SIDEBAR_CLOSED);
        sideBarSlidersContainer.classList.add(constants.SIDEBAR_OPEN);
        buttonElement.classList.remove(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        buttonElement.classList.add(constants.SIDEBAR_SELECTED_BUTTON);
        console.log("Side bar opened");
    } else {
        CloseAll();
        slider.classList.remove(constants.SIDEBAR_OPEN);
        slider.classList.add(constants.SIDEBAR_CLOSED);
        buttonContainer.classList.remove(constants.SIDEBAR_BUTTONS_OPEN);
        buttonContainer.classList.add(constants.SIDEBAR_BUTTONS_CLOSED);
        sideBarSlidersContainer.classList.remove(constants.SIDEBAR_OPEN);
        sideBarSlidersContainer.classList.add(constants.SIDEBAR_CLOSED);
        buttonElement.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);
        buttonElement.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        console.log("Side bar closed");
    }
}

/* Set up the on click listener */

if(sideBarSliders != null && sideBarSlidersButton != null && sideBarSliderButtons != null){
    sideBarSlidersButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarSlidersButton, sideBarSliders);
} else {
    console.log("sideBarSliders is null");
}

if(sideBarSettings != null && sideBarSettingsButton != null && sideBarSliderButtons != null){
    sideBarSettingsButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarSettingsButton, sideBarSettings);
} else {
    console.log("sideBarSettings is null");
}

if(sideBarLogger != null && sideBarLoggerButton != null && sideBarSliderButtons != null){
    sideBarLoggerButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarLoggerButton, sideBarLogger);
} else {
    console.log("sideBarLogger is null");
}

if(sideBarManager != null && sideBarManagerButton != null && sideBarSliderButtons != null){
    sideBarManagerButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarManagerButton, sideBarManager);
} else {
    console.log("sideBarManager is null");
}

if(sideBarAdd != null && sideBarAddButton != null && sideBarSliderButtons != null){
    sideBarAddButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarAddButton, sideBarAdd);
} else {
    console.log("sideBarTerrain is null");
}

/**
 * Set the z-index of all the HTML slider menus to 0
 */
function CloseAll(){
    if(sideBarSliders != null && sideBarSettings != null && sideBarLogger != null && sideBarManager != null && sideBarAdd != null){
        sideBarSlidersButton?.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);
        sideBarSettingsButton?.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);
        sideBarLoggerButton?.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);
        sideBarManagerButton?.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);
        sideBarAddButton?.classList.remove(constants.SIDEBAR_SELECTED_BUTTON);

        sideBarSlidersButton?.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        sideBarSettingsButton?.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        sideBarLoggerButton?.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        sideBarManagerButton?.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);
        sideBarAddButton?.classList.add(constants.SIDEBAR_NOT_SELECTED_BUTTON);

        sideBarSliders.classList.remove(constants.SIDEBAR_OPEN);
        sideBarSliders.classList.add(constants.SIDEBAR_CLOSED);

        sideBarSettings.classList.remove(constants.SIDEBAR_OPEN);
        sideBarSettings.classList.add(constants.SIDEBAR_CLOSED);

        sideBarLogger.classList.remove(constants.SIDEBAR_OPEN);
        sideBarLogger.classList.add(constants.SIDEBAR_CLOSED);

        sideBarManager.classList.remove(constants.SIDEBAR_OPEN);
        sideBarManager.classList.add(constants.SIDEBAR_CLOSED);

        sideBarAdd.classList.remove(constants.SIDEBAR_OPEN);
        sideBarAdd.classList.add(constants.SIDEBAR_CLOSED);
        // TODO Should use zIndex if the sliding menus are already open
        // Should use zIndex?  It is more clear that a menu switch has occured if one goes
        // In and another comes out, will need more thought on this.
        //SideBarSliders.style.zIndex = "0";
        //SideBarFOV.style.zIndex = "0";
    }
}
