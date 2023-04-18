var panel;

var points = [], lines = [] , point_lines = [] , rect_lines = [] , green_lines = []

var cu_panel_mode = 1 //move circle mode, 2: move point mode, 3: scale circle mode , 4: connect point mode , 5: bend circle mode
var selected_point = -1 // current selected point in move point mode
var sp = -1 , ep = -1 // start point and end point in connect point mode
var isDraggingCircle = false , isScaleCircle = false, isScaleRect = false, isBendCircle = false, m_sp = {x: 0 , y: 0}

var isPivotMade = false

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
    cnt: 16,
    rectrate: 0.45,
    rectcnt: 2,
    point:{
        x: 500 , y: 500
    },
    bendrate: {x: 1 , y: 1},
    move_point: {x: 0 , y: 0} // ep in bend circle
}

function resetPanel(){
    points = []
    lines = []
    cu_panel_mode = 1
    selected_point = -1
}

function redrawPanel(){
    panel.clearRect(0 , 0 , 10000 , 10000)
    panel.scale(mc.bendrate.x , mc.bendrate.y)
    
    for (var i = 0 ; i < points.length ; i ++) point(points[i].x , points[i].y)
    // for (var i = 0 ; i < lines.length ; i ++) i > lines.length - 17 ? greenline(lines[i].p1 , lines[i].p2) : line(lines[i].p1 , lines[i].p2)
    
    for (var i = 0 ; i < point_lines.length ; i ++) line(point_lines[i].p1 , point_lines[i].p2)
    for (var i = 0 ; i < rect_lines.length ; i ++) line(rect_lines[i].p1 , rect_lines[i].p2)
    for (var i = 0 ; i < green_lines.length ; i ++) greenline(green_lines[i].p1 , green_lines[i].p2)
    
    drawCircle(mc.point.x , mc.point.y)
    panel.setTransform(1, 0, 0, 1, 0, 0);

    calculate()
}

function line(p1 , p2){
    panel.beginPath()
    panel.moveTo(points[p1].x , points[p1].y)
    panel.lineTo(points[p2].x , points[p2].y)
    panel.lineWidth = pc.line_line_width
    panel.strokeStyle = pc.line_color
    panel.stroke()
}

function greenline(p1 ,p2){
    panel.beginPath()
    panel.moveTo(points[p1].x , points[p1].y)
    panel.lineTo(points[p2].x , points[p2].y)
    panel.lineWidth = pc.line_line_width
    panel.strokeStyle = pc.line_green_color
    panel.stroke()
}

function test_point(x , y){
    panel.beginPath();
    panel.arc(x, y, pc.point_radius , 0 , 2 * Math.PI, true);
    // panel.fillStyle = pc.point_fill_color;
    // panel.fill();
    panel.lineWidth = pc.point_line_width;
    panel.strokeStyle = 'yellow';
    panel.stroke();    
}

function point(x , y){
    panel.beginPath();
    panel.arc(x, y, pc.point_radius , 0 , 2 * Math.PI, true);
    // panel.fillStyle = pc.point_fill_color;
    // panel.fill();
    panel.lineWidth = pc.point_line_width;
    panel.strokeStyle = pc.point_border_color;
    panel.stroke();
}

function drawCircle (x , y){
    if (points.length){
        panel.beginPath()
        panel.arc(x , y, distanceToPoint(points[0] , {x:x , y:y}), 0, 2 * Math.PI)
        panel.lineWidth = pc.line_line_width
        panel.strokeStyle = pc.line_color
        panel.stroke()
    }
}

function getRadius(){
    return distanceToPoint(points[0] , {x: mc.point.x , y:mc.point.y})
}

function calculate(){
    var html = ""

    for (var i = 0 ; i < green_lines.length ; i ++){
        var length = 
            distanceToPoint(
                {x: points[green_lines[i].p1].x * mc.bendrate.x , y: points[green_lines[i].p1].y * mc.bendrate.y},
                {x: points[green_lines[i].p2].x * mc.bendrate.x , y: points[green_lines[i].p2].y * mc.bendrate.y})
        html += `<tr>
                    <th scope="row">${(i + 1)}</th>
                    <td>${length}</td>
                </tr>`
    }
    $("#g_lines").empty() , $("#g_lines").append(html)

    html = ""
    for (var i = 0 ; i < point_lines.length ; i ++){
        var length = 
            distanceToPoint(
                {x: points[point_lines[i].p1].x * mc.bendrate.x , y: points[point_lines[i].p1].y * mc.bendrate.y},
                {x: points[point_lines[i].p2].x * mc.bendrate.x , y: points[point_lines[i].p2].y * mc.bendrate.y})
        html += `<tr>
                    <th scope="row">${(i + 1)}</th>
                    <td>${length}</td>
                </tr>`
    }
    $("#p_lines").empty() , $("#p_lines").append(html)

    html = `<tr>
                <th scope="row">x-axis rate</th>
                <td>${mc.bendrate.x * 100}%</td>
            </tr>
            <tr>
                <th scope="row">y-axis rate</th>
                <td>${mc.bendrate.y * 100}%</td>
            </tr>`
    $("#bend_rate").empty() , $("#bend_rate").append(html)
}

