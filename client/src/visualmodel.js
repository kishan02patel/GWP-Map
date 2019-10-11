function lerp(inVal, inMin, inMax, outMin, outMax) {
  let outRange = outMax - outMin;
  let inRange = inMax - inMin;
  return outMin + (inVal - inMin) * outRange / inRange;
}

export var dataSchema = {
  "properties": {
    "idbin": {
      "type": "string",
      "enum": [
        "bin1",
        "bin2",
        "bin3"
      ]
    },
    "person_start": {
      "type": "object",
      "properties": {
        "time": {
          "type": "number",
          "minimum": new Date("2019-01-01T00:00:00Z").getTime(),
          "maximum": new Date("2020-01-01T00:00:00Z").getTime()
        }
      }
    },
    "person_end": {
      "type": "object",
      "properties": {
        "time": {
          "type": "number",
          "minimum": new Date("2019-01-01T00:00:00Z").getTime(),
          "maximum": new Date("2020-01-01T00:00:00Z").getTime()
        }
      }
    },
    "person_path": {
      "type": "array",
      "items": {
        "properties": {
          "x": {
            "type": "number",
            "minimum": 0,
            "maximum": 1000
          },
          "y": {
            "type": "number",
            "minimum": 0,
            "maximum": 1000
          }
        }
      }
    }
  }
};

export var visSchema = {
  "properties": {
    "marker_start": {
      "type": "object",
      "properties": {
        "color": {"type": "color"},
        "size": {"type": "size"},
        "shape": {"type": "shape"}
      },
      "description": "start"
    },
    "marker_end": {
      "type": "object",
      "properties": {
        "color": {"type": "color"},
        "size": {"type": "size"},
        "shape": {"type": "shape"}
      },
      "description": "end"
    },
    "marker_mid": {
      "type": "object",
      "properties": {
        "color": {"type": "color"},
        "size": {"type": "size"},
        "shape": {"type": "shape"}
      },
    },
    "line_style": {
      "type": "object",
      "properties": {
        "texture": {"type": "texture"},
        "color": {"type": "color"}
      }
    },
    "path": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "x": {"type": "posx"},
          "y": {"type": "posy"},
          "shape": {"type": "shape"}
        }
      }
    }
  }
};

export var defaultNotation = {
  "path": {
    "bind_array": "person_path",
    "items": {
      "x": {
        "bind_num": "x",
        "min_i": 0.0,
        "min_o": 0.0,
        "max_i": 700,
        "max_o": 700
      },
      "y": {
        "bind_num": "y",
        "min_i": 0.0,
        "min_o": 0.0,
        "max_i": 700,
        "max_o": 700
      },
      "size": "na",
      "color": "na",
      "brightness": "na",
      "texture": "na",
      "orientation": "na",
      "shape": "triangle"
    }
  },
  "line_style": {
    "x": "na",
    "y": "na",
    "size": "na",
    "color": {
      "bind_enum": "idbin",
      "bin1": "orange",
      "bin2": "cyan",
      "bin3": "green"
    },
    "brightness": "na",
    "texture": {
      "bind_enum": "idbin",
      "bin1": "1",
      "bin2": "4",
      "bin3": "3"
    },
    "orientation": "na",
    "shape": "na"
  },
  "marker_end": {
    "x": "na",
    "y": "na",
    "size": {
      "bind_num": "time",
      "min_i": 1546300800000,
      "min_o": 16.0,
      "max_i": 1577836800000,
      "max_o": 20.0
    },
    "color": "magenta",
    "brightness": "na",
    "texture": "na",
    "orientation": "na",
    "shape": "triangle",
    "bind_obj": "person_end"
  },
  "marker_mid": {
    "x": "na",
    "y": "na",
    "size": 10,
    "color": "yellow",
    "brightness": "na",
    "texture": "na",
    "orientation": "na",
    "shape": "circle",
    "bind_obj": "person_end"
  },
  "marker_start": {
    "x": "na",
    "y": "na",
    "size": {
      "bind_num": "time",
      "min_i": 1546300800000,
      "min_o": 1.0,
      "max_i": 1577836800000,
      "max_o": 15.0
    },
    "color": "blue",
    "brightness": "na",
    "texture": "na",
    "orientation": "na",
    "shape": "rect",
    "bind_obj": "person_start"
  }
};

export function recommend(dataSchema, visGrammar) {
  // TODO: Call visual recommendation engine
  // (For now, hardcode result in defaultNotation)
  return defaultNotation;
}

