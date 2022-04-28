import { ControlBox } from './controls.mjs';
import { Viewport, viewport_test } from './viewport.mjs';
import { generate_map } from './map.mjs';
import { generate_water } from './water.mjs';
import { generation_presets as genp,
	 view_presets as viewp,
	 world_presets as worldp,
	 world_constants as worldc,
       } from './presets.mjs';
import { calculate_wind, calculate_slopes } from './wind.mjs';
// Getting the assets from the screens
let viewport = document.getElementById("viewport");
let worldControls = document.getElementById("world-controls");
let viewControls = document.getElementById("view-controls");
let generationControls = document.getElementById("generation-controls");
// Setting up the world controls
let control_world = new ControlBox(worldControls, {
    "World Controls"     : "title",
    "Latitude"           : worldp.lat,
    "Longitude"          : worldp.long,
    "Season Tilting"     : worldp.tilting,
    "Water Level"        : worldp.water_level,
    "Wind Direction (°)" : worldp.wind_direction,
    "Wind Speed"         : worldp.wind_speed,
    "Wind Level"         : worldp.wind_level, 
    "Reload"             : "button",
    "Simulate Wind"      : "button",
});

let control_view = new ControlBox(viewControls, {
    "View Controls"      : "title",
    "Display Topography" : viewp.land,
    "Wind Vectors"       : viewp.wind,
    "Display Water"      : viewp.water,
    "Display Clouds"     : viewp.clouds,
});

let debug_information = document.createElement("p");
debug_information.id = 'dbug';
viewControls.appendChild(debug_information);

let control_generation = new ControlBox(generationControls, {
    "Generation Controls" : "title",
    "Maximum Height"      : genp.max_height,
    "Minimum Height"      : genp.min_height,
    "Noise Factor"        : genp.noise,
    "Randomize Terrain"   : "button",
});

let vp_obj = new Viewport(viewport, control_view, debug_information);
let {width : wwidth, height: wheight } = worldc;
// Generating the initial world
let topo_map = generate_map(wwidth, wheight, genp.max_height, genp.min_height,
			   genp.noise); 
vp_obj.world_map = topo_map;

// Generating the water
let water_bodies = generate_water(topo_map, worldp.water_level);
vp_obj.water_map = water_bodies;

// Generating the wind layer
function simulate_wind() {
    let {"Wind Direction (°)" : wdir,
	 "Water Level" : watlev,
	 "Wind Speed": wspd,
	 "Wind Level": winlev,
	} = control_world.getValues();
    let wind_slopes, calculated_wind;
    let calculation_promise = new Promise(function (resolve, reject) {
	wind_slopes = calculate_slopes(topo_map,
				       parseFloat(watlev), parseInt(winlev));
	calculated_wind = calculate_wind(wind_slopes,
					 parseFloat(wdir), parseFloat(wspd),
					 parseFloat(winlev));
	resolve();
    }).then(function () {
	vp_obj.wind_map = calculated_wind;
	vp_obj.display();
    });
}
control_world.dom_elements["Simulate Wind"]
    .addEventListener("click", simulate_wind);
// Putting it all on screen
vp_obj.display();
   
// viewport_test(vp_obj);
function reload_map() {
    let {"Maximum Height" : max_height,
	 "Minimum Height" : min_height,
	 "Noise Factor" : noise,
	} = control_generation.getValues();

    
    topo_map = generate_map(wwidth, wheight,
			    parseFloat(max_height), parseFloat(min_height),
			    parseFloat(noise));
    
    regenerate_map();
    
    vp_obj.world_map = topo_map;
    
    vp_obj.display();
}
control_generation
    .dom_elements["Randomize Terrain"]
    .addEventListener("click", reload_map);

function regenerate_map() {
    // I will use this to do world controls
    let { "Water Level" : wlevel,
	} = control_world.getValues();
    water_bodies = generate_water(topo_map, wlevel);
    vp_obj.water_map = water_bodies;

    return;
}
control_world.dom_elements["Reload"].addEventListener("click", function () {
    regenerate_map();
    vp_obj.display();
});
