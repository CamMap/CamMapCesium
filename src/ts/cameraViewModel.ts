import * as Cesium from "cesium_source/Cesium";

class CameraViewModel {

    private cesiumRoot;
    
    private cameraPlaceholder: Cesium.Entity;

    private cameraData = {
        lat: 55.873704,
        lng: -4.291606,
        height: 30.0,
        heading: 0,
        tilt: 0,
        fov_h: 73.7,
        fov_v: 53.1,
    };

    constructor(cesiumRoot: Cesium.Viewer) {
        this.cesiumRoot = cesiumRoot;

        this.cameraPlaceholder = cesiumRoot.entities.add({
            name: "Camera icon",
            ellipsoid: {
                radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                material: Cesium.Color.RED.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
            },
        });
        this.rerender();
    }

    rerender(): void {
        // TODO
    }

    setLatLng(lat: number, lng: number): void {
        this.cameraData.lat = lat;
        this.cameraData.lng = lng;
        this.rerender();
    }

    setHeight(height: number): void {
        this.cameraData.height = height;
        this.rerender();
    }

    setHeading(heading: number): void {
        this.cameraData.heading = heading;
        this.rerender();
    }

    setTilt(tilt: number): void {
        this.cameraData.tilt = tilt;
        this.rerender();
    }

    setFovHor(fov_h: number): void {
        this.cameraData.fov_h = fov_h;
        this.rerender();
    }

    setFovVer(fov_v: number): void {
        this.cameraData.fov_v = fov_v;
        this.rerender();
    }

}

export default CameraViewModel;