// function calculate(){
//     for (var i = 0 ; i < 16 ; i ++){
//         var lst_lines = []
//         for (var k = lines.length - 16 ; k < lines.length ; k ++){
//                 if (lines[k].p1 == i ) lst_lines.push({p1:lines[k].p1 , p2:lines[k].p2})
//                 if (lines[k].p2 == i ) lst_lines.push({p1:lines[k].p2 , p2:lines[k].p1})
//         }

//         if( lst_lines.length >= 2 ){
//             for (var k = 1 ; k < lst_lines.length ; k ++){
//                 drawAngleText(points[lst_lines[0].p2] , points[lst_lines[0].p1] , points[lst_lines[k].p2])
//             }
//         }
//     }
// }

function getCrossOfSegments(l1 , l2){
    var c2x = points[l2.p1].x - points[l2.p2].x; // (x3 - x4)
  	var c3x = points[l1.p1].x - points[l1.p2].x; // (x1 - x2)
  	var c2y = points[l2.p1].y - points[l2.p2].y; // (y3 - y4)
  	var c3y = points[l1.p1].y - points[l1.p2].y; // (y1 - y2)

    var d  = c3x * c2y - c3y * c2x;
  	// down part of intersection point formula
  	if (d == 0) { // no cross point
    	return null
    } 
  
  	// upper part of intersection point formula
  	var u1 = points[l1.p1].x * points[l1.p2].y - points[l1.p1].y * points[l1.p2].x; // (x1 * y2 - y1 * x2)
  	var u4 = points[l2.p1].x * points[l2.p2].y - points[l2.p1].y * points[l2.p2].x; // (x3 * y4 - y3 * x4)
  
  	// intersection point formula
  	
  	var px = (u1 * c2x - c3x * u4) / d;
  	var py = (u1 * c2y - c3y * u4) / d;
  	
  	var p = { x: px, y: py };
    if (p.x < Math.min(points[l1.p1].x, points[l1.p2].x , points[l2.p1].x, points[l2.p2].x) + 0.1 || p.x > Math.max(points[l1.p1].x, points[l1.p2].x , points[l2.p1].x, points[l2.p2].x) - 0.1 || p.y < Math.min(points[l1.p1].y, points[l1.p2].y , points[l2.p1].y, points[l2.p2].y) + 0.1 || p.y > Math.max(points[l1.p1].y, points[l1.p2].y , points[l2.p1].y, points[l2.p2].y) - 0.1) return null
  
  	return p;
}

function sortCompare(a , b){
    if (points[a].x == points[b].x) return points[a].y - points[b].y
    return points[a].x - points[b].x    
}

function makePivot(){
    var d_lines = {}
    for (var i = 0 ; i < rect_lines.length - 1 ; i ++){
        for (var k = i + 1 ; k < rect_lines.length ; k ++){
            var c_p = getCrossOfSegments(rect_lines[i] , rect_lines[k])
            // console.log(c_p)
            if (c_p){
                // test_point(c_p.x , c_p.y)

                if(!d_lines.hasOwnProperty(i)) d_lines[i] = [rect_lines[i].p1 , rect_lines[i].p2]
                if(!d_lines.hasOwnProperty(k)) d_lines[k] = [rect_lines[k].p1 , rect_lines[k].p2]

                points.push(c_p)
                var p_p = points.length - 1

                d_lines[i].push(p_p)
                d_lines[k].push(p_p)
            }
        }
    }

    var tmp_lines = []
    for (const [key, value] of Object.entries(d_lines)) {
        value.sort(sortCompare)
        for (var i = 0 ; i < value.length - 1 ; i ++) tmp_lines.push({p1:value[i] , p2:value[i + 1]})
    }
    
    rect_lines = tmp_lines

    redrawPanel()
}

