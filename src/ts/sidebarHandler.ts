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
    if(slider.classList.contains("sideBarClosed")){
        CloseAll();
        slider.classList.remove("sideBarClosed");
        slider.classList.add("sideBarOpen");
        buttonContainer.classList.remove("buttonsClosed");
        buttonContainer.classList.add("buttonsOpen");
        sideBarSlidersContainer.classList.remove("sideBarClosed");
        sideBarSlidersContainer.classList.add("sideBarOpen");
        buttonElement.classList.remove("notSelectedButton");
        buttonElement.classList.add("selectedButton");
        console.log("Side bar opened");
    } else {
        CloseAll();
        slider.classList.remove("sideBarOpen");
        slider.classList.add("sideBarClosed");
        buttonContainer.classList.remove("buttonsOpen");
        buttonContainer.classList.add("buttonsClosed");
        sideBarSlidersContainer.classList.remove("sideBarOpen");
        sideBarSlidersContainer.classList.add("sideBarClosed");
        buttonElement.classList.remove("selectedButton");
        buttonElement.classList.add("notSelectedButton");
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
        sideBarSlidersButton?.classList.remove("selectedButton");
        sideBarSettingsButton?.classList.remove("selectedButton");
        sideBarLoggerButton?.classList.remove("selectedButton");
        sideBarManagerButton?.classList.remove("selectedButton");
        sideBarAddButton?.classList.remove("selectedButton");

        sideBarSlidersButton?.classList.add("notSelectedButton");
        sideBarSettingsButton?.classList.add("notSelectedButton");
        sideBarLoggerButton?.classList.add("notSelectedButton");
        sideBarManagerButton?.classList.add("notSelectedButton");
        sideBarAddButton?.classList.add("notSelectedButton");

        sideBarSliders.classList.remove("sideBarOpen");
        sideBarSliders.classList.add("sideBarClosed");

        sideBarSettings.classList.remove("sideBarOpen");
        sideBarSettings.classList.add("sideBarClosed");

        sideBarLogger.classList.remove("sideBarOpen");
        sideBarLogger.classList.add("sideBarClosed");

        sideBarManager.classList.remove("sideBarOpen");
        sideBarManager.classList.add("sideBarClosed");

        sideBarAdd.classList.remove("sideBarOpen");
        sideBarAdd.classList.add("sideBarClosed");
        // TODO Should use zIndex if the sliding menus are already open
        // Should use zIndex?  It is more clear that a menu switch has occured if one goes
        // In and another comes out, will need more thought on this.
        //SideBarSliders.style.zIndex = "0";
        //SideBarFOV.style.zIndex = "0";
    }
}
