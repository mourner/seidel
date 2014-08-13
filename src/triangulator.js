'use strict';

module.exports = Triangulator;

var Point = require('./point'),
    Edge = require('./edge'),
    TrapezoidalMap = require('./trapezoidalmap'),
    QueryGraph = require('./querygraph'),
    isink = require('./nodes').isink,
    MonotoneMountain = require('./monotonemountain');

// Number of points should be > 3
function Triangulator(polyline) {
    this.triangles = [];
    this.trapezoids = [];
    this.xmonoPoly = [];
    this.edges = this.initEdges(polyline);
    this.trapezoidalMap = new TrapezoidalMap();
    this.boundingBox = this.trapezoidalMap.boundingBox(this.edges);
    this.queryGraph = new QueryGraph(isink(this.boundingBox));
}

Triangulator.prototype = {

    // Build the trapezoidal map and query graph & return triangles
    triangulate: function() {
        var i, j, k;

        for (i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i],
                traps = this.queryGraph.followEdge(edge);

            for (j = 0; j < traps.length; j++) {
                var t = traps[j];

                 // Remove old trapezoids
                delete this.trapezoidalMap.map[t.key];

                // Bisect old trapezoids and create new
                var cp = t.contains(edge.p),
                    cq = t.contains(edge.q),
                    tlist;

                if (cp && cq) {
                    tlist = this.trapezoidalMap.case1(t, edge);
                    this.queryGraph.case1(t.sink, edge, tlist);

                } else if (cp && !cq) {
                    tlist = this.trapezoidalMap.case2(t, edge);
                    this.queryGraph.case2(t.sink, edge, tlist);

                } else if (!cp && !cq) {
                    tlist = this.trapezoidalMap.case3(t, edge);
                    this.queryGraph.case3(t.sink, edge, tlist);

                } else {
                    tlist = this.trapezoidalMap.case4(t, edge);
                    this.queryGraph.case4(t.sink, edge, tlist);
                }

                // Add new trapezoids to map
                for (k = 0; k < tlist.length; k++) {
                    this.trapezoidalMap.map[tlist[k].key] = tlist[k];
                }
            }
            this.trapezoidalMap.clear();
        }

        var map = this.trapezoidalMap.map;

        // Mark outside trapezoids w/ depth-first search
        for (k in map) {
            this.markOutside(map[k]);
        }
        // Collect interior trapezoids
        for (k in map) {
            if (map[k].inside) {
                this.trapezoids.push(map[k]);
                map[k].addPoints();
            }
        }

        // Generate the triangles
        this.createMountains();

        return this.triangles;
    },

    monoPolies: function() {
        var polies = [];
        for (var i = 0; i <= this.xmonoPoly.length; i++) {
            polies.push(this.xmonoPoly[i].monoPoly);
        }
        return polies;
    },

    createMountains: function() {
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];

            if (edge.mpoints.length > 2) {

                var mountain = new MonotoneMountain(),
                    points = edge.mpoints.slice();

                points.sort(compareX);

                for (var j = 0; j < points.length; j++) {
                    mountain.add(points[j]);
                }
                mountain.process();

                this.triangles.push.apply(this.triangles, mountain.triangles);
                this.xmonoPoly.push(mountain);
            }
        }
    },

    markOutside: function(t) {
        if (t.top === this.boundingBox.top || t.bottom === this.boundingBox.bottom) t.trimNeighbors();
    },

    initEdges: function(points) {
        var edges = [];

        for (var i = 0, len = points.length, j, p, q; i < len; i++) {
            j = i < len - 1 ? i + 1 : 0;
            p = shearTransform(points[i]);
            q = shearTransform(points[j]);
            edges.push(p.x > q.x ? new Edge(q, p) : new Edge(p, q));
        }

        shuffle(edges);
    }
};


function compareX(a, b) {
    return a.x - b.x;
}

// Shear transform. May effect numerical robustness
var SHEAR = 1e-3;

function shearTransform(point) {
    return new Point(point[0] + SHEAR * point[1], point[1]);
}

// Fisher-Yates shuffle algorithm
function shuffle(array) {
    for (var i = array.length - 1, j, tmp; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}