function drawAngleText(pt1, pt2, pt3){

    var dx1 = pt1.x - pt2.x;
    var dy1 = pt1.y - pt2.y;
    var dx2 = pt3.x - pt2.x;
    var dy2 = pt3.y - pt2.y;
    var a1 = Math.atan2(dy1,dx1);
    var a2 = Math.atan2(dy2,dx2);

    panel.save();
    panel.beginPath();
    panel.moveTo(pt2.x , pt2.y);
    panel.arc(pt2.x , pt2.y , 20 , a1 , a2);
    panel.closePath();
    panel.fillStyle = "red";
    panel.globalAlpha = 0.4;
    panel.fill();
    panel.restore();

    var a = parseFloat((a2 - a1) * 180.0 / Math.PI + 360);
    a = a > 360 ? a - 360 : a
    panel.fillStyle="yellow";
    panel.fillText(a , pt2.x + 15 , pt2.y);
}

function distanceToPoint(p1 , p2){
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}

function isSimilarPoint(p1 , p2){
    return distanceToPoint(p1 , p2) < pc.point_radius
}

function findPointFromPos(x , y){
    for ( var i = 0 ; i < points.length ; i ++ ){
        if (isSimilarPoint(points[i] , {x:x , y:y})){
            return i
        }
    }
    return -1
}

function movePoint(x, y) {
    selected_point = findPointFromPos(x , y)
}

function moveCircleToPoint(x , y){
    mc.point.x += x
    mc.point.y += y

    for (var i = 0 ; i < points.length ; i ++) points[i].x += x , points[i].y += y
}

function moveCircle(x , y) {
    mc.point.x += x - m_sp.x
    mc.point.y += y - m_sp.y
    
    for (var i = 0 ; i < points.length ; i ++) points[i].x += (x - m_sp.x), points[i].y += (y - m_sp.y)
    
    m_sp.x = x, m_sp.y = y
    redrawPanel()
}

function scaleCircle(x , y){
    var scale_rate;
    scale_rate = distanceToPoint(mc.point , {x: x , y: y}) / distanceToPoint(mc.point , m_sp)
    
    for (var i = 0 ; i < points.length ; i ++){
        points[i].x = (points[i].x - mc.point.x) * scale_rate + mc.point.x
        points[i].y = (points[i].y - mc.point.y) * scale_rate + mc.point.y
        // points[i].x = (points[i].x - (m_sp.x - mc.point.x)) * scale_rate + (m_sp.x - mc.point.x)
        // points[i].y = (points[i].y - (m_sp.y - mc.point.y)) * scale_rate + (m_sp.y - mc.point.y)
        mc.r = mc.r * scale_rate
    }

    m_sp.x = x , m_sp.y = y
    redrawPanel()
}

function scaleRect(x , y) {
    var scale_rate;
    scale_rate = distanceToPoint(mc.point , {x: x , y: y}) / distanceToPoint(mc.point , m_sp)
    
    for (var i = 17 ; i < points.length ; i ++){
        points[i].x = (points[i].x - mc.point.x) * scale_rate + mc.point.x
        points[i].y = (points[i].y - mc.point.y) * scale_rate + mc.point.y
        // points[i].x = (points[i].x - (m_sp.x - mc.point.x)) * scale_rate + (m_sp.x - mc.point.x)
        // points[i].y = (points[i].y - (m_sp.y - mc.point.y)) * scale_rate + (m_sp.y - mc.point.y)
        // mc.r = mc.r * scale_rate
    }

    m_sp.x = x , m_sp.y = y
    redrawPanel()
}

function bendCircle(x, y) {

    console.log([x , mc.point.x])

    if (m_sp.x == 0 || m_sp.y == 0){
        m_sp = {x: x , y: y}
        return 
    }
    var radi = distanceToPoint(points[0] , mc.point)
    var bendrate = {
        x: (radi - (mc.point.x < m_sp.x ? (m_sp.x - x) / 10 : (x - m_sp.x) / 10)) / radi, 
        y: (radi - (mc.point.y < m_sp.y ? (m_sp.y - y) / 10 : (y - m_sp.y) / 10)) / radi
    }
    m_sp = {x:x , y:y}
    // for(var i = 0 ; i < points.length ; i ++){
    //     points[i] = {x: points[i].x * (bendrate.x) , y: points[i].y * (bendrate.y)}
    // }
    
    // mc.point.x /= bendrate.x
    // mc.point.y /= bendrate.y

    // moveCircleToPoint(-mc.move_point.x , -mc.move_point.y)
    var move_x = 0 , move_y = 0 , l_x , l_y
    if (x < mc.point.x){
        // right top position of the circle
        l_x = mc.point.x + getRadius() 
        
    } else {
        l_x = mc.point.x - getRadius()
    }
    move_x = l_x / bendrate.x - l_x
    
    if (y < mc.point.y){
        l_y = mc.point.y + getRadius()
    } else {
        l_y = mc.point.y - getRadius()
    }
    move_y = l_y / bendrate.y - l_y

    mc.move_point.x  = move_x , mc.move_point.y = move_y
    
    mc.bendrate.x *=  bendrate.x
    mc.bendrate.y *=  bendrate.y

    moveCircleToPoint(move_x , move_y)
    // moveCircleToPoint(0 , 0 , mc.point.x - mc.point.x * mc.bendrate.x , mc.point.y - mc.point.y * mc.bendrate.y)
    redrawPanel()
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / mc.bendrate.x
    const y = (event.clientY - rect.top) / mc.bendrate.y
    return {x: x , y: y}
}

