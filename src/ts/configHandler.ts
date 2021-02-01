import { GeneralLogger } from "./logger";

const DEFAULT_CONFIG_LOCATION = "./config.json";

/**
 * Interface for a number of configuration options for the application
 */
export interface Config{
    defaultTerrainServer: string | undefined
}

/**
 * Load in the config file from the server
 *
 * @returns the config object containing the user config
 */
export function LoadConfigFromOwnServer(): Config{
    const fileRead = loadFile(DEFAULT_CONFIG_LOCATION);
    if(fileRead != null){
        const loadedJSON = JSON.parse(fileRead) as Config;
        return loadedJSON;
    } else {
        return {} as Config;
    }
}

/**
 * Load in the config file from the client computer,
 * i.e a file which they select and run a callback
 *
 * @param filePath - The location of the file, usually supplied from a input tag from HTML
 * @param callback - The callback to be called upon loading the file
 */
export function LoadConfigFromClient(filePath: Blob, callback: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null): void{
    const reader = new FileReader();
    reader.readAsText(filePath, "utf8");
    reader.onload = callback;
    reader.onerror = () => {
        GeneralLogger.info("Error reading client file");
    };
}


/**
 * @param filePath -  The path to the file on the server side
 * @returns the loaded file as a string or null if the file could not be loaded
 */
function loadFile(filePath: string): string | null {
    let result = null;
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    const OK = 200;
    if(xmlhttp.status == OK) {
        result = xmlhttp.responseText;
    } else {
        GeneralLogger.info("Failed to load file");
    }
    return result;
}
