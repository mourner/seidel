'use strict';

module.exports = Triangulator;

var Point = require('./point'),
    Edge = require('./edge'),
    TrapezoidalMap = require('./trapezoidalmap'),
    QueryGraph = require('./querygraph'),
    MonotoneMountain = require('./monotonemountain');

// Number of points should be > 3
function Triangulator(polyline) {
    this.triangles = [];
    this.initEdges(polyline);
    this.trapezoidalMap = new TrapezoidalMap();
    this.boundingBox = this.trapezoidalMap.boundingBox(this.edges);
    this.queryGraph = new QueryGraph(this.boundingBox, this.trapezoidalMap);
    this.trapezoidalMap.queryGraph = this.queryGraph;
}

Triangulator.prototype = {

    // Build the trapezoidal map and query graph & return triangles
    triangulate: function() {
        var i, t;

        for (i = 0; i < this.edges.length; i++) {
            this.queryGraph.followEdge(this.edges[i]);
        }

        var items = this.trapezoidalMap.items;

        // Mark outside trapezoids w/ depth-first search
        for (i = 0; i < items.length; i++) {
            if (!items[i].removed) this.markOutside(items[i]);
        }

        // Collect interior trapezoids
        for (i = 0; i < items.length; i++) {
            t = items[i];
            if (!t.removed && t.inside) t.addPoints();
        }

        // Generate the triangles
        this.createMountains();

        return this.triangles;
    },

    createMountains: function() {
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];

            if (edge.mpoints.length) {
                var mountain = new MonotoneMountain(edge.p, edge.q, edge.mpoints);
                mountain.triangulate(this.triangles);
            }
        }
    },

    markOutside: function(t) {
        if (t.top === this.boundingBox.top || t.bottom === this.boundingBox.bottom) t.trimNeighbors();
    },

    initEdges: function(points) {
        this.edges = [];

        var i, j, p, q, len, e;

        for (i = 0, len = points.length; i < len; i++) {
            j = i < len - 1 ? i + 1 : 0;
            p = shearTransform(points[i]);
            q = shearTransform(points[j]);
            e = p.x > q.x ? new Edge(q, p) : new Edge(p, q);
            this.edges.push(e);
        }

        // shuffle(this.edges);
    }
};


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