function rotate(cx, cy, x, y, angle) {
    var radians = angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return {x: nx , y: ny};
}

function pointsOnCircle(){
    var points = []
    points.push({x: mc.point.x , y: 0})
    for ( var i = 1 ; i < mc.cnt ; i ++){
        var p = rotate(mc.point.x , mc.point.y , points[0].x , points[0].y , Math.PI * 2 * i / mc.cnt)
        points.push(p)
    }
    return points
}

function pointsOnRect(){
    var points = []
    points.push({x: mc.point.x , y: mc.point.y - (Math.sqrt(mc.rectrate * mc.x * mc.rectrate * mc.x * 2 ) / 2)})
    for ( var i = 1 ; i < mc.rectcnt * 4; i ++){
        var p = rotate(mc.point.x , mc.point.y , points[0].x , points[0].y , Math.PI * 2 * i / mc.rectcnt / 4)
        points.push(p)
    }
    return points
}

function getDefaultMask(){
    // var lines = [] , points = []
    var points = [] , point_lines = [] , rect_lines = [] , green_lines = []

    // Circle Points
    var p_c = pointsOnCircle()
    // for ( var i = 0 ; i < p_c.length ; i ++) lines.push({ p1: i , p2: (i + 1) % p_c.length })
    points = p_c
    
    // Point and lines
    var point = {x: mc.point.x , y: mc.point.y}    
    points.push(point)
    // for ( var i = 0 ; i < p_c.length - 1 ; i ++) lines.push({ p1: p_c.length - 1 , p2: i })
    // for ( var i = 0 ; i < p_c.length - 1 ; i ++) point_lines.push({ p1: p_c.length - 1 , p2: i }) // lines: all circle points to mc.point
    
    // Rect points and lines
    var p_r = pointsOnRect()

    // new points lines
    for ( var i = 0, k = points.length ; i < p_c.length - 1 ; i += 2 , k ++ )  point_lines.push({p1: i , p2: k})

    // for ( var i = 0 ; i < p_r.length ; i ++ ) lines.push({ p1: i + points.length, p2: (i + 2) % p_r.length + points.length })
    for ( var i = 0 ; i < p_r.length ; i ++ ) rect_lines.push({ p1: i + points.length, p2: (i + 2) % p_r.length + points.length })
    points = points.concat(p_r)

    // Green Lines
    // for ( var i = 0 ; i < 8 ; i ++){
    //     lines.push({ p1: i + p_c.length , p2: (i * 2 + 15) % 16 })
    //     lines.push({ p1: i + p_c.length , p2: (i * 2 + 1) % 16 })
    // }
    for ( var i = 0 ; i < 8 ; i ++){
        green_lines.push({ p1: i + p_c.length , p2: (i * 2 + 15) % 16 })
        green_lines.push({ p1: i + p_c.length , p2: (i * 2 + 1) % 16 })
    }

    return {points: points , lines: lines , point_lines , rect_lines , green_lines}
}


function drawDefaultMask(){
    infors = getDefaultMask()
    points = infors.points
    // lines = infors.lines
    point_lines = infors.point_lines
    rect_lines = infors.rect_lines
    green_lines = infors.green_lines
    redrawPanel()
    // for ( var i = 0 ; i < points.length ; i ++) point(points[i].x , points[i].y)
    // for ( var i = 0 ; i < lines.length ; i ++) line(lines[i].p1 , lines[i].p2)
}


