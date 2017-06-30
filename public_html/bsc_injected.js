CanvasRenderingContext2D.prototype.fillTextOrig = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxwidth) {
    console.log("Drawing "+text+" at "+x+","+y);
    console.log(this.canvas);
    this.fillTextOrig(text, x, y, maxwidth);
}
