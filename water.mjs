
// What is a water tile?
// How can I model this, and how can I measure currents 
export class Water {
}

// I will model if there is water first.
export function generate_water(land_map, water_level) {
    return land_map.map(function (row) {
	return row.map(function (height) {
	    return (height < water_level)? water_level - height : 0;
	});
    });
}
