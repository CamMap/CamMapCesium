/**
 * Handles the clicks on the side bar button
 */
function onClicksideBarSlidersButton(): void{
    const sideBarSliders = document.getElementById("sideBarSlidersContainer");
    const sideBarSliderButtons = document.getElementById("sideBarSlidersButtonContainer");
    if(sideBarSliders != null && sideBarSliderButtons != null){
        if(sideBarSliders.className == "sideBarSlidersClosed"){
            sideBarSliders.className = "sideBarSlidersOpen";
            sideBarSliderButtons.className = "sideBarSlidersOpen";
            console.log("Side bar opened");
        } else {
            sideBarSliders.className = "sideBarSlidersClosed";
            sideBarSliderButtons.className = "sideBarSlidersClosed";
            console.log("Side bar closed");
        }
    }
}

/* Set up the on click listener */
const sideBarSliders = document.getElementById("sideBarSlidersButton");
if(sideBarSliders != null){
    sideBarSliders.onclick = onClicksideBarSlidersButton;
} else {
    console.log("sideBarSliders is null");
}
