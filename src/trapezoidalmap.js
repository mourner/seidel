'use strict';

module.exports = TrapezoidalMap;

var Trapezoid = require('./trapezoid'),
    Point = require('./point'),
    Edge = require('./edge'),
    QueryGraph = require('./querygraph'),
    util = require('./util');


function TrapezoidalMap() {

    var top = new Edge(new Point(-Infinity, Infinity), new Point(Infinity, Infinity)),
        bottom = new Edge(new Point(-Infinity, -Infinity), new Point(Infinity, -Infinity));

    this.root = new Trapezoid(bottom.p, top.q, top, bottom);

    this.items = [];
    this.items.push(this.root);

    this.queryGraph = new QueryGraph(this.root);
}

TrapezoidalMap.prototype = {
    addEdge: function (edge) {
        var t = this.queryGraph.locate(edge.p, edge.slope);
        if (!t) return false;

        var cp, cq;

        while (t) {
            cp = cp ? false : t.contains(edge.p);
            cq = cq ? false : t.contains(edge.q);

            t = cp && cq ?   this.case1(t, edge) :
                cp && !cq ?  this.case2(t, edge) :
                !cp && !cq ? this.case3(t, edge) : this.case4(t, edge);

            if (t === null) return false;
        }

        this.bcross = null;
        this.tcross = null;

        return true;
    },

    nextTrapezoid: function (t, edge) {
        return edge.q.x <= t.rightPoint.x ? false :
            util.edgeAbove(edge, t.rightPoint) ? t.upperRight : t.lowerRight;
    },

    /*  _________
       |  |___|  |
       |__|___|__|
    */
    case1: function (t, e) {

        var t2 = new Trapezoid(e.p, e.q, t.top, e),
            t3 = new Trapezoid(e.p, e.q, e, t.bottom),
            t4 = new Trapezoid(e.q, t.rightPoint, t.top, t.bottom);

        t4.updateRight(t.upperRight, t.lowerRight);
        t4.updateLeft(t2, t3);

        t.rightPoint = e.p;
        t.updateRight(t2, t3);

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case1(sink, e, t, t2, t3, t4);

        this.items.push(t2, t3, t4);

        return false;
    },

    /*  _________
       |    |____|
       |____|____|
    */
    case2: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            t2 = new Trapezoid(e.p, t.rightPoint, t.top, e),
            t3 = new Trapezoid(e.p, t.rightPoint, e, t.bottom);

        t.rightPoint = e.p;

        t.updateLeft(t.upperLeft, t.lowerLeft);
        t2.updateLeftRight(t, null, t.upperRight, null);
        t3.updateLeftRight(null, t, null, t.lowerRight);

        this.bcross = t.bottom;
        this.tcross = t.top;

        e.above = t2;
        e.below = t3;

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case2(sink, e, t, t2, t3);

        this.items.push(t2, t3);

        return next;
    },

    /*  ________
       |________|
       |________|
    */
    case3: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            bottom = t.bottom,
            lowerRight = t.lowerRight,
            lowerLeft = t.lowerLeft,
            top = t.top,
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.updateRight(t.upperRight, null);
            t1.rightPoint = t.rightPoint;

        } else {
            t1 = t;
            t1.bottom = e;
            t1.lowerLeft = e.above;
            if (e.above) e.above.lowerRight = t1;
            t1.lowerRight = null;
        }

        if (this.bcross === bottom) {
            t2 = lowerLeft;
            t2.updateRight(null, lowerRight);
            t2.rightPoint = t.rightPoint;

        } else if (t1 === t) {
            t2 = new Trapezoid(t.leftPoint, t.rightPoint, e, bottom);
            t2.updateLeftRight(e.below, lowerLeft, null, lowerRight);
            this.items.push(t2);

        } else {
            t2 = t;
            t2.top = e;
            t2.upperLeft = e.below;
            if (e.below) e.below.upperRight = t2;
            t2.upperRight = null;
        }

        if (t !== t1 && t !== t2) t.removed = true;

        this.bcross = bottom;
        this.tcross = top;

        e.above = t1;
        e.below = t2;

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case3(sink, e, t1, t2);

        return next;
    },

    /*  _________
       |____|    |
       |____|____|
    */
    case4: function (t, e) {
        var next = this.nextTrapezoid(t, e),
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.rightPoint = e.q;

        } else {
            t1 = new Trapezoid(t.leftPoint, e.q, t.top, e);
            t1.updateLeft(t.upperLeft, e.above);
            this.items.push(t1);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.rightPoint = e.q;

        } else {
            t2 = new Trapezoid(t.leftPoint, e.q, e, t.bottom);
            t2.updateLeft(e.below, t.lowerLeft);
            this.items.push(t2);
        }

        t.leftPoint = e.q;
        t.updateLeft(t1, t2);

        var sink = t.sink;
        t.sink = null;
        this.queryGraph.case4(sink, e, t1, t2, t);

        return next;
    },

    collectPoints: function () {
        var i, t,
            len = this.items.length;

        // after finding the first outside trapezoid that has a linked inside trapezoid below,
        // mark other inside trapezoids (with depth-first search)
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (t.removed) continue;
            if (t.top === this.root.top && t.bottom.below && !t.bottom.below.removed) { t.bottom.below.markInside(); break; }
            if (t.bottom === this.root.bottom && t.top.above && !t.top.above.removed) { t.top.above.markInside(); break; }
        }

        // collect interior monotone mountain points
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (!t.removed && t.inside) {
                // if a trapezoid marked as inside has an infinite boundary, then something has gone wrong
                if (t.top.p.y === Infinity) return false;
                t.addPoints();
            }
        }
        return true;
    }
};
