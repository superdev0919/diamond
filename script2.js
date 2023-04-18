const vertices = [{ x: 102, y: 0 }, { x: 388, y: 0 }, { x: 500, y: 75 }, { x: 500, y: 101 }, { x: 250, y: 300 }, { x: 0, y: 101 }, { x: 0, y: 75 }]

// Calculate the area of the polygon using the Shoelace Formula
function calculatePolygonArea(vertices) {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        area += vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    }
    area /= 2;
    return area;
}

const area = calculatePolygonArea(vertices);

// Calculate the centroid of the polygon
let centroidX = 0;
let centroidY = 0;
for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    const crossProduct = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    centroidX += (vertices[i].x + vertices[j].x) * crossProduct;
    centroidY += (vertices[i].y + vertices[j].y) * crossProduct;
}
centroidX /= 6 * area;
centroidY /= 6 * area;

// Output the centroid coordinates
// console.log(`Centroid: (${centroidX}, ${centroidY})`);

var panel;

var points = vertices, lines = []
for (var i = 0; i < vertices.length; i++) lines.push({ p1: i, p2: (i + 1) % vertices.length })

var cu_panel_mode = 1 //move circle mode, 2: move point mode, 3: scale circle mode , 4: connect point mode , 5: bend circle mode
var selected_point = -1 // current selected point in move point mode
var sp = -1, ep = -1 // start point and end point in connect point mode
var isDraggingCircle = false, isScaleCircle = false, isScaleRect = false, isBendCircle = false, m_sp = { x: 0, y: 0 }

var pc = {
    // canvas setting
    global_alpha: 0.6,

    // point setting
    point_radius: 5,
    point_line_width: 1,
    point_fill_color: 'grey',
    point_border_color: 'red',

    // line setting
    line_line_width: 2,
    line_color: 'red',
    line_green_color: 'green'
}

var mc = {
    x: 1000,
    point: {
        x: centroidX, y: centroidY
    },
    move_point: { x: 0, y: 0 } // ep in bend circle
}

function resetPanel() {
    points = []
    lines = []
    cu_panel_mode = 1
    selected_point = -1
}

function redrawPanel() {
    panel.clearRect(0, 0, 10000, 10000)

    for (var i = 0; i < points.length; i++) point(points[i].x, points[i].y)
    // for (var i = 0 ; i < lines.length ; i ++) i > lines.length - 17 ? greenline(lines[i].p1 , lines[i].p2) : line(lines[i].p1 , lines[i].p2)

    for (var i = 0; i < lines.length; i++) line(lines[i].p1, lines[i].p2)
    calculate()
}

function line(p1, p2) {
    panel.beginPath()
    panel.moveTo(points[p1].x, points[p1].y)
    panel.lineTo(points[p2].x, points[p2].y)
    panel.lineWidth = pc.line_line_width
    panel.strokeStyle = pc.line_color
    panel.stroke()
}

function point(x, y) {
    panel.beginPath();
    panel.arc(x, y, pc.point_radius, 0, 2 * Math.PI, true);
    // panel.fillStyle = pc.point_fill_color;
    // panel.fill();
    panel.lineWidth = pc.point_line_width;
    panel.strokeStyle = pc.point_border_color;
    panel.stroke();
}

function calculate() {
    var html = ""

    var total_width = distanceToPoint(points[2], points[6])
    html += `<tr>
                <th scope="row">Total Width(px)</th>
                <td>${total_width}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Table Width(% of Total Width)</th>
                <td>${distanceToPoint(points[lines[0].p1], points[lines[0].p2]) / total_width * 100}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Total Depth(% of Total Width)</th>
                <td>${distToSegment(points[4], points[lines[0].p1] , points[lines[0].p2]) / total_width * 100}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Crown Height(% of Total Width)</th>
                <td>${distToSegment(points[2], points[lines[0].p1] , points[lines[0].p2]) / total_width * 100}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Pavilion Depth(% of Total Width)</th>
                <td>${distToSegment(points[4], points[3], points[5]) / total_width * 100}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Girdle(% of Total Width)</th>
                <td>${(distToSegment(points[4], points[lines[0].p1] , points[lines[0].p2]) - distToSegment(points[2], points[lines[0].p1] , points[lines[0].p2]) - distToSegment(points[4], points[3], points[5])) / total_width * 100 }</td>
            </tr>`
    html += `<tr>
                <th scope="row">Crown Angle(Deg)</th>
                <td>${getAngle(points[1] , points[2] , points[3]) - 90}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Pavilion Angle(Deg)</th>
                <td>${getAngle(points[2] , points[3] , points[4]) - 90}</td>
            </tr>`
    $("#bend_rate").empty(), $("#bend_rate").append(html)
}

function getAngle(pt1, pt2, pt3){

    var dx1 = pt1.x - pt2.x;
    var dy1 = pt1.y - pt2.y;
    var dx2 = pt3.x - pt2.x;
    var dy2 = pt3.y - pt2.y;
    var a1 = Math.atan2(dy1, dx1);
    var a2 = Math.atan2(dy2, dx2);
    
    var a = parseFloat((a2 - a1) * 180.0 / Math.PI + 360);
    a = a > 360 ? a - 360 : a
    if (a > 180) return 360 - a
    return a
}

function drawAngleText(pt1, pt2, pt3) {

    var a = getAngle(pt1, pt2, pt3)

    panel.save();
    panel.beginPath();
    panel.moveTo(pt2.x, pt2.y);
    panel.arc(pt2.x, pt2.y, 20, a1, a2);
    panel.closePath();
    panel.fillStyle = "red";
    panel.globalAlpha = 0.4;
    panel.fill();
    panel.restore();

    panel.fillStyle = "yellow";
    panel.fillText(a, pt2.x + 15, pt2.y);
}

