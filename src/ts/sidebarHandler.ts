/**
 * Handles the clicks on the side bar button
 */
function onClickSideBarButton(): void{
    const sideBar = document.getElementById("SideBarContainer");
    if(sideBar != null){
        if(sideBar.className == "sideBarClosed"){
            sideBar.className = "sideBarOpen";
            console.log("Side bar opened");
        } else {
            sideBar.className = "sideBarClosed";
            console.log("Side bar closed");
        }
    }
}

/* Set up the on click listener */
const sideBar = document.getElementById("sideBarButton");
if(sideBar != null){
    sideBar.onclick = onClickSideBarButton;
} else {
    console.log("sideBar is null");
}
