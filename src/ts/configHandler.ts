import { GeneralLogger } from "./logger";
import { applyConfig} from "./main_helper";

/**
 * Interface for a number of configuration options for the application
 */
export interface Config{
    defaultTerrainServer: string | undefined
    cameras: Array<ConfigCamera>
    position: ConfigCameraPosition
}

interface ConfigCameraPosition {
    lat: number
    lng: number
    elevation: number
}

interface ConfigCamera{
    name: string
    lat: number
    lng: number
    elevation: number
    fov: number
    aspectRatio: number
    theta: number
    phi: number
    roll: number
    near: number
    far: number
    vgip: string
}

/**
 * Handles configs and related stuff
 */
export class ConfigHandler{
    viewer: Cesium.Viewer;
    constructor(viewer : Cesium.Viewer){
        this.viewer = viewer;
        this.loadConfigFromCurrentUrl();
    }


    /**
     * Loads in config from url param ?config=xxx
     * parses it from base64 and sends further to be applied
     */
    loadConfigFromCurrentUrl(): void{
        this.setupLoadConfigButton();

        const ibconfig = new URLSearchParams(window.location.search).get("config");
        if(ibconfig == null) {
            GeneralLogger.warn("No config provided, skipping");
            return;
        }
        try {
            this.createAndAplyConfig(atob(ibconfig));
        } catch {
            GeneralLogger.warn("Failed to parse provided config, ignoring");
        }
    }


    /**
     * Apply the config object to associated viewer
     *
     * @param rawConfig - a json string to be converted to Config and applied
     */
    createAndAplyConfig(rawConfig: string): void {
        const config = JSON.parse(rawConfig);
        applyConfig(this.viewer, config);
    }

    /**
     * Load in the config file from the client computer,
     * i.e a file which they select and run a callback
     *
     * @param filePath - The location of the file, usually supplied from a input tag from HTML
     */
    loadConfigFromClient(filePath: File | null): void{
        if(filePath != null) {
            const reader = new FileReader();
            reader.readAsText(filePath, "utf8");
            reader.onload = (event) => {
                this.createAndAplyConfig(event.target?.result as string);
            };
            reader.onerror = (e) => {
                GeneralLogger.error("Error loading config: " + e);
            };
        }
    }


    /**
     * Load in the config file from the client computer,
     * i.e a file which they select and run a callback
     */
    setupLoadConfigButton(): void {
        const confFileButton = document.getElementById("confFile") as HTMLInputElement;
        if(confFileButton != null) {
            confFileButton.addEventListener("change", () => {
                if(confFileButton.files) {
                    if(confFileButton.files.length > 1) {
                        alert("Only 1 file can be selected");
                        GeneralLogger.error("Did not laod config files, only 1 can be leceted at a time");
                    } else if(confFileButton.files.length == 1) {
                        this.loadConfigFromClient(confFileButton.files.item(0));
                    }
                }
            });
        }
    }
}