function sqr(x) { 
    return x * x 
}

function dist2(v, w) { 
    return sqr(v.x - w.x) + sqr(v.y - w.y) 
}

function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
    
  if (l2 == 0) return dist2(p, v);
    
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    
//   if (t < 0) return dist2(p, v);
//   if (t > 1) return dist2(p, w);
    
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { 
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

function distanceToPoint(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}

function isSimilarPoint(p1, p2) {
    return distanceToPoint(p1, p2) < pc.point_radius
}

function findPointFromPos(x, y) {
    for (var i = 0; i < points.length; i++) {
        if (isSimilarPoint(points[i], { x: x, y: y })) {
            return i
        }
    }
    return -1
}

function movePoint(x, y) {
    selected_point = findPointFromPos(x, y)
}

function moveMask(x, y) {
    mc.point.x += x - m_sp.x
    mc.point.y += y - m_sp.y

    for (var i = 0; i < points.length; i++) points[i].x += (x - m_sp.x), points[i].y += (y - m_sp.y)

    m_sp.x = x, m_sp.y = y
    redrawPanel()
}

function scaleMask(x, y) {
    var scale_rate;
    scale_rate = distanceToPoint(mc.point, { x: x, y: y }) / distanceToPoint(mc.point, m_sp)

    for (var i = 0; i < points.length; i++) {
        points[i].x = (points[i].x - mc.point.x) * scale_rate + mc.point.x
        points[i].y = (points[i].y - mc.point.y) * scale_rate + mc.point.y
        // points[i].x = (points[i].x - (m_sp.x - mc.point.x)) * scale_rate + (m_sp.x - mc.point.x)
        // points[i].y = (points[i].y - (m_sp.y - mc.point.y)) * scale_rate + (m_sp.y - mc.point.y)
        mc.r = mc.r * scale_rate
    }

    m_sp.x = x, m_sp.y = y
    redrawPanel()
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left)
    const y = (event.clientY - rect.top)
    return { x: x, y: y }
}

function rotate(cx, cy, x, y, angle) {
    var radians = angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
}

$(document).ready(() => {

    panel = document.getElementById("panel").getContext("2d")
    $("#panel").prop('width', mc.x)
    $("#panel").prop('height', mc.x)

    var img_size; // uploaded img width

    var _URL = window.URL || window.webkitURL;
    $('#photo').change(function () {
        const file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                $('#imgPreview').attr('src', event.target.result);

                var img = new Image();
                img.onload = function () {
                    img_size = img.width
                }

                // drawDefaultMask()
                img.src = _URL.createObjectURL(file)
                $("#zoom_range").val(100)
                // $("#panel").show();
            }
            reader.readAsDataURL(file);
        }
    });

    $("#zoom_range").change(function () {
        var tmp_size = img_size * parseInt($("#zoom_range").val()) / 100
        $("#imgPreview").prop('width', tmp_size)
        // $("#panel").prop('width' , tmp_size)
        // $("#panel").prop('height' , tmp_size)
        // resetPanel()
    })

    $("#panel").on("mousedown", (e) => {
        m_sp.x = m_sp.y = 0
        var pos = getCursorPosition(e.target, e)
        panel.globalAlpha = pc.global_alpha;
        switch (cu_panel_mode) {
            case 1:
                // drawPoint(pos.x , pos.y)
                isDraggingCircle = true
                m_sp.x = pos.x
                m_sp.y = pos.y
                // moveMask(pos.x , pos.y)
                break
            case 2:
                // selected_point = -1
                if (selected_point < 0)
                    movePoint(pos.x, pos.y)
                else
                    selected_point = -1
                break
            case 3:
                isScaleCircle = true
                m_sp.x = pos.x
                m_sp.y = pos.y
                break
            case 4:
                // connectPoint(pos.x , pos.y)
                break
            case 5:
                // bend circle mode
                isBendCircle = true
                m_sp.x = pos.x
                m_sp.y = pos.y
                break
            case 6:
                isScaleRect = true
                m_sp.x = pos.x
                m_sp.y = pos.y
                break
        }
    })

    $("#panel").on("mouseup", (e) => {
        isDraggingCircle = false
        isScaleCircle = false
        isBendCircle = false
        isScaleRect = false
    })

    $("#panel").on("mousemove", (e) => {
        var pos = getCursorPosition(e.target, e)
        if (cu_panel_mode == 1 && isDraggingCircle == true) {
            moveMask(pos.x, pos.y)
        } else if (cu_panel_mode == 2 && selected_point >= 0) {
            points[selected_point] = pos
            redrawPanel()
        } else if (cu_panel_mode == 3 && isScaleCircle == true) {
            scaleMask(pos.x, pos.y)
        } else if (cu_panel_mode == 6 && isScaleRect == true) {
            scaleRect(pos.x, pos.y)
        }
    })

    $("#move_circle").on('click', () => {
        cu_panel_mode = 1
    })
    $("#move_point").on('click', () => {
        cu_panel_mode = 2
    })
    $("#scale_circle").on('click', () => {
        cu_panel_mode = 3
    })
    $("#reset_panel").on("click", () => {
        window.location.reload()
    })

    $("#rotate_ccw").on('click', () => {
        for (var i = 0; i < points.length; i++) {
            var angle = 1
            points[i] = rotate(mc.point.x, mc.point.y, points[i].x, points[i].y, angle / 360 * Math.PI * 2)
        }
        redrawPanel()
    })
    $("#rotate_cw").on('click', () => {
        for (var i = 0; i < points.length; i++) {
            var angle = 359
            points[i] = rotate(mc.point.x, mc.point.y, points[i].x, points[i].y, angle / 360 * Math.PI * 2)
        }
        redrawPanel()
    })

    redrawPanel()
});
