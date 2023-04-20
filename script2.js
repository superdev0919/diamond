const vertices = [{ x: 102, y: 0 }, { x: 398, y: 0 }, { x: 500, y: 75 }, { x: 500, y: 102 }, { x: 250, y: 300 }, { x: 0, y: 102 }, { x: 0, y: 75 }]

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

//insert Unit line
points.push({x: 125, y: 400}) , points.push({x: 375, y: 400})
lines.push({p1: points.length - 2 , p2: points.length - 1})


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
    line_green_color: 'green',

    unit_length: 3.80,
    density: 0.00352
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

function getParameters(){

    var unit_line = pc.unit_length / distanceToPoint(points[7] , points[8])

    var total_width = distanceToPoint(points[2], points[6])
    var total_width_in_mm = total_width * unit_line
    var table_width = distanceToPoint(points[lines[0].p1], points[lines[0].p2]) / total_width * 100
    var total_depth = distToSegment(points[4], points[lines[0].p1] , points[lines[0].p2]) / total_width * 100
    var crown_height = distToSegment(points[2], points[lines[0].p1] , points[lines[0].p2]) / total_width * 100
    var pavilion_depth = distToSegment(points[4], points[3], points[5]) / total_width * 100
    var girdle = (distToSegment(points[4], points[lines[0].p1] , points[lines[0].p2]) - distToSegment(points[2], points[lines[0].p1] , points[lines[0].p2]) - distToSegment(points[4], points[3], points[5])) / total_width * 100
    var crown_angle_r = getAngle(points[1] , points[2] , points[3]) - 90
    var crown_angle_l = getAngle(points[5] , points[6] , points[0]) - 90
    var pavilion_angle_r = getAngle(points[2] , points[3] , points[4]) - 90
    var pavilion_angle_l = getAngle(points[4] , points[5] , points[6]) - 90
    return {
        total_width: total_width,
        total_width_in_mm: total_width_in_mm,
        table_width: table_width,
        total_depth: total_depth,
        crown_height: crown_height,
        pavilion_depth: pavilion_depth,
        girdle: girdle,
        crown_angle_r: crown_angle_r,
        crown_angle_l: crown_angle_l,
        pavilion_angle_r: pavilion_angle_r,
        pavilion_angle_l: pavilion_angle_l,
    }
}

