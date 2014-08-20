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

        this.splitTrapezoid(t, edge);

        while (edge.q.x > t.rightPoint.x) {
            t = util.edgeAbove(edge, t.rightPoint) ? t.upperRight : t.lowerRight;
            this.splitTrapezoid(t, edge);
        }

        this.bcross = null;
        this.tcross = null;
    },

    splitTrapezoid: function (t, edge) {
         // Remove old trapezoid
        t.removed = true;

        // Bisect old trapezoids and create new
        var cp = t.contains(edge.p),
            cq = t.contains(edge.q);

        if (cp && cq) this.case1(t, edge);
        else if (cp && !cq) this.case2(t, edge);
        else if (!cp && !cq) this.case3(t, edge);
        else this.case4(t, edge);
    },

    /*  _________
       |  |___|  |
       |__|___|__|
    */
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

        this.items.push(t1, t2, t3, t4);
    },

    /*  _________
       |    |____|
       |____|____|
    */
    case2: function (t, e) {
        var rp = e.q.x === t.rightPoint.x ? e.q : t.rightPoint;

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

        this.items.push(t1, t2, t3);
    },

    /*  ________
       |________|
       |________|
    */
    case3: function (t, e) {
        var lp = e.p.x === t.leftPoint.x ?  e.p : t.leftPoint,
            rp = e.q.x === t.rightPoint.x ? e.q : t.rightPoint,
            t1, t2;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.updateRight(t.upperRight, null);
            t1.rightPoint = rp;
        } else {
            t1 = new Trapezoid(lp, rp, t.top, e);
            t1.updateLeftRight(t.upperLeft, e.above, t.upperRight, null);
            this.items.push(t1);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.updateRight(null, t.lowerRight);
            t2.rightPoint = rp;
        } else {
            t2 = new Trapezoid(lp, rp, e, t.bottom);
            t2.updateLeftRight(e.below, t.lowerLeft, null, t.lowerRight);
            this.items.push(t2);
        }

        this.bcross = t.bottom;
        this.tcross = t.top;

        e.above = t1;
        e.below = t2;

        this.queryGraph.case3(t.sink, e, t1, t2);
    },

    /*  _________
       |____|    |
       |____|____|
    */
    case4: function (t, e) {
        var lp = e.p.x === t.leftPoint.x ? e.p : t.leftPoint,
            t1, t2, t3;

        if (this.tcross === t.top) {
            t1 = t.upperLeft;
            t1.rightPoint = e.q;
        } else {
            t1 = new Trapezoid(lp, e.q, t.top, e);
            t1.updateLeft(t.upperLeft, e.above);
            this.items.push(t1);
        }

        if (this.bcross === t.bottom) {
            t2 = t.lowerLeft;
            t2.rightPoint = e.q;
        } else {
            t2 = new Trapezoid(lp, e.q, e, t.bottom);
            t2.updateLeft(e.below, t.lowerLeft);
            this.items.push(t2);
        }

        t3 = new Trapezoid(e.q, t.rightPoint, t.top, t.bottom);
        t3.updateLeftRight(t1, t2, t.upperRight, t.lowerRight);
        this.items.push(t3);

        this.queryGraph.case4(t.sink, e, t1, t2, t3);
    },

    collectPoints: function () {
        var i, t,
            len = this.items.length;

        // after finding the first outside trapezoid that has a linked inside trapezoid below,
        // mark other inside trapezoids (with depth-first search)
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (t.removed) continue;
            if (t.top === this.root.top && t.bottom.below) { t.bottom.below.markInside(); break; }
            if (t.bottom === this.root.bottom && t.top.above) { t.top.above.markInside(); break; }
        }

        // collect interior monotone mountain points
        for (i = 0; i < len; i++) {
            t = this.items[i];
            if (!t.removed && t.inside) t.addPoints();
        }
    }
};
