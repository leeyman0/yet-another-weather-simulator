// Slopes are the sides that surround them
// Defining accessors & mutators for numbered slopes
const TOP_SLOPE   = 0b100000;
const NORTH_SLOPE = 0b010000;
const EAST_SLOPE  = 0b001000;
const WEST_SLOPE  = 0b000100;
const SOUTH_SLOPE = 0b000010;
const BOT_SLOPE   = 0b000001;
const ALL_SIDES   = 0b111111;

// top slope should not be used yet except
function slope_top_set(slope) {
    return TOP_SLOPE & slope !== 0;
}
function slope_north_set(slope) {
    return NORTH_SLOPE & slope !== 0;
}
function slope_east_set(slope) {
    return EAST_SLOPE & slope !== 0;
}
function slope_west_set(slope) {
    return WEST_SLOPE & slope !== 0;
}
function slope_south_set(slope) {
    return SOUTH_SLOPE & slope !== 0;
}
function slope_bot_set(slope) {
    return BOT_SLOPE & slope !== 0;
}
function free_positions(slope) {
    return !slope;
}


export function calculate_slopes(topo_map, water_level, air_level) {
    // This function generates slopes based on a map

    // It only generates above a water level, because that is the space that the
    // wind inhabits.
    const map_depth  = Math.min(...topo_map.map(function (row) {
	return Math.min(...row);
    }));
    const map_height = Math.max(...topo_map.map(function (row) {
	return Math.max(...row);
    }));
    const map_length = topo_map.length;
    const map_width = topo_map[0].length;
    
    function calculate_slope_at(x, y, level) {
	// What cells are inhabited
	// All edge cells are uninhabited
	let ret = 0b000000;
	if (topo_map[y][x] > level) {
	    ret |= TOP_SLOPE | BOT_SLOPE;
	} else if (topo_map[y][x] >= level) {
	    ret |= BOT_SLOPE;
	}
	if (y+1 >= map_length) {
	    ret |= NORTH_SLOPE;
	} else if (topo_map[y+1][x] > level) {
	    ret |= NORTH_SLOPE;
	}
	if (y-1 < 0) {
	    ret |= SOUTH_SLOPE;
	} else if (topo_map[y-1][x] > level) {
	    ret |= SOUTH_SLOPE;
	}
	if (x+1 > map_width) {
	    ret |= EAST_SLOPE;
	} else if (topo_map[y][x+1] > level) {
	    ret |= EAST_SLOPE;
	}
	if (x-1 < 0) {
	    ret |= WEST_SLOPE;
	} else if (topo_map[y][x-1] > level) {
	    ret |= WEST_SLOPE;
	}
	return ret;
    }
    // Generate slopes for positions at air_level.
    // The slopes that we calculate are going to be held as the bitwise &
    // of all sides that are inhabited
    return topo_map.map(function (z, y) {
	return z.map(function (bottom_level, x) {
	    if (bottom_level > air_level)
		return ALL_SIDES;
	    else
		return calculate_slope_at(x, y, air_level);
	});
    });
    
}

const gravity_pressure_factor = 0.1;

const steps_simulated = 100;

const wall_absorption_factor = 0.5;

function wind_cell(mag, dir) {
    return {
	mag,
	dir,
    };
}

export function calculate_wind(slopes, wind_direction, wind_speed, air_level) {
    // Calculate what side the wind comes from
    const N_SIDE_WIND = wind_direction < 180,
	  S_SIDE_WIND = wind_direction > 180,
	  E_SIDE_WIND = wind_direction > 270 || wind_direction < 90,
	  W_SIDE_WIND = wind_direction < 270 && wind_direction > 90;

    const HEIGHT = slopes.length,
	  WIDTH = slopes[0].length;
    // Initializing arrays
    let wind_grounds = new Array(slopes.length);
    for (let i = 0; i < wind_grounds.length; i++) {
	wind_grounds[i] = new Array(slopes[i].length);
	for (let j = 0; j < wind_grounds[i].length; j++)
	{
	    if (slopes[i][j] === ALL_SIDES) // Nothing is there
		wind_grounds[i][j] = wind_cell(0, 0); // Only ground, and stagnance
	    else
		wind_grounds[i][j] = wind_cell(wind_direction, wind_speed);
	}
    }
    /* Good Lord, this was painful to write */
    function calculate_contributions(x, y, cell) {
	const dir_radians = cell.dir * Math.PI / 180;
	const sin_dir = Math.sin(dir_radians),
	      cos_dir = Math.cos(dir_radians);
	let ic = {
	    n : Math.max(cell.mag * sin_dir, 0),
	    s : Math.max(cell.mag * -sin_dir, 0),
	    e : Math.max(cell.mag * -cos_dir, 0),
	    w : Math.max(cell.mag * cos_dir, 0),
	};
	const sdir_radians = wind_direction * Math.PI / 180;
	const ssin_dir = Math.sin(sdir_radians),
	      scos_dir = Math.cos(sdir_radians);
	let sc = {
	    n : Math.max(wind_speed * ssin_dir, 0),
	    s : Math.max(wind_speed * -ssin_dir, 0),
	    e : Math.max(wind_speed * -scos_dir, 0),
	    w : Math.max(wind_speed * scos_dir, 0),
	};
	let intermediate;
	switch (x) {
	case 0:
	case WIDTH - 1:
	    intermediate = sc;
	    break;
	default:
	    switch (y) {
	    case 0:
	    case HEIGHT - 1:
		intermediate = sc;
		break;
	    default:
		intermediate = ic;
		break;
	    }
	    break;
	}
	const slope = slopes[y][x];
	// Take reflections into account
	if (slope_north_set(slope) && slope_south_set(slope))
	    intermediate.n = 0, intermediate.s = 0;
	else if (slope_north_set(slope))
	    intermediate.s += (1 - wall_absorption_factor) * intermediate.n;
	else if (slope_south_set(slope))
	    intermediate.n += (1 - wall_absorption_factor) * intermediate.s;
	if (slope_east_set(slope) && slope_west_set(slope))
	    intermediate.e = 0, intermediate.w = 0;
	else if (slope_east_set(slope))
	    intermediate.w += (1 - wall_absorption_factor) * intermediate.e;
	else if (slope_west_set(slope))
	    intermediate.e += (1 - wall_absorption_factor) * intermediate.w;

	return intermediate;
	
    }
    
    for (let i = 0; i < steps_simulated; i++) {
	// Calculating contributions from each cell
	wind_grounds = wind_grounds.map(function (row, y) {
	    return row.map(function (cell, x) {
		if (cell.mag !== 0)
		    return calculate_contributions(x, y, cell);
		else
		    return { n : 0, s : 0, e : 0, w : 0 };
	    });
	});
	// Adding contributions to cells
	wind_grounds = wind_grounds.map(function (row, y, zeta) {
	    return row.map(function (cell, x, ksi) {
		if (x === 0 || x === WIDTH - 1 ||
		    y === 0 || y === HEIGHT - 1) {
		    return wind_cell(wind_direction, wind_speed);
		} else if (slopes[y][x] === ALL_SIDES) {
		    return wind_cell(0, 0);
		} else {
		    const combined_x = ksi[x - 1].e - ksi[x + 1].w,
			  combined_y = zeta[y - 1][x].s - zeta[y + 1][x].n;
		    const dir = (Math.atan(combined_y / combined_x)
				 * 180 / Math.PI),
			  mag = Math.sqrt(combined_x * combined_x +
					  combined_y * combined_y);
		    return wind_cell(mag, dir);
		}
	    });
	});
    }
    return wind_grounds;
}
