const sideBarSliderButtons = document.getElementById("sideBarSlidersButtonContainer");

const sideBarSlidersButton = document.getElementById("sideBarSlidersButton");
const sideBarSliders = document.getElementById("sideBarSliders");

const sideBarFOVButton = document.getElementById("sideBarFovOptionsButton");
const sideBarFOV = document.getElementById("sideBarFovOptions");

const sideBarSlidersContainer = document.getElementById("sideBarSlidersContainer") as HTMLElement;

/**
 * Handles the clicks on a side bar button
 *
 * @param buttonContainer - The container for the buttons
 * @param slider - The actual sliding menu to slide out
 */
function onClicksideBarSlidersButton(buttonContainer: HTMLElement, slider: HTMLElement): void{
    if(slider.classList.contains("sideBarClosed")){
        CloseAll();
        slider.classList.remove("sideBarClosed");
        slider.classList.add("sideBarOpen");
        buttonContainer.classList.remove("sideBarClosed");
        buttonContainer.classList.add("sideBarOpen");
        sideBarSlidersContainer.classList.remove("sideBarClosed");
        sideBarSlidersContainer.classList.add("sideBarOpen");
        console.log("Side bar opened");
    } else {
        CloseAll();
        slider.classList.remove("sideBarOpen");
        slider.classList.add("sideBarClosed");
        buttonContainer.classList.remove("sideBarOpen");
        buttonContainer.classList.add("sideBarClosed");
        sideBarSlidersContainer.classList.remove("sideBarOpen");
        sideBarSlidersContainer.classList.add("sideBarClosed");
        console.log("Side bar closed");
    }
}

/* Set up the on click listener */

if(sideBarSliders != null && sideBarSlidersButton != null && sideBarSliderButtons != null){
    sideBarSlidersButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarSliders);
} else {
    console.log("sideBarSliders is null");
}

if(sideBarFOV != null && sideBarFOVButton != null && sideBarSliderButtons != null){
    sideBarFOVButton.onclick = () => onClicksideBarSlidersButton(sideBarSliderButtons, sideBarFOV);
} else {
    console.log("sideBarFOV is null");
}

/**
 * Set the z-index of all the HTML slider menus to 0
 */
function CloseAll(){
    if(sideBarSliders != null && sideBarFOV != null){
        sideBarSliders.classList.remove("sideBarOpen");
        sideBarSliders.classList.add("sideBarClosed");

        sideBarFOV.classList.remove("sideBarOpen");
        sideBarFOV.classList.add("sideBarClosed");
        // TODO Should use zIndex if the sliding menus are already open
        // Should use zIndex?  It is more clear that a menu switch has occured if one goes
        // In and another comes out, will need more thought on this.
        //SideBarSliders.style.zIndex = "0";
        //SideBarFOV.style.zIndex = "0";
    }
}
