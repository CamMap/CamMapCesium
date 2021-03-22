import * as constants from "./consts";

/**
 * Handles the clicks on a tab button
 *
 * @param buttonElement - The button of the tab being selected
 * @param tab - The canvas HTML
 */
export function onClickTabButton(buttonElement: HTMLElement, tab: HTMLElement): void{
    if(tab.classList.contains(constants.TAB_CLOSED)){
        tab.classList.remove(constants.TAB_CLOSED);
        tab.classList.add(constants.TAB_OPEN);
        buttonElement.classList.remove(constants.TAB_NOT_SELECTED);
        buttonElement.classList.add(constants.TAB_SELECTED);
        console.log("Tab opened");
    } else {
        tab.classList.remove(constants.TAB_OPEN);
        tab.classList.add(constants.TAB_CLOSED);
        buttonElement.classList.remove(constants.TAB_SELECTED);
        buttonElement.classList.add(constants.TAB_NOT_SELECTED);
        console.log("Tab closed");
    }
}
