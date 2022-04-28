import { Color } from './color.mjs';
// Creating a bitmap so that we can make an image in javascript.
export class Bitmap {
    data = null;
    width = 0;
    height = 0;
    constructor(width, height) {
	this.data = new Uint8ClampedArray(width * height * 4);
	this.width = width;
	this.height = height;
    }
    writePixel({r, g, b, a}, x, y) {
	let index = y * this.width * 4 + x * 4;
	
	this.data[index + 0] = r;
	this.data[index + 1] = g;
	this.data[index + 2] = b;
	this.data[index + 3] = a;
    }
    writeColors(image, x_offset = 0, y_offset = 0) {
	image.forEach((row, indey) => {
	    row.forEach((col, index) => {
		this.writePixel(col, index + x_offset, indey + y_offset);
	    });
	});
    }
    toImage() {
	// Create an canvas object, then load the data in
	// Copied from stack overflow because I hate javascript
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext('2d');

	canvas.width = this.width;
	canvas.height = this.height;

	let idata = ctx.createImageData(this.width, this.height);

	idata.data.set(this.data);

	ctx.putImageData(idata, 0, 0);

	return canvas;
	
    }
}