$(document).ready(()=>{
    
    panel = document.getElementById("panel").getContext("2d")
    $("#panel").prop('width' , mc.x)
    $("#panel").prop('height' , mc.x)
    drawDefaultMask()

    for (var i = 0 ; i < points.length ; i ++){
        var angle = 0.0001
        points[i] = rotate(mc.point.x , mc.point.y , points[i].x , points[i].y , angle / 360 * Math.PI * 2)
    }
    redrawPanel()

    var img_size; // uploaded img width
    
    var _URL = window.URL || window.webkitURL;
    $('#photo').change(function(){
        const file = this.files[0];
        if (file){
            let reader = new FileReader();
            reader.onload = function(event){
                $('#imgPreview').attr('src', event.target.result);

                var img = new Image();
                img.onload = function(){
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
        $("#imgPreview").prop('width' , tmp_size)
        // $("#panel").prop('width' , tmp_size)
        // $("#panel").prop('height' , tmp_size)
        // resetPanel()
    })

    $("#panel").on("mousedown" , (e) => {
        m_sp.x = m_sp.y = 0
        var pos = getCursorPosition(e.target, e)
        panel.globalAlpha = pc.global_alpha;
        switch(cu_panel_mode){
            case 1:
                // drawPoint(pos.x , pos.y)
                isDraggingCircle = true
                m_sp.x = pos.x
                m_sp.y = pos.y
                // moveCircle(pos.x , pos.y)
                break
            case 2:
                // selected_point = -1
                if(selected_point < 0)
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

    $("#panel").on("mouseup" , (e) => {
        isDraggingCircle = false
        isScaleCircle = false
        isBendCircle = false
        isScaleRect = false
    })

    $("#panel").on("mousemove" , (e) => {
        var pos = getCursorPosition(e.target , e)
        if (cu_panel_mode == 1 && isDraggingCircle == true){
            moveCircle(pos.x , pos.y)
        } else if (cu_panel_mode == 2 && selected_point >= 0){
            points[selected_point] = pos
            redrawPanel()
        } else if (cu_panel_mode == 3 && isScaleCircle == true){
            scaleCircle(pos.x , pos.y)
        } else if (cu_panel_mode == 5 && isBendCircle == true){
            bendCircle(pos.x ,pos.y)
        } else if (cu_panel_mode == 6 && isScaleRect == true){
            scaleRect(pos.x , pos.y)
        }
    })

    $("#move_circle").on('click' , () => {
        cu_panel_mode = 1
    })
    $("#move_point").on('click' , () => {
        cu_panel_mode = 2
    })
    $("#scale_circle").on('click' , () => {
        cu_panel_mode = 3
    })
    $("#connect_point").on('click' , () => {
        sp = ep = -1
        cu_panel_mode = 4
    })
    $("#bend_circle").on('click' , () => {
        cu_panel_mode = 5
    })
    $("#scale_rect").on('click' , () => {
        cu_panel_mode = 6
    })
    $("#calculate").on('click' , () => {
        calculate()
    })
    $("#make_pivot").on('click' , () => {
        if (!isPivotMade)
            makePivot()
        isPivotMade = true
    })
    $("#reset_panel").on("click" , () => {
        window.location.reload()
    })

    $("#rotate_ccw").on('click' , () => {
        for (var i = 0 ; i < points.length ; i ++){
            var angle = 1
            points[i] = rotate(mc.point.x , mc.point.y , points[i].x , points[i].y , angle / 360 * Math.PI * 2)
        }
        redrawPanel()
    })
    $("#rotate_cw").on('click' , () => {
        for (var i = 0 ; i < points.length ; i ++){
            var angle = 359
            points[i] = rotate(mc.point.x , mc.point.y , points[i].x , points[i].y , angle / 360 * Math.PI * 2)
        }
        redrawPanel()
    })

});

// function drawLine(p1 , p2) {
//     lines.push({p1: p1, p2:p2})
//     line(p1, p2)
//     // if (lines.length > 1){
//     //     drawAngleText(lines.length - 1 , lines.length - 2)
//     // }
// }

// function drawPoint(x , y) {
//     points.push({x: x , y: y})
//     point(x , y)
//     if (points.length > 1){
//         drawLine(points.length - 1, points.length - 2)
//     }
// }

// function connectPoint(x , y) {
//     console.log(x , y , sp , ep , findPointFromPos(x , y))
//     if (sp < 0){ 
//         sp = findPointFromPos(x , y)
//         return 
//     }
//     if (ep < 0 && sp != findPointFromPos(x , y)) {
//         ep = findPointFromPos(x , y)
//         drawLine(sp , ep)
//         sp = ep = -1
//         return
//     }
// }
