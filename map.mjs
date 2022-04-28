// Test implementation
// An unoptimized port of 2D simplex noise
// That has been copied and translated over from a paper named
// Simplex noise demystified
// Stefan Gustavson, Linköping University, Sweden (stegu@itn.liu.se),
// March 22, 2005

// I do not expect this to be treated as very realistic. I want a map, dammit!

let grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
	     [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
	     [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

let p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
	 69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
	 252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,
	 168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
	 60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,
	 1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,
	 86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,
	 126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,
	 213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,
	 253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,
	 242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
	 49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
	 138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
let perm = new Array(512);
for(let i=0; i<512; i++)
    perm[i]=p[i & 255];

function dot(g, x, y) {
    return g[0]*x + g[1]*y;
}
function noise(xin, yin) {
    let n0, n1, n2;

    // Skew the input space to determine which simplex cell we're in
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    let s = (xin + yin) * F2; // Hairy Factor for 2D
    let i = Math.floor(xin + s);
    let j = Math.floor(yin + s);

    const G2 = (3.0-Math.sqrt(3.0)) / 6.0;
    let t = (i + j) * G2;
    let X0 = i - t; // Unskew the cell origin to (x, y) space
    let Y0 = j - t;
    let x0 = xin - X0; // The x, y distances from the cell origin
    let y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1=1; j1=0; }
    else { i1=0; j1=1; }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6

    let x1 = x0 - i1 + G2; // Offsets for middle corner in (x, y) unskewed coords
    let y1 = y0 - j1 + G2;
    let x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x, y) unskewed 
    let y2 = y0 - 1.0 + 2.0 * G2; // coords

    // Work out the hashed gradient indices of the corners
    let ii = i & 255;
    let jj = j & 255;
    let gi0 = perm[ii+perm[jj]] % 12;
    let gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    let gi2 = perm[ii+1+perm[jj+1]] % 12;

    let t0 = 0.5 - x0*x0-y0*y0;
    if (t0 < 0) n0 = 0.0;
    else {
	t0 *= t0;
	n0 = t0 * t0 * dot(grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1*x1-y1*y1;
    if (t1 < 0) n1 = 0.0;
    else {
	t1 *= t1;
	n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
    }

    
    let t2 = 0.5 - x2*x2-y2*y2;
    if (t2 < 0) n2 = 0.0;
    else {
	t2 *= t2;
	n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
}

/* for the time being, I want the map generated to be of integers
   and to be of unchanging height
   The land is solid and unchanging.
 */
export function generate_map(data_width, data_height, max_height, max_depth,
			     nodes_per_width) {
    let height_map = new Array(data_height);
    
    const random_x = Math.floor(Math.random() * data_width);
    const random_y = Math.floor(Math.random() * data_height);
    const adjustment_x = nodes_per_width / data_width;
    const adjustment_y = nodes_per_width * (data_height / data_width) / data_width;
    const center = (max_height + max_depth) / 2;
    
    for (let i = 0; i < height_map.length; i++) {
	height_map[i] = new Array(data_width);
	for (let j = 0; j < height_map[i].length; j++) {
	    height_map[i][j] = Math.floor(noise(random_x + i * adjustment_x,
						random_y + j * adjustment_y)
					  * ((max_height - max_depth)/2)
					  + center);
	}
    }

    return height_map;
}
