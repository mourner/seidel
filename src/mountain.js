'use strict';

module.exports = triangulateMountain;

var cross = require('./util').cross;


// triangulates a monotone mountain based on `edge`, adding resulting triangles to the `triangles` array

function triangulateMountain(edge, triangles) {

    var a = edge.p,
        b = edge.q,
        poly = edge.poly,
        p = poly.first.next;

    if (poly.length < 3) return;
    else if (poly.length === 3) { triangles.push([a, p.point, b]); return; }

    // triangles.push(monoPoly(poly)); return;

    var convexPoints = [],
        positive = cross(p.point, b, a) > 0;

    while (p !== poly.last) {
        addEar(convexPoints, p, poly, positive);
        p = p.next;
    }

    while (convexPoints.length) {
        var ear = convexPoints.shift(),
            prev = ear.prev,
            next = ear.next;

        triangles.push([prev.point, ear.point, next.point]);

        poly.remove(ear);

        addEar(convexPoints, prev, poly, positive);
        addEar(convexPoints, next, poly, positive);
    }
}

function addEar(points, p, poly, positive) {
    if (!p.ear && p !== poly.first && p !== poly.last && isConvex(p, positive)) {
        p.ear = true;
        points.push(p);
    }
}

function isConvex(p, positive) {
    return positive === (cross(p.next.point, p.prev.point, p.point) > 0);
}

// function monoPoly(poly) {
//     var points = [];
//     var p = poly.first;
//     while (p) {
//         points.push(p.point);
//         p = p.next;
//     }
//     return points;
// }
