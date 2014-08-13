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

    add: function (t) {
        this.map[t.key] = t;
    },

    case1: function (t, e) {
        var t1 = new Trapezoid(t.leftPoint, e.p, t.top, t.bottom),
            t2 = new Trapezoid(e.p, e.q, t.top, e),
            t3 = new Trapezoid(e.p, e.q, e, t.bottom),
            t4 = new Trapezoid(e.q, t.rightPoint, t.top, t.bottom);

        t1.updateLeft(t.upperLeft, t.lowerLeft);
        t2.updateLeftRight(t1, null, t4, null);
        t3.updateLeftRight(null, t1, null, t4);
        t4.updateRight(t.upperRight, t.lowerRight);

        this.queryGraph.case1(t.sink, e, t1, t2, t3, t4);

        this.add(t1);
        this.add(t2);
        this.add(t3);
        this.add(t4);
    },

    case2: function (t, e) {
        var rp = e.q.x == t.rightPoint.x ? e.q : t.rightPoint;

        var t1 = new Trapezoid(t.leftPoint, e.p, t.top, t.bottom),
            t2 = new Trapezoid(e.p, rp, t.top, e),
            t3 = new Trapezoid(e.p, rp, e, t.bottom);

        t1.updateLeft(t.upperLeft, t.lowerLeft);
        t2.updateLeftRight(t1, null, t.upperRight, null);
        t3.updateLeftRight(null, t1, null, t.lowerRight);

        this.bcross = t.bottom;
        this.tcross = t.top;
        e.above = t2;
        e.below = t3;

        this.queryGraph.case2(t.sink, e, t1, t2, t3);

        this.add(t1);
        this.add(t2);
        this.add(t3);
    },

    case3: function (t, e) {
        var lp = e.p.x == t.leftPoint.x ?  e.p : t.leftPoint,
            rp = e.q.x == t.rightPoint.x ? e.q : t.rightPoint,
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.updateRight(t.upperRight, null);
            t1.rightPoint = rp;
        } else {
            t1 = new Trapezoid(lp, rp, t.top, e);
            t1.updateLeftRight(t.upperLeft, e.above, t.upperRight, null);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.updateRight(null, t.lowerRight);
            t2.rightPoint = rp;
        } else {
            t2 = new Trapezoid(lp, rp, e, t.bottom);
            t2.updateLeftRight(e.below, t.lowerLeft, null, t.lowerRight);
        }

        this.bcross = t.bottom;
        this.tcross = t.top;
        e.above = t1;
        e.below = t2;

        this.queryGraph.case3(t.sink, e, t1, t2);

        this.add(t1);
        this.add(t2);
    },

    case4: function (t, e) {
        var lp = e.p.x == t.leftPoint.x ? e.p : t.leftPoint,
            t1, t2, t3;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.rightPoint = e.q;
        } else {
            t1 = new Trapezoid(lp, e.q, t.top, e);
            t1.updateLeft(t.upperLeft, e.above);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.rightPoint = e.q;
        } else {
            t2 = new Trapezoid(lp, e.q, e, t.bottom);
            t2.updateLeft(e.below, t.lowerLeft);
        }

        t3 = new Trapezoid(e.q, t.rightPoint, t.top, t.bottom);
        t3.updateLeftRight(t1, t2, t.upperRight, t.lowerRight);

        this.queryGraph.case4(t.sink, e, t1, t2, t3);

        this.add(t1);
        this.add(t2);
        this.add(t3);
    },

    boundingBox: function (edges) {
        var m = this.margin,
            maxX = edges[0].p.x + m,
            maxY = edges[0].p.y + m,
            minX = edges[0].q.x - m,
            minY = edges[0].q.y - m;

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

        var trap = new Trapezoid(bottom.p, top.q, top, bottom);

        this.map[trap.key] = trap;

        return trap;
    }
};
