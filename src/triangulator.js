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
    this._initEdges(polyline);
    this.trapezoidalMap = new TrapezoidalMap();
    this.boundingBox = this.trapezoidalMap.boundingBox(this.edges);
    this.queryGraph = new QueryGraph(isink(this.boundingBox));
    this.trapezoidalMap.queryGraph = this.queryGraph;
}

Triangulator.prototype = {

    // Build the trapezoidal map and query graph & return triangles
    triangulate: function() {
        var i, j, t;

        for (i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i],
                traps = this.queryGraph.followEdge(edge);

            for (j = 0; j < traps.length; j++) {
                t = traps[j];

                 // Remove old trapezoids
                this.trapezoidalMap.map[t.key] = null;

                // Bisect old trapezoids and create new
                var cp = t.contains(edge.p),
                    cq = t.contains(edge.q);

                if (cp && cq) this.trapezoidalMap.case1(t, edge);
                else if (cp && !cq) this.trapezoidalMap.case2(t, edge);
                else if (!cp && !cq) this.trapezoidalMap.case3(t, edge);
                else this.trapezoidalMap.case4(t, edge);
            }

            this.trapezoidalMap.clear();
        }

        var map = this.trapezoidalMap.map,
            keys = Object.keys(map);

        // Mark outside trapezoids w/ depth-first search
        for (i = 0; i < keys.length; i++) {
            if (map[keys[i]]) this._markOutside(map[keys[i]]);
        }

        // Collect interior trapezoids
        for (i = 0; i < keys.length; i++) {
            t = map[keys[i]];
            if (t && t.inside) {
                this.trapezoids.push(t);
                t.addPoints();
            }
        }

        // Generate the triangles
        this._createMountains();

        return this.triangles;
    },

    _createMountains: function() {
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];

            if (edge.mpoints.length > 2) {

                var mountain = new MonotoneMountain(),
                    points = edge.mpoints;

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

    _markOutside: function(t) {
        if (t.top === this.boundingBox.top || t.bottom === this.boundingBox.bottom) t.trimNeighbors();
    },

    _initEdges: function(points) {
        this.edges = [];

        for (var i = 0, len = points.length, j, p, q; i < len; i++) {
            j = i < len - 1 ? i + 1 : 0;
            p = shearTransform(points[i]);
            q = shearTransform(points[j]);
            this.edges.push(p.x > q.x ? new Edge(q, p) : new Edge(p, q));
        }

        shuffle(this.edges);
    }
};


function compareX(a, b) {
    return a.x - b.x;
}

// Shear transform. May effect numerical robustness
var SHEAR = 1e-6;

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
