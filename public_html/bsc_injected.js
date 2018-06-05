/*
Copyright (C) 2018 Brian Cefali

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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
