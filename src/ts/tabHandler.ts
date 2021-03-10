/**
 * Handles the clicks on a tab button
 *
 * @param buttonElement - The button of the tab being selected
 * @param tab - The canvas HTML
 */
export function onClickTabButton(buttonElement: HTMLElement, tab: HTMLElement): void{
    if(tab.classList.contains("tabClosed")){
        tab.classList.remove("tabClosed");
        tab.classList.add("tabOpen");
        buttonElement.classList.remove("notSelectedTabButton");
        buttonElement.classList.add("selectedTabButton");
        console.log("Tab opened");
    } else {
        tab.classList.remove("tabOpen");
        tab.classList.add("tabClosed");
        buttonElement.classList.remove("selectedTabButton");
        buttonElement.classList.add("notSelectedTabButton");
        console.log("Tab closed");
    }
}
