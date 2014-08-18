'use strict';

module.exports = triangulate;

var Point = require('./point'),
    Edge = require('./edge'),
    TrapezoidalMap = require('./trapezoidalmap'),
    triangulateMountain = require('./mountain');

// Build the trapezoidal map and query graph & return triangles
function triangulate(points) {

    var triangles = [],
        edges = [],
        i, j, p, q, len, mountain;

    // build a set of edges from points
    for (i = 0, len = points.length; i < len; i++) {
        j = i < len - 1 ? i + 1 : 0;
        p = shearTransform(points[i]);
        q = shearTransform(points[j]);
        edges.push(p.x > q.x ? new Edge(q, p) : new Edge(p, q));
    }
    // shuffle(edges);

    var map = new TrapezoidalMap();

    for (var i = 0; i < edges.length; i++) {
        map.addEdge(edges[i]);
    }
    map.collectPoints();

    // Generate the triangles
    for (i = 0; i < edges.length; i++) {
        if (edges[i].mpoints.length) triangulateMountain(edges[i], triangles);
    }

    return triangles;
}

// Shear transform. May effect numerical robustness
var SHEAR = 1e-14;

function shearTransform(point) {
    return new Point(point[0] + SHEAR * point[1], point[1]);
}

// Fisher-Yates shuffle algorithm
// function shuffle(array) {
//     for (var i = array.length - 1, j, tmp; i > 0; i--) {
//         j = Math.floor(Math.random() * (i + 1));
//         tmp = array[i];
//         array[i] = array[j];
//         array[j] = tmp;
//     }
//     return array;
// }
