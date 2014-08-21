'use strict';

module.exports = triangulateMountain;

var util = require('./util');


// triangulates a monotone mountain based on `edge`, adding resulting triangles to the `triangles` array

function triangulateMountain(edge, triangles) {

    var a = edge.p,
        b = edge.q,
        list = edge.list,
        p = list.head.next;

    if (list.length < 3) return;
    else if (list.length === 3) { triangles.push([a, p.item, b]); return; }

    // triangles.push(monoPoly(list)); return;

    var convexPoints = [],
        positive = util.cross(p.item, b, a) > 0;

    while (p !== list.tail) {
        addEar(convexPoints, p, list, positive);
        p = p.next;
    }

    while (convexPoints.length) {
        var ear = convexPoints.shift(),
            prev = ear.prev,
            next = ear.next;

        triangles.push([prev.item, ear.item, next.item]);

        list.remove(ear);

        addEar(convexPoints, prev, list, positive);
        addEar(convexPoints, next, list, positive);
    }
}

function addEar(points, p, list, positive) {
    if (!p.ear && p !== list.head && p !== list.tail && isConvex(p, positive)) {
        p.ear = true;
        points.push(p);
    }
}

function isConvex(p, positive) {
    return positive === (util.cross(p.next.item, p.prev.item, p.item) > 0);
}

// function monoPoly(list) {
//     var poly = [];
//     var p = list.head;
//     while (p) {
//         poly.push(p.item);
//         p = p.next;
//     }
//     return poly;
// }
