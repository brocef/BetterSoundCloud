/* global CanvasRenderingContext2D */

CanvasRenderingContext2D.prototype.fillTextOrig = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxwidth) {
	// We only need to add the duration if it isn't there already and if the text being drawn is a time
    if (!this.canvas.hasAttribute("duration") && text.match(/^(\d+:)?\d+:\d+$/)) {
        this.canvas.setAttribute("duration", text);
        this.canvas.classList.add("bscInitialized");
    }
    this.fillTextOrig(text, x, y, maxwidth);
};

History.prototype.pushStateOrig = History.prototype.pushState;
History.prototype.pushState = function (state, title, url) {
	this.pushStateOrig(state, title, url);
};
