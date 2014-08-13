'use strict';

module.exports = TrapezoidalMap;

var Trapezoid = require('./trapezoid'),
    Point = require('./point'),
    Edge = require('./edge');

function TrapezoidalMap() {
    this.map = {};
    this.margin = 50;
}

TrapezoidalMap.prototype = {
    clear: function () {
        this.bcross = null;
        this.tcross = null;
    },

    case1: function (t, e) {
        var trapezoids = [];

        trapezoids.push(new Trapezoid(t.leftPoint, e.p, t.top, t.bottom));
        trapezoids.push(new Trapezoid(e.p, e.q, t.top, e));
        trapezoids.push(new Trapezoid(e.p, e.q, e, t.bottom));
        trapezoids.push(new Trapezoid(e.q, t.rightPoint, t.top, t.bottom));

        trapezoids[0].updateLeft(t.upperLeft, t.lowerLeft);
        trapezoids[1].updateLeftRight(trapezoids[0], null, trapezoids[3], null);
        trapezoids[2].updateLeftRight(null, trapezoids[0], null, trapezoids[3]);
        trapezoids[3].updateRight(t.upperRight, t.lowerRight);

        return trapezoids;
    },

    case2: function (t, e) {
        var trapezoids = [],
            rp = e.q.x == t.rightPoint.x ? e.q : t.rightPoint;

        trapezoids.push(new Trapezoid(t.leftPoint, e.p, t.top, t.bottom));
        trapezoids.push(new Trapezoid(e.p, rp, t.top, e));
        trapezoids.push(new Trapezoid(e.p, rp, e, t.bottom));

        trapezoids[0].updateLeft(t.upperLeft, t.lowerLeft);
        trapezoids[1].updateLeftRight(trapezoids[0], null, t.upperRight, null);
        trapezoids[2].updateLeftRight(null, trapezoids[0], null, t.lowerRight);

        this.bcross = t.bottom;
        this.tcross = t.top;
        e.above = trapezoids[1];
        e.below = trapezoids[2];

        return trapezoids;
    },

    case3: function (t, e) {
        var trapezoids = [],
            lp = e.p.x == t.leftPoint.x ?  e.p : t.leftPoint,
            rp = e.q.x == t.rightPoint.x ? e.q : t.rightPoint;

        if (this.tcross === t.top) {
            trapezoids.push(t.upperLeft);
            trapezoids[0].updateRight(t.upperRight, null);
            trapezoids[0].rightPoint = rp;
        } else {
            trapezoids.push(new Trapezoid(lp, rp, t.top, e));
            trapezoids[0].updateLeftRight(t.upperLeft, e.above, t.upperRight, null);
        }

        if (this.bcross === t.bottom) {
            trapezoids.push(t.lowerLeft);
            trapezoids[1].updateRight(null, t.lowerRight);
            trapezoids[1].rightPoint = rp;
        } else {
            trapezoids.push(new Trapezoid(lp, rp, e, t.bottom));
            trapezoids[1].updateLeftRight(e.below, t.lowerLeft, null, t.lowerRight);
        }

        this.bcross = t.bottom;
        this.tcross = t.top;
        e.above = trapezoids[0];
        e.below = trapezoids[1];

        return trapezoids;
    },

    case4: function (t, e) {
        var trapezoids = [],
            lp = e.p.x == t.leftPoint.x ? e.p : t.leftPoint;

        if (this.tcross === t.top) {
            trapezoids.push(t.upperLeft);
            trapezoids[0].rightPoint = e.q;
        } else {
            trapezoids.push(new Trapezoid(lp, e.q, t.top, e));
            trapezoids[0].updateLeft(t.upperLeft, e.above);
        }

        if (this.bcross === t.bottom) {
            trapezoids.push(t.lowerLeft);
            trapezoids[1].rightPoint = e.q;
        } else {
            trapezoids.push(new Trapezoid(lp, e.q, e, t.bottom));
            trapezoids[1].updateLeft(e.below, t.lowerLeft);
        }

        trapezoids.push(new Trapezoid(e.q, t.rightPoint, t.top, t.bottom));
        trapezoids[2].updateLeftRight(trapezoids[0], trapezoids[1], t.upperRight, t.lowerRight);

        return trapezoids;
    },

    boundingBox: function (edges) {
        var m = this.margin,
            maxX = edges[0].p.x + m,
            maxY = edges[0].p.y + m,
            minX = edges[0].q.x + m,
            minY = edges[0].q.y + m;

        for (var i = 0, e; i < edges.length; i++) {
            e = edges[i];

            if (e.p.x > maxX) maxX = e.p.x + m;
            if (e.p.y > maxY) maxY = e.p.y + m;

            if (e.q.x > maxX) maxX = e.q.x + m;
            if (e.q.y > maxY) maxY = e.q.y + m;

            if (e.p.x < minX) minX = e.p.x - m;
            if (e.p.y < minY) minY = e.p.y - m;

            if (e.q.x < minX) minX = e.q.x - m;
            if (e.q.y < minY) minY = e.q.y - m;
        }

        var top    = new Edge(new Point(minX, maxY), new Point(maxX, maxY)),
            bottom = new Edge(new Point(minX, minY), new Point(maxX, minY));

        var trap = new Trapezoid(top.p, top.q, top, bottom);

        this.map[trap.key] = trap;

        return trap;
    }
};
