/* global CanvasRenderingContext2D */

CanvasRenderingContext2D.prototype.fillTextOrig = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxwidth) {
    /*
    console.log("Drawing "+text+" at "+x+","+y);
    console.log(this.canvas);
    */
    if (!this.canvas.hasAttribute("duration") && text.match(/^(\d+:)?\d+:\d+$/)) {
        this.canvas.setAttribute("duration", text);
        this.canvas.classList.add("bscInitialized");
    }
    this.fillTextOrig(text, x, y, maxwidth);
};
