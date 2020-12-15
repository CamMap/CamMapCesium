/**
 * A VGIP reciever using websockets
 *
 * @packageDocumentation
 */

import { VGIP, VideoGeoData } from "./vgip";
import ws from "ws";


/**
 * A receiver for data served over websockets using VGIP
 */
export class VGIPReciever{
    private recieveFunctions: { (val: VideoGeoData): void; }[];
    private vgip: VGIP;

    constructor(vd?: VideoGeoData){
        this.recieveFunctions = [];
        this.vgip = new VGIP(vd);
    }

    /**
     * Adds a websocket to the current websockets, so data can be recieved from there
     *
     * @param webSocketToAdd - The websocket to add to recieve geolocation data
     */
    public addWebSocket(webSocketToAdd: ws): void{
        // On incomming data, run the functions to run on recieve data
        webSocketToAdd.onmessage = d => {
            // Parse the data to VGIP
            const dataSent = this.vgip.parseXML(d.data.toString());

            // Then call event listeners
            for(const fn of this.recieveFunctions){
                fn(dataSent);
            }
        };
    }

    /**
     * @param address - The URL of the websocket server to connect to
     */
    public addWebSocketWithAddress(address: string): void{
        this.addWebSocket(new ws(address));
    }

    /**
     * Add a function to call on revieving the geolocation data
     *
     * @param fun - The function to run on the recieving data, in VideoGeoData format
     */
    public onRecieveData(fun: (val: VideoGeoData) => void): void{
        this.recieveFunctions.push(fun);
    }
}
