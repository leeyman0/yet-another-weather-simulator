// This is overcomplicated, I wish that Javascript had functionality.
// Color should be an included class.
export class Color {
    constructor(r = 0, g = 0, b = 0, a = 255) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
    }

    gradient(other) {
	function weighted_average(a, b, weight) {
	    return a * weight + b * (1 - weight);
	}
	return (pos) => {
	    return new Color(Math.round(weighted_average(this.r, other.r, pos)),
			     Math.round(weighted_average(this.g, other.g, pos)),
			     Math.round(weighted_average(this.b, other.b, pos)),
			     Math.round(weighted_average(this.a, other.a, pos)));
	};
    }
    toString() {
	return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(16)}${this.a.toString(16)}`;
    }
    
    set r(n) {
	this.r_val = n % 256;
    }
    get r() {
	return this.r_val;
    }
    set g(n) {
	this.g_val = n % 256;
    }
    get g() {
	return this.g_val;
    }
    set b(n) {
	this.b_val = n % 256;
    }
    get b() {
	return this.b_val;
    }
    set a(n) {
	this.a_val = n % 256;
    }
    get a() {
	return this.a_val;
    }
}

export const clear = new Color(0x00, 0x00, 0x00, 0x00);
