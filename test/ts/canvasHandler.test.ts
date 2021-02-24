import { CanvasHandler } from "../../src/ts/canvasHandler";

/* eslint @typescript-eslint/no-magic-numbers: off */

describe("Canvas Handler tests", function() {
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    c.id = "ID";
    document.body.appendChild(c);

    it("Sets up click register and clicks", function() {
        const canvasH = new CanvasHandler(c);
        let some = 0;
        canvasH.onClick(([, ]) => {
            some = 100;
        });
        c.click();
        expect(some).toBe(100);
    });
});
