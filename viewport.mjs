import { Bitmap } from './bitmap.mjs';
import { Color,
	 clear as no_color
       } from './color.mjs';
import { ControlBox }  from './controls.mjs';

// The color that is shown when nothing else is.
const bg_color = "#BBBBBB";
// The gradient colors I plan to use to express depth/height
// Depth is the first, height is the second, and there will be several colors in
// between.
const topo_gradient_cols = [
    new Color(0x33, 0x33, 0xFF, 0xFF),
    new Color(0x00, 0x99, 0x00, 0xFF),
];
const marker_col = new Color(0xFF, 0xFF, 0xFF, 0xFF);
const topo_gradient = topo_gradient_cols[0].gradient(topo_gradient_cols[1]);

const water_color = new Color(0x00, 0x00, 0x66, 0xAA);
const water_border_color = new Color(0xCC, 0xCC, 0xFF, 0xFF);

const wind_marker_color = new Color(0xFF, 0x22, 0x22, 0xFF);
const wind_samples_per_width = 25;

export class Viewport {
    
    constructor(canvas, control_panel, debug) {
	this.canvas = canvas;
	// set width and height of the viewport
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext('2d');
	this.control_panel = control_panel;
	this.debug = debug;
	this.canvas.addEventListener("click", this.updateDebug);
	this.wind = document.createElement("canvas");
	this.wind.width = this.width;
	this.wind.height = this.height;
	this.wind_radius = Math.ceil(this.width / wind_samples_per_width);
	this.wind_ctx = this.wind.getContext('2d');

    }

    display() {
	// Getting the information from the control panel
	let {
	    "Wind Vectors": wind,
	    "Display Topography": show_map,
	    "Display Water" : water,
	    "Display Clouds" : clouds,
	} = this.control_panel.getValues();
	// Clearing the canvas for redrawing.
	this.context.clearRect(0, 0, this.width, this.height);
	// Showing the map
	if (show_map) {
	    this.context.drawImage(this.topo.toImage(), 0, 0);
	}
	// Showing the water
	if (water) {
	    this.context.drawImage(this.water.toImage(), 0, 0);
	}
	// Showing the wind
	if (wind) {
	    // Draw wind
	    this.context.drawImage(this.wind, 0, 0);
	}
	
    }

    updateDebug(event) {
	this.debug.innerHTML = "Hello There!";
	console.log(event);
    }

    set world_map(data) {
	// something something something,
	// do something to the data to turn it into a bitmap the size of width and
	// height.
	this.topo = new Bitmap(this.width, this.height);
	let glmax = Math.max(...data.map((r) => { return Math.max(...r); }));
	let glmin = Math.min(...data.map((r) => { return Math.min(...r); }));
	let gldif = glmax - glmin;
	function unitrans(datapoint) {
	    return (datapoint - glmin) / gldif;
	}
	function iunitrans(datapoint) {
	    return datapoint * gldif + glmin;
	}
	// This is hell to debug
	let colorized = data.map((r) => {
	    return r.map(unitrans).map((h) => {
		if (Math.floor(iunitrans(h)) % 50 == 0) {
		    return marker_col;
		} else {
		    return topo_gradient(1 - h);
		}
	    });
	});
	this.topo.writeColors(colorized);
    }
    set water_map(data) {
	this.water = new Bitmap(this.width, this.height);
	this.water.writeColors(data.map((row) => {
	    return row.map((element) => {
		if (element <= 0)
		    return no_color;
		else if (element < 1)
		    return water_border_color;
		else
		    return water_color;
	    });
	}));
		    
    }

    set wind_map(data) {
	this.wind_ctx.clearRect(0, 0, this.width, this.height);
	this.wind_ctx.strokeStyle = wind_marker_color.toString();
	for (let base_y = this.wind_radius; base_y < this.height;
	     base_y += this.wind_radius * 2) {
	    for (let base_x = this.wind_radius; base_x < this.width;
		 base_x += this.wind_radius * 2) {

		// Sampling the contents of the cells
		let { dir : theta } = data[base_y][base_x]; 

		// Draw a wind vector based on recieved data.
		// This will only draw wind direction
		// But for now, just draw whatever is necessary.
		this.wind_ctx.moveTo(base_x, base_y);
		
		// Convert theta to radians
		let theta_radians = theta * Math.PI / 180;
		this.wind_ctx.lineTo
		(base_x + Math.cos(theta_radians) * this.wind_radius,
		 base_y - Math.sin(theta_radians) * this.wind_radius);
		// this.wind_ctx.closePath();
		this.wind_ctx.stroke();
	    }
	}
    }
}

export function viewport_test(viewport) {
    let height_map = new Array(viewport.height);

    for (let i = 0; i < height_map.length; i++) {
	height_map[i] = new Array(viewport.width).fill(i);
    }

    viewport.world_map = height_map;

    viewport.display();
}
