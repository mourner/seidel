'use strict';

module.exports = triangulateMountain;

var DoublyLinkedList = require('./dlinkedlist');

// triangulates a monotone mountain based on `edge`, adding resulting triangles to the `triangles` array

function triangulateMountain(edge, triangles) {

    var list = new DoublyLinkedList(),
        a = edge.p,
        b = edge.q,
        points = edge.mpoints;

    points.sort(compareX);

    list.add(a);
    for (var i = 0; i < points.length; i++) {
        if (neq(points[i], list.tail)) list.add(points[i]);
    }
    if (neq(b, list.tail)) list.add(b);

    var p = list.head.next;

    if (list.length < 3) return;
    else if (list.length === 3) { triangles.push([a, p, b]); return; }

    // triangles.push(monoPoly(list)); return;

    var convexPoints = [],
        positive = cross(p, b, a) >= 0;

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

function neq(p1, p2) {
    return p1.x !== p2.x || p1.y !== p2.y;
}

function addEar(points, p, list, positive) {
    if (!p.ear && p !== list.head && p !== list.tail && isConvex(p, positive)) {
        p.ear = true;
        points.push(p);
    }
}

function isConvex(p, positive) {
    return positive === (cross(p.next, p.prev, p) >= 0);
}

function cross(a, b, c) {
    var x1 = a.x - c.x,
        x2 = b.x - c.x,
        y1 = a.y - c.y,
        y2 = b.y - c.y;

    return x1 * y2 - y1 * x2;
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
