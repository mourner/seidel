'use strict';

module.exports = triangulateMountain;

var DoublyLinkedList = require('./dlinkedlist'),
    util = require('./util');


// triangulates a monotone mountain based on `edge`, adding resulting triangles to the `triangles` array

function triangulateMountain(edge, triangles) {

    var list = new DoublyLinkedList(),
        a = edge.p,
        b = edge.q,
        points = edge.mpoints;

    points.sort(compareX);

    list.add(a);
    for (var i = 0; i < points.length; i++) {
        if (util.neq(points[i], list.tail)) list.add(points[i]);
    }
    if (util.neq(b, list.tail)) list.add(b);

    var p = list.head.next;

    if (list.length < 3) return;
    else if (list.length === 3) { triangles.push([a, p, b]); return; }

    // triangles.push(monoPoly(list)); return;

    var convexPoints = [],
        positive = util.cross(p, b, a) > 0;

    while (p !== list.tail) {
        addEar(convexPoints, p, list, positive);
        p = p.next;
    }

    while (convexPoints.length) {
        var ear = convexPoints.shift(),
            prev = ear.prev,
            next = ear.next;

        triangles.push([prev, ear, next]);

        list.remove(ear);

        addEar(convexPoints, prev, list, positive);
        addEar(convexPoints, next, list, positive);
    }
}

function compareX(a, b) {
    return a.x - b.x;
}

function addEar(points, p, list, positive) {
    if (!p.ear && p !== list.head && p !== list.tail && isConvex(p, positive)) {
        p.ear = true;
        points.push(p);
    }
}

function isConvex(p, positive) {
    return positive === (util.cross(p.next, p.prev, p) > 0);
}

// function monoPoly(list) {
//     var poly = [];
//     var p = list.head;
//     while (p) {
//         poly.push(p);
//         p = p.next;
//     }
//     return poly;
// }