function calculate() {
    var d = getParameters()
    var html = ""

    var top_r = d.total_width_in_mm * d.table_width / 100 / 2
    var girdle_r = d.total_width_in_mm / 2
    var top_h = d.total_width_in_mm * d.crown_height / 100
    var volume_top = Math.PI * top_h / 3 * (top_r * top_r + girdle_r * girdle_r + top_r * girdle_r)

    var volume_girdle = Math.PI * girdle_r * girdle_r * d.girdle * d.total_width_in_mm / 100

    var volume_bottom = Math.PI * girdle_r * girdle_r * d.total_width_in_mm * d.pavilion_depth / 100 / 3

    var diamond_volume = volume_top + volume_girdle + volume_bottom

    var diamond_weight = diamond_volume * pc.density


    html += `<tr>
                <th scope="row">Total Width(mm)</th>
                <td>${d.total_width_in_mm.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Table Width(% of Total Width)</th>
                <td>${d.table_width.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Total Depth(% of Total Width)</th>
                <td>${d.total_depth.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Crown Height(% of Total Width)</th>
                <td>${d.crown_height.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Pavilion Depth(% of Total Width)</th>
                <td>${d.pavilion_depth.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Girdle(% of Total Width)</th>
                <td>${d.girdle.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Crown Angle Right(Deg)</th>
                <td>${d.crown_angle_r.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Crown Angle Left(Deg)</th>
                <td>${d.crown_angle_l.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Pavilion Angle Right(Deg)</th>
                <td>${d.pavilion_angle_r.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Pavilion Angle Left(Deg)</th>
                <td>${d.pavilion_angle_l.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Diamond Volume(mm&#xb3;)</th>
                <td>${diamond_volume.toFixed(2)}</td>
            </tr>`
    html += `<tr>
                <th scope="row">Diamond Weight(g)</th>
                <td>${diamond_weight.toFixed(2)}</td>
            </tr>`

    var evalIndexed = getEvaluationIndex()
    var eval_mapping = {
        crown_angle_index: "Crown Angle (\u03B2)",
        pavilin_angle_index: "Pavilion Angle (\u2C6D)",
        table_width_index: "Table Width",
        crown_height_index: "Crown Height",
        pavilion_depth_index: "Pavilion Depth",
        girdle_index: "Girdle",
        total_depth_index: "Total Depth",
        sumalphabet_index: "Sum \u2C6D and \u03B2",
    }
    var eval_state_mapping = ["Fair" , "Good" ,"Very Good" , "Excellent" , "Very Good" , "Good" , "Fair"]
    for (var keys = Object.keys(evalIndexed) , i = 0 ; i < keys.length ; i ++){
        html += `<tr>
                    <th scope="row">${eval_mapping[keys[i]]}</th>
                    <td>${eval_state_mapping[evalIndexed[keys[i]]]}</td>
                </tr>`
    }

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

function getOverviewHtml(id){
    var html = ''
    for (var i = 0 ; i < id ; i ++) html += "<td></td>"
    html += `<td>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                </svg>
            </td>`
    for (var i = id + 1 ; i < 7 ; i ++) html += '<td></td>'
    return html
}

function getEvaluationIndex(){
    var d = getParameters()
    var crown_angle_index;
    if ((d.crown_angle_r + d.crown_angle_l)/2 < 25.9) crown_angle_index = 0
    else if ((d.crown_angle_r + d.crown_angle_l)/2 < 27.9) crown_angle_index = 1
    else if ((d.crown_angle_r + d.crown_angle_l)/2 < 31.2) crown_angle_index = 2
    else if ((d.crown_angle_r + d.crown_angle_l)/2 < 36.7) crown_angle_index = 3
    else if ((d.crown_angle_r + d.crown_angle_l)/2 < 38.2) crown_angle_index = 4
    else if ((d.crown_angle_r + d.crown_angle_l)/2 < 40.0) crown_angle_index = 5
    else crown_angle_index = 6

    var pavilin_angle_index;
    if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 38.4) pavilin_angle_index = 0
    else if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 39.5) pavilin_angle_index = 1
    else if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 40.5) pavilin_angle_index = 2
    else if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 41.8) pavilin_angle_index = 3
    else if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 42.1) pavilin_angle_index = 4
    else if ((d.pavilion_angle_r + d.pavilion_angle_l)/2 < 43.1) pavilin_angle_index = 5
    else pavilin_angle_index = 6

    var table_width_index;
    if (d.table_width < 47) table_width_index = 0
    else if (d.table_width < 49) table_width_index = 1
    else if (d.table_width < 51) table_width_index = 2
    else if (d.table_width < 62) table_width_index = 3
    else if (d.table_width < 66) table_width_index = 4
    else if (d.table_width < 70) table_width_index = 5
    else table_width_index = 6

    var crown_height_index;
    if (d.crown_height < 8.5) crown_height_index = 0
    else if (d.crown_height < 10.5) crown_height_index = 1
    else if (d.crown_height < 11.5) crown_height_index = 2
    else if (d.crown_height < 17.0) crown_height_index = 3
    else if (d.crown_height < 18.0) crown_height_index = 4
    else if (d.crown_height < 19.5) crown_height_index = 5
    else crown_height_index = 6

    var pavilion_depth_index;
    if (d.pavilion_depth < 39.5) pavilion_depth_index = 0
    else if (d.pavilion_depth < 41.0) pavilion_depth_index = 1
    else if (d.pavilion_depth < 42.5) pavilion_depth_index = 2
    else if (d.pavilion_depth < 44.5) pavilion_depth_index = 3
    else if (d.pavilion_depth < 45.0) pavilion_depth_index = 4
    else if (d.pavilion_depth < 46.5) pavilion_depth_index = 5
    else pavilion_depth_index = 6

    var girdle_index;
    if (d.girdle < 0.5) girdle_index = 0
    else if (d.girdle < 1.5) girdle_index = 1
    else if (d.girdle < 2.0) girdle_index = 2
    else if (d.girdle < 4.5) girdle_index = 3
    else if (d.girdle < 5.5) girdle_index = 4
    else if (d.girdle < 7.5) girdle_index = 5
    else girdle_index = 6

    var total_depth_index;
    if (d.total_depth < 52.9) total_depth_index = 0
    else if (d.total_depth < 55.4) total_depth_index = 1
    else if (d.total_depth < 58.4) total_depth_index = 2
    else if (d.total_depth < 63.5) total_depth_index = 3
    else if (d.total_depth < 64.4) total_depth_index = 4
    else if (d.total_depth < 66.9) total_depth_index = 5
    else total_depth_index = 6

    var sumalphabet_index;
    if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 67.9) sumalphabet_index = 0
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 69.9) sumalphabet_index = 1
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 72.4) sumalphabet_index = 2
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 77.7) sumalphabet_index = 3
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 79.4) sumalphabet_index = 4
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 80.4) sumalphabet_index = 5
    else sumalphabet_index = 6

    var sumalphabet_index;
    if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 67.9) sumalphabet_index = 0
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 69.9) sumalphabet_index = 1
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 72.4) sumalphabet_index = 2
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 77.7) sumalphabet_index = 3
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 79.4) sumalphabet_index = 4
    else if ((d.crown_angle_r + d.crown_angle_l)/2 + (d.pavilion_angle_r + d.pavilion_angle_l)/2 < 80.4) sumalphabet_index = 5
    else sumalphabet_index = 6

    return {
        crown_angle_index: crown_angle_index,
        pavilin_angle_index: pavilin_angle_index,
        table_width_index: table_width_index,
        crown_height_index: crown_height_index,
        pavilion_depth_index: pavilion_depth_index,
        girdle_index: girdle_index,
        total_depth_index: total_depth_index,
        sumalphabet_index: sumalphabet_index,
    }
}

