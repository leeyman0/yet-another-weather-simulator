// code for the control module goes here
export class ControlBox {
    // Control boxes are static
    values = {}
    dom_elements = {}
    valued_elements = {}
    
    constructor(top, values) {
	// Labeling each key and index
	Object.keys(values).forEach((key, index) => {

	    let label = document.createElement("label");
	    label.innerHTML = key + '\t';
	    let dom_element = document.createElement("input");
	    // Setting up the system
	    dom_element.id = `${top.id}-${index}`;
	    label.htmlFor = dom_element.id;
	    
	    let aval = values[key];
	    if (typeof aval === "boolean") {
		// console.log("Checkbox Spotted");
		dom_element.type = "checkbox";
		dom_element.checked = aval;
	    } else if (typeof aval === "number") {
		dom_element.type = "number";
		dom_element.value = aval;
	    } else if (aval === "button") {
		dom_element = document.createElement("button");
		dom_element.innerHTML = key;
	    } else if (aval === "title") {
		dom_element = document.createElement("h3");
		dom_element.innerHTML = key;
	    }

	    if (aval !== "button" && aval !== "title")
	    {
		// Displaying each on the line
		top.appendChild(label);
		// Registering values
		this.valued_elements[key] = dom_element;
	    }
	    top.appendChild(dom_element);
	    top.appendChild(document.createElement("br"));
	    // Adding accessibility to outside forces.
	    this.dom_elements[key] = dom_element;
	    
	});
	
	
    }

    getValues() {
	let vals = {}; 
	Object.entries(this.valued_elements).forEach((keyval) => {
	    let valtype = keyval[1].attributes["type"].value; 
	    if (valtype === "checkbox") {
		vals[keyval[0]] = keyval[1].checked;
	    } else if (valtype === "number") {
		vals[keyval[0]] = keyval[1].value;
	    }
	});
	return vals;
    }
    
}
