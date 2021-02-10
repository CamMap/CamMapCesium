/**
 * This is for the vgip protocol for sending and recieving
 * geolocated video data
 *
 * @packageDocumentation
 */

import { VGIPLogger } from "./logger";

/**
 * The video geolocation data that the program can store
 */
export interface VideoGeoData{
    latitude?: number | null,
    longitude?: number | null,
    heading?: number | null,
    tilt?: number | null,
    bearing?: number | null
}

/**
 * The data about the video frame
 */
interface FrameData{
    number: number,
    bits: number
}

/**
 * This class should be instanciated and used
 * beacuse the values can "carry over" from the
 * previous value given how the vgip protocol is implemented
 */
export class VGIP{
    private prevLatitude: number | undefined;
    private prevLongitiude: number | undefined;
    private prevBearing: number | undefined;
    private prevHeading: number | undefined;
    private prevTilt: number | undefined;


    constructor(vd?: VideoGeoData){
        // Nothing is defined at the start
        this.prevLatitude = undefined;
        this.prevLongitiude = undefined;
        this.prevBearing = undefined;
        this.prevLatitude = undefined;
        this.prevLatitude = undefined;

        if(vd != undefined){
            // Sets these as the values
            if(vd.latitude != null){
                this.prevLatitude = vd.latitude;
            }
            if(vd.longitude != null){
                this.prevLongitiude = vd.longitude;
            }
            if(vd.heading != null){
                this.prevHeading = vd.heading;
            }
            if(vd.bearing != null){
                this.prevBearing = vd.bearing;
            }
            if(vd.tilt != null){
                this.prevTilt = vd.tilt;
            }
        }
    }

    /**
     * Parse the XML to give the Geolocation information as output
     * TODO: Should find out when elements are being input through this channel,
     * might not be all of them, i.e could be only latitude, and the others going
     * through a different channel
     *
     * @param xmlString - The xml string to be parsed
     * @returns VideoGeoData interface, the parsed geolocation data
     */
    public parseXML(xmlString: string): VideoGeoData{
        try {
            const parsedXMLString = new DOMParser().parseFromString(xmlString, "text/xml");

            const frames = parsedXMLString.getElementsByTagName("frame");

            if(frames.length != 0){
                const frame: Element = frames[0];

                const frameNum = frame.getAttribute("number");
                if(frameNum != null){
                    // Get frame integer and bits, TODO
                    // Then can syncronise these with the video to give coherent output (i.e not de-syncronised)
                    //Const _frameInt = parseInt(frameNum);
                }

                let latitude = this.parseGeoElement(frame.getElementsByTagName("latitude")[0]);
                if(latitude == null){
                    // Use previous value
                    if(this.prevLatitude != undefined){
                        latitude = this.prevLatitude;
                    }
                } else {
                    this.prevLongitiude = latitude;
                }

                let longitude = this.parseGeoElement(frame.getElementsByTagName("longitude")[0]);
                if(longitude == null){
                    // Use previous value
                    if(this.prevLongitiude != undefined){
                        longitude = this.prevLongitiude;
                    }
                } else {
                    this.prevLongitiude = longitude;
                }


                let heading = this.parseGeoElement(frame.getElementsByTagName("heading")[0]);
                if(heading == null){
                    // Use previous value
                    if(this.prevHeading != undefined){
                        heading = this.prevHeading;
                    }
                } else {
                    this.prevHeading = heading;
                }

                let tilt = this.parseGeoElement(frame.getElementsByTagName("tilt")[0]);
                if(tilt == null){
                    // Use previous value
                    if(this.prevTilt != undefined){
                        tilt = this.prevTilt;
                    }
                } else {
                    this.prevTilt = tilt;
                }

                let bearing = this.parseGeoElement(frame.getElementsByTagName("bearing")[0]);
                if(bearing == null){
                    // Use previous value
                    if(this.prevBearing != undefined){
                        bearing = this.prevBearing;
                    }
                } else {
                    this.prevBearing = bearing;
                }

                return {
                    latitude: latitude,
                    longitude: longitude,
                    heading: heading,
                    tilt: tilt,
                    bearing: bearing,

                };
            } else {
                VGIPLogger.error("Malformed VGIP input, there was no 'frame' element found in the XML.");
                return {};
            }
        } catch (e){
            VGIPLogger.error("Error encountered when parsing VGIP input: " + e);
            return {};
        }
    }

    /**
     * Parse a GeoElement from the XML data, this is for
     * internal use only
     *
     * @param XMLtag - The XML Geo tag to parse, the format must be in the form expected by VGIP
     * @returns the Geo data
     */
    private parseGeoElement(XMLtag: Element | null): number | null {
        if(XMLtag != null){
            const xmlValStr = XMLtag.getAttribute("value");
            if(xmlValStr != null){
            // Latitude was given
                const valFloat = parseFloat(xmlValStr);
                if(Number.isNaN(valFloat)){
                // Malformed input, report and continue with
                // Prev value
                    VGIPLogger.warn("Malformed input value for " + XMLtag.tagName + ", input was " + valFloat);
                } else {
                    return valFloat;
                }
            } else {
                VGIPLogger.warn("Malformed input for " + XMLtag.tagName + ", could not find 'value' attribute");
            }
        }
        return null;
    }


    /**
     * Convert VideoGeoData to a VGIP XML string to send
     *
     * @param fd - The frame data
     * @param gd - The geo data to package
     * @returns The XML string to send
     */
    public ToVGIP(fd: FrameData, gd: VideoGeoData): string {
        // First set up vgip, then frame
        const XMLdoc = document.implementation.createDocument("", "", null);

        const vgip = XMLdoc.createElement("vgip");
        vgip.setAttribute("version", "1.0");

        const frame = XMLdoc.createElement("frame");
        frame.setAttribute("number", String(fd.number));
        frame.setAttribute("bits", String(fd.bits));

        // Now check if each of the values is defined and for each that is
        // Put them into the xml
        this.makeXMLGeoData(
            "latitude", gd.latitude, XMLdoc, frame
        );
        this.makeXMLGeoData(
            "longitude", gd.longitude, XMLdoc, frame
        );
        this.makeXMLGeoData(
            "heading", gd.heading, XMLdoc, frame
        );
        this.makeXMLGeoData(
            "bearing", gd.bearing, XMLdoc, frame
        );
        this.makeXMLGeoData(
            "tilt", gd.tilt, XMLdoc, frame
        );

        XMLdoc.appendChild(vgip);
        return new XMLSerializer().serializeToString(XMLdoc);
    }

    /**
     * Turns a string and a value into xml given the parameters.
     * For internal use only.
     *
     * @param str - The geodata string in xml
     * @param val - The geodata value
     * @param xmlDoc - The xml document
     * @param xmlElement -  The xml element to add it to as a child
     */
    private makeXMLGeoData(
        str: string, val: number | null | undefined, xmlDoc: Document, xmlElement: Element
    ){
        if(val != undefined && val != null){
            const ele = xmlDoc.createElement(str);
            xmlElement.setAttribute("value", String(val));
            xmlElement.appendChild(ele);
        } else {
            VGIPLogger.debug("Value to put in the XML for the geodata element " + str + " was either null or undefined, this is ok, this element simply will not be added to the VGIP packet being sent");
        }
    }
}
