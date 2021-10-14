function save(svgEl = document.getElementById("board").cloneNode(true), name='download', filetype='svg') {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // In the browser, everything is done in svg 'user units'. The reason for this is
    // that paths (used for the rounded corners) can only be specified in user units.
    // And for some reason, I couldn't get them to scale properly, despite using the
    // 'viewBox' property. This way we simply specify the svg element to be in millimeters
    // before saving the file. that seems to work fine. 
    svgEl.setAttribute("width", paper_width + units)
    svgEl.setAttribute("height", paper_height + units)
    svgEl.getElementById("border").remove()
    var svgData = svgEl.outerHTML;

    if (filetype == 'svg') {
        var preface = '<?xml version="1.0" standalone="no"?>\r\n';
        var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `${name}.${filetype}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else if (filetype == 'pdf') {
        console.log("Not implemented.")
        // const doc = new jspdf.jsPDF({unit: "mm", format: [paper_width, paper_height]})
        // doc.svg(svgEl).then(() => {
        //     doc.save(`${name}.${filetype}`)
        // })
    } else {
        console.log('Unsupported filetype: <${filetype}>. Currently supporting <svg> or <pdf>.')
    }
}

function generate_rounded_corner(position, x, y) {
    /* 
        Argument(s):
        position (int): Refers to which corner it is. In clock-wise
            order, with 0 being top left. 
            
            0 ---- 1
            --------
            3 -----2
    */
    var NS = "http://www.w3.org/2000/svg";

    var path_string = `M 0 0 L ${checker_size / 2} 0 A ${checker_size / 2} ${checker_size / 2}, -180, 1, 1, 0 ${checker_size / 2} Z`
    var transforms = `translate(${x}, ${y})`
    
    var elem = document.createElementNS(NS, "path");
    elem.setAttribute("d", path_string);
    elem.setAttribute("fill", color);

    switch (position) {
        case 0: // 
            transforms = transforms + ` rotate(180, ${checker_size/2}, ${checker_size/2})`
            break;
        case 1:
            transforms = transforms + ` rotate(-90, ${checker_size/2}, ${checker_size/2})`
            break;
        case 3:
            transforms = transforms + ` rotate(90, ${checker_size/2}, ${checker_size/2})`
            break;
    }
    elem.setAttribute("transform", transforms)

    return elem
}

function generate_rounded_edge(position, x, y) {
    /*
        Argument(s):
        position (int): Refers to which edge it is. 
        
        -00000-
        3-----1
        3-----1
        -22222-
    */

    var path_string = `M 0 ${checker_size} L 0 ${checker_size / 2} A ${checker_size / 2} ${checker_size / 2}, 0, 1, 1, ${checker_size} ${checker_size / 2} L ${checker_size} ${checker_size} Z`
    var transforms = `translate(${x}, ${y})`

    var NS = "http://www.w3.org/2000/svg";
    var elem = document.createElementNS(NS, "path");
    elem.setAttribute("d", path_string);
    elem.setAttribute("fill", color);
    // elem.setAttribute("transform", `translate(${x}, ${y})`)

    switch (position) {
        case 1:
            transforms = transforms + ` rotate(90, ${checker_size/2}, ${checker_size/2})`
            break;
        case 2:
            transforms = transforms + ` rotate(180, ${checker_size/2}, ${checker_size/2})`
            break;
        case 3:
            transforms = transforms + ` rotate(-90, ${checker_size/2}, ${checker_size/2})`
            break;
    }
    elem.setAttribute("transform", transforms)

    return elem
}

function draw_board() {
    var board_wrapper = document.getElementById("board-wrapper");
    board_wrapper.style.height = paper_height + "mm"
    board_wrapper.style.width = paper_width + "mm"


    var svg = document.getElementById("board");
    svg.setAttribute("viewBox", `0 0 ${paper_width} ${paper_height}`);
    svg.innerHTML = ''; // Clear the canvas.

    // The checkerboard into a group, so that we can center it on the canvas later.s
    var NS = "http://www.w3.org/2000/svg";
    var g = document.createElementNS(NS, "g");
    g.id = "content_group"
    svg.appendChild(g)
    
    // Draw rect that visualizes the print area.
    var elem = document.createElementNS(NS, "rect");
    elem.setAttribute("id", "border")
    elem.setAttribute("width", paper_width);
    elem.setAttribute("height", paper_height);
    elem.setAttribute("fill", "none");
    elem.setAttribute("stroke", "black");
    svg.appendChild(elem);

    // Checkerboard generation 
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            if ((row + col) % 2 != 0) {
                // This represents the white checkers.
                continue
            }

            if (row == 0 && rounded) {
                if (col == 0) {
                    var elem = generate_rounded_corner(0, col*checker_size, row*checker_size)
                    g.appendChild(elem);
                    continue
                } else if (col == cols - 1) {
                    var elem = generate_rounded_corner(1, col*checker_size, row*checker_size)
                    g.appendChild(elem);
                    continue
                }
                var elem = generate_rounded_edge(0, col*checker_size, row*checker_size)
                g.appendChild(elem);
            } else if (row == rows-1 && rounded) {
                if (col == 0) {
                    var elem = generate_rounded_corner(3, col*checker_size, row*checker_size)
                    g.appendChild(elem);
                    continue
                } else if (col == cols - 1) {
                    var elem = generate_rounded_corner(2, col*checker_size, row*checker_size)
                    g.appendChild(elem);
                    continue
                }
                var elem = generate_rounded_edge(2, col*checker_size, row*checker_size)
                g.appendChild(elem);
            } else if (col == 0 && rounded) {
                var elem = generate_rounded_edge(3, col*checker_size, row*checker_size)
                g.appendChild(elem);
            } else if (col == cols - 1 && rounded) {
                var elem = generate_rounded_edge(1, col*checker_size, row*checker_size)
                g.appendChild(elem);
            } else {
                var elem = document.createElementNS(NS, "rect");
                // console.log(circle);
                elem.setAttribute("x", col*checker_size);
                elem.setAttribute("y", row*checker_size);
                elem.setAttribute("width", checker_size);
                elem.setAttribute("height", checker_size);
                elem.setAttribute("fill", color);
                g.appendChild(elem);
            }
        }
    };

    // This is for centering.
    // TODO: Clean this up. 
    var bbox = g.getBBox() 
    var px_center =  paper_width / 2
    var py_center = paper_height / 2
    var t_x = px_center - (bbox.width/2)
    var t_y = py_center - (bbox.height/2)
    g.setAttribute("transform", "translate(" + t_x + ", " + t_y + ")")
    
    // Add marker 
    if (marker) {
        r = Math.floor(rows / 2)
        c = Math.floor(cols / 2)
        // Ensure that the chosen row and column is a white checker
        // Edit: Maybe this isn't necessary? I thought that the 'corner circle' 
        // had to be black. But in pattern_gen.py in the OpenCV repo creates 
        // patterns with the white one being in the corner. 
        if ((r + c) % 2 != 1)  {
            if (r > c) {
                r -= 1
            } else {
                c -= 1
            }
        }
        
        arr = [[-1, 0, 'white'], [0, 0, color], [0, 1, 'white']] 

        arr.forEach(element => {
            dr = element[0]
            dc = element[1]
            let color = element[2]
            x = (c+dc)*checker_size + checker_size/2
            y = (r+dr)*checker_size + checker_size/2
            var elem = document.createElementNS(NS, "circle");
            elem.setAttribute("cx", x);
            elem.setAttribute("cy", y);
            elem.setAttribute("r", checker_size/4)
            elem.setAttribute("fill", color)
            g.appendChild(elem)
        });
        // Blecker checker
        

    }

    // Add label (e.g. Inner corners: 7x11 | Size: 15 mm)
    if (label) {
        var elem = document.createElementNS(NS, "text");
        elem.setAttribute("id", "label");
        elem.innerHTML = `${rows-1}x${cols-1} | ${checker_size + ' ' + units}`;
        elem.style.cssText = "font: 3pt monospace";
        svg.appendChild(elem);

        // This has to be done after adding the element. 
        // Otherwise getBBox() returns zeros. 
        bbox = elem.getBBox();
        elem.setAttribute("x", paper_width/2 - bbox.width/2);
        elem.setAttribute("y", paper_height - bbox.height);
    }

};

var units = "mm";
var rows = 5;
var cols = 9;
var checker_size = 20;
var color = "#000000";
var rounded = true;
var marker = true;
var label = true;

var paper_width = 297;
var paper_height = 210;


var row_slider = document.getElementById("row_slider");
var col_slider = document.getElementById("col_slider");
var size_slider = document.getElementById("size_slider");
var color_picker = document.getElementById("color_picker");
var rounded_checkbox = document.getElementById("rounded_checkbox");
var marker_checkbox = document.getElementById("marker_checkbox");
var label_checkbox = document.getElementById("label_checkbox");
var paper_width_number = document.getElementById("paper_width");
var paper_height_number = document.getElementById("paper_height");

var A5_preset_button = document.getElementById('A5_preset')
var A4_preset_button = document.getElementById('A4_preset')
var A3_preset_button = document.getElementById('A3_preset')
var flip_canvas_button = document.getElementById('flip_canvas')

row_slider.value = rows - 1;
col_slider.value = cols -1 ;
size_slider.value = checker_size;
rounded_checkbox.checked = rounded;
marker_checkbox.checked = marker;
label_checkbox.checked = label;
paper_width_number.value = paper_width;
paper_height_number.value = paper_height;

var row_slider_output = document.getElementById("row_slider_output");
var col_slider_output = document.getElementById("col_slider_output");
var size_slider_output = document.getElementById("size_slider_output");

row_slider_output.innerHTML = rows - 1;
col_slider_output.innerHTML = cols - 1;
size_slider_output.innerHTML = checker_size;


draw_board();

row_slider.oninput = function() {
    // console.log("Changing number of rows")
    row_slider_output.innerHTML = this.value;
    rows = parseInt(this.value) + 1;
    draw_board()
};

col_slider.oninput = function() {
    // console.log("Changing number of columns")
    col_slider_output.innerHTML = this.value;
    // col_number.value = this.value;
    cols = parseInt(this.value) + 1;
    draw_board();
};

size_slider.oninput = function() {
    // console.log("Changing checker size")
    size_slider_output.innerHTML = this.value;
    checker_size = this.value;
    draw_board();
};

color_picker.oninput = function() {
    color = this.value;
    draw_board();
};

rounded_checkbox.oninput = function() {
    rounded = this.checked;
    draw_board();
};

marker_checkbox.oninput = function() {
    marker = this.checked;
    draw_board();
};

label_checkbox.oninput = function() {
    label = this.checked;
    draw_board();
};

paper_width_number.oninput = function() {
    this.value=Math.round(this.value);
    paper_width = this.value;
    draw_board();
}

paper_height_number.oninput = function() {
    this.value=Math.round(this.value);
    paper_height = this.value;
    draw_board();
}

flip_canvas_button.onclick = function() {
    tmp = paper_width;
    paper_width = paper_height; 
    paper_height = tmp;
    draw_board();

    paper_width_number.value = paper_width;
    paper_height_number.value = paper_height;
}

A5_preset_button.onclick = function() {
    paper_width = 210; 
    paper_height = 148;
    draw_board();

    paper_width_number.value = paper_width;
    paper_height_number.value = paper_height;
}

A4_preset_button.onclick = function() {
    paper_width = 297; 
    paper_height = 210;
    draw_board();

    paper_width_number.value = paper_width;
    paper_height_number.value = paper_height;
}

A3_preset_button.onclick = function() {
    paper_width = 420; 
    paper_height = 297;
    draw_board();

    paper_width_number.value = paper_width;
    paper_height_number.value = paper_height;
}