function getEvaluationHtml(){
    var d = getParameters()
    var index_lst = getEvaluationIndex()
    
    var crown_angle_html = getOverviewHtml(index_lst.crown_angle_index);
    var pavilin_angle_html = getOverviewHtml(index_lst.pavilin_angle_index);
    var table_width_html = getOverviewHtml(index_lst.table_width_index);
    var crown_height_html = getOverviewHtml(index_lst.crown_height_index);
    var pavilion_depth_html = getOverviewHtml(index_lst.pavilion_depth_index);
    var girdle_html = getOverviewHtml(index_lst.girdle_index);
    var total_depth_html = getOverviewHtml(index_lst.total_depth_index);
    var sumalphabet_html = getOverviewHtml(index_lst.sumalphabet_index);
    return {
        crown_angle_html: crown_angle_html,
        pavilin_angle_html: pavilin_angle_html,
        table_width_html: table_width_html,
        crown_height_html: crown_height_html,
        pavilion_depth_html: pavilion_depth_html,
        girdle_html: girdle_html,
        total_depth_html: total_depth_html,
        sumalphabet_html: sumalphabet_html,
    }
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
    $("#overview").on("click", () => {
        d = getParameters()

        var htmlContent = getEvaluationHtml()

        var html = `<tr>
                        <th scope="row">Crown Angle (\u03B2)</th>
                        ${htmlContent.crown_angle_html}
                    </tr>
                    <tr>
                        <th scope="row">Pavilion Angle (\u2C6D)</th>
                        ${htmlContent.pavilin_angle_html}
                    </tr>
                    <tr class="table-group-divider">
                        <th scope="row">Table Width</th>
                        ${htmlContent.table_width_html}
                    </tr>
                    <tr>
                        <th scope="row">Crown Height</th>
                        ${htmlContent.crown_height_html}
                    </tr>
                    <tr>
                        <th scope="row">Pavilion Depth</th>
                        ${htmlContent.pavilion_depth_html}
                    </tr>
                    <tr>
                        <th scope="row">Girdle</th>
                        ${htmlContent.girdle_html}
                    </tr>
                    <tr>
                        <th scope="row">Total Depth</th>
                        ${htmlContent.total_depth_html}
                    </tr>
                    <tr class="table-group-divider">
                        <th scope="row">Sum \u2C6D and \u03B2</th>
                        ${htmlContent.sumalphabet_html}
                    </tr>`

        $("#tbl_overview").empty(), $("#tbl_overview").append(html)

        var top_r = d.total_width_in_mm * d.table_width / 100 / 2
        var girdle_r = d.total_width_in_mm / 2
        var top_h = d.total_width_in_mm * d.crown_height / 100
        var volume_top = Math.PI * top_h / 3 * (top_r * top_r + girdle_r * girdle_r + top_r * girdle_r)

        var volume_girdle = Math.PI * girdle_r * girdle_r * d.girdle * d.total_width_in_mm / 100

        var volume_bottom = Math.PI * girdle_r * girdle_r * d.total_width_in_mm * d.pavilion_depth / 100 / 3

        var diamond_volume = volume_top + volume_girdle + volume_bottom

        var diamond_weight = diamond_volume * pc.density

        $("#diamond_volume").empty() , $("#diamond_volume").append(diamond_volume.toFixed(2))
        $("#diamond_weight").empty() , $("#diamond_weight").append(diamond_weight.toFixed(2))

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