export function bind(notation, data) {
  if (typeof(notation) === "object") {
    // map_num
    if ("bind_num" in notation) {
      // is a binding to an object
      let prop = notation["bind_num"];

      // numeric bindings
      let inVal = data[prop];
      let inMin = notation["min_i"];
      let outMin = notation["min_o"];
      let inMax = notation["max_i"];
      let outMax = notation["max_o"];
      let outVal = lerp(inVal, inMin, inMax, outMin, outMax);

      return outVal;
    }

    // map_enum
    if ("bind_enum" in notation) {
      let prop = notation["bind_enum"];
      let k = data[prop];
      if (!(k in notation)) {
        // May still be able to progress (return undefined),
        // but is likely an error.
        console.warn("Not in notation: " + k);
      }
      return notation[k];
    }

    // symbols with multiple instances
    if ("bind_array" in notation) {
      // is a binding to an array of objects
      // (e.g. a symbol with multiple instances)
      let prop = notation["bind_array"];
      let template = notation["items"];

      let inArray = data[prop];
      if (!Array.isArray(inArray)) {
        throw new Error("Expected an array");
      }

      return inArray.map(item =>
        bind(template, item)
      );
    }

    // symbols with multiple instances
    if ("bind_obj" in notation) {
      let prop = notation["bind_obj"];
      let d = data[prop];

      // iterate over properties in notation and bind to data.
      let result = {};
      Object.keys(notation).forEach(function (k) {
        let subn = notation[k];
        // recurse
        result[k] = bind(subn, d);
      });
      return result;
    }

    // iterate over properties in notation and bind to data.
    let result = {};
    Object.keys(notation).forEach(function (k) {
      let n = notation[k];
      // recurse
      result[k] = bind(n, data);
    });
    return result;
  }

  // e.g. string / integer values
  return notation;
}

// Code to generate symbol SVGs

var svgns = "http://www.w3.org/2000/svg";

var get_default = function(key) {
  let defaults = {
    "posx": 10,
    "posy": 10,
    "size": "8",
    "color": "grey",
    "brightness": "4",
    "texture": "1",
    "orientation": "rot30",
    "shape": "circle"
  };
  return defaults[key];
}

var namedColor = function (colorname) {
  if (colorname === "na") {
    colorname = get_default("color");
  }
  let colorhues = {
    "red": 0,
    "orange": 30, // Humans sensitive to orange
    "yellow": 60,
    "green": 120,
    "cyan": 180,
    "blue": 240,
    "magenta": 300
  };
  var hue;
  var sat;
  if (colorname === "grey") {
    hue = 0;
    sat = 0;
  } else {
    hue = colorhues[colorname];
    sat = 100;
  }
  return { "hue": hue, "sat": sat };
};

var namedBrightness = function (bname) {
  if (bname === "na") {
    bname = get_default("brightness");
  }
  let lev = +bname;
  // 1 => 0%, 7 => 100%
  let val = (lev - 1) * 100 / 6;
  return val;
};

// var namedTexture = function (tname) {
//   if (tname === "na") {
//     tname = get_default("texture");
//   }
//   let tnum = +tname;
//   return "url(#linebg" + tnum + ")";
// };

var namedOrient = function (oname) {
  if (oname === "na") {
    oname = get_default("orientation");
  }
  // e.g. deg0;deg30;deg90;deg60
  let onum = +oname.substr(3); // extract number
  return onum;
};

var namedSize = function (sname) {
  if (sname === "na") {
    sname = get_default("size");
  }
  let snum = +sname;
  return snum * 5;
};

export function createSymbolSvgFull (posx, posy, size, value, texture, color, orient, shape) {
  let huesat = namedColor(color);
  let hue = huesat.hue;
  let sat = huesat.sat;
  let lightness = namedBrightness(value);
  // TODO: Correct for different perceptual brightness
  let colorCombo = "hsl(" + hue + ", " + sat + "%, " + lightness + "%)";
  // TODO: Allow changing orientation of texture without altering orientation
  // of shape. (Okay for now, but will be needed for area)
  let rot = namedOrient(orient);
  let dim = namedSize(size);
  let node;
  if (shape === "circle") {
    node = document.createElementNS(svgns, "circle")
    node.setAttribute("r", dim/2);
    node.setAttribute("cx", dim/2);
    node.setAttribute("cy", dim/2);
  } else if (shape === "rect") {
    node = document.createElementNS(svgns, "rect");
    node.setAttribute("width", dim);
    node.setAttribute("height", dim);
  } else {
    node = document.createElementNS(svgns, "g");
    let poly = document.createElementNS(svgns, "polygon");
    if (shape === "triangle") {
      // designed to point in correct direction if used as a marker with orient=auto
      poly.setAttribute("points", "8 0 -6.92 -8 -6.92 8");
    } else if (shape === "hexagon") {
      poly.setAttribute("points", "-4 -8 4 -8 8 0 4 8 -4 8 -8 0");
    } else if (shape === "na") {
      // line segment
      poly.setAttribute("points", "-8 -1 -8 1 8 1 8 -1");
    }
    node.appendChild(poly);
    poly.setAttribute("transform", "scale(" + dim/16 + ") translate(6.92,8)")
  }
  node.setAttribute("fill", colorCombo);
  let g = document.createElementNS(svgns, "g");
  // Sets the texture by applying a mask. Temporarily disabled as won't work unless mask ids #linebg1, #linebg2, etc. defined in svg:defs.
  //let pat = namedTexture(texture);
  //g.setAttribute("mask", pat)
  g.appendChild(node);
  g.setAttribute("transform", "translate(" + posx + ", " + posy + ") rotate(" + rot + ", " + dim/2 + ", " + dim/2 + ")");
  return g;
};

export function createSymbolSvg (color, shape) {
  // Size currently fixed at 20 in order to centre shape and prevent clipping within viewBox="0 0 100 100"
  return createSymbolSvgFull(0, 0, 20, "na", "na", color, "rot0", shape);
}
