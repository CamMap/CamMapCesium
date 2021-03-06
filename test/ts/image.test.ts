import { FOV } from "../../src/ts/fov";
import { Image } from "../../src/ts/image";
import { Viewer } from "cesium_source/Cesium";

/* eslint @typescript-eslint/no-magic-numbers: off */

describe("Image tests", function() {
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    c.id = "ID";
    document.body.appendChild(c);

    const imgElement = document.createElement("input");
    imgElement.id = "Camera 1_uploadFile";
    document.body.appendChild(imgElement);

    const viewer = new Viewer("ID", {
        animation: false,
        timeline: false,
        geocoder: false,
        selectionIndicator: false,
        infoBox: false,
        vrButton: false,
        fullscreenButton: false,
    });

    it("Sets up Image and adds a image", function() {
        const fov = new FOV(
            viewer.scene, [ -107.0, 40.0, 100000.0], 60, 1, 90, -45, 0, 10000, 300000
        );
        new Image(fov);
        imgElement.src = "./Images/EiffelTowerPublicDomain.jpg";
        const changeEvent = new Event("change");
        imgElement.dispatchEvent(changeEvent);
    });
});
