var mc = {
    x: 1000, 
    cnt: 16,
    rect: 450,
    rectcnt: 2
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
    points.push({x: mc.x / 2 , y: 0})
    for ( var i = 1 ; i < mc.cnt ; i ++){
        var p = rotate(mc.x / 2 , mc.x / 2 , points[0].x , points[0].y , Math.PI * 2 * i / mc.cnt)
        points.push(p)
    }
    return points
}

function pointsOnRect(){
    var points = []
    points.push({x: mc.x / 2 , y: mc.x / 2 - (Math.sqrt(mc.rect * mc.rect * 2 ) / 2)})
    for ( var i = 1 ; i < mc.rectcnt * 4; i ++){
        var p = rotate(mc.x / 2 , mc.x / 2 , points[0].x , points[0].y , Math.PI * 2 * i / mc.rectcnt / 4)
        points.push(p)
    }
    return points
}

function getDefaultMask(){
    var lines = [] , points = []

    // Circle Points
    var p_c = pointsOnCircle()
    // for ( var i = 0 ; i < p_c.length ; i ++) lines.push({ p1: i , p2: (i + 1) % p_c.length })
    points = p_c
    
    // Point and lines
    var point = {x: mc.x / 2 , y: mc.x / 2}    
    points.push(point)
    for ( var i = 0 ; i < p_c.length - 1 ; i ++) lines.push({ p1: p_c.length - 1 , p2: i })
    
    // Rect points and lines
    var p_r = pointsOnRect()
    for ( var i = 0 ; i < p_r.length ; i ++ ) lines.push({ p1: i + points.length, p2: (i + 2) % p_r.length + points.length })
    points = points.concat(p_r)

    // Green Lines
    for ( var i = 0 ; i < 8 ; i ++){
        lines.push({ p1: i + p_c.length , p2: (i * 2 + 15) % 16 })
        lines.push({ p1: i + p_c.length , p2: (i * 2 + 1) % 16 })
        console.log(i + p_c.length ,(i * 2 + 15) % 16 )
    }

    return {points: points , lines: lines}
}