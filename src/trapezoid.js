'use strict';

module.exports = Trapezoid;

var util = require('./util');


function Trapezoid(leftPoint, rightPoint, top, bottom) {
    this.leftPoint = leftPoint;
    this.rightPoint = rightPoint;
    this.top = top;
    this.bottom = bottom;

    this.inside = false;
    this.removed = false;
    this.sink = null;

    this.upperLeft = null;
    this.upperRight = null;
    this.lowerLeft = null;
    this.lowerRight = null;
}

Trapezoid.prototype = {

    updateLeft: function (ul, ll) {
        this.upperLeft = ul;
        if (ul) ul.upperRight = this;
        this.lowerLeft = ll;
        if (ll) ll.lowerRight = this;
    },

    updateRight: function (ur, lr) {
        this.upperRight = ur;
        if (ur) ur.upperLeft = this;
        this.lowerRight = lr;
        if (lr) lr.lowerLeft = this;
    },

    updateLeftRight: function (ul, ll, ur, lr) {
        this.updateLeft(ul, ll);
        this.updateRight(ur, lr);
    },

    // mark inside trapezoids with non-recursive depth-first search
    markInside: function () {
        var stack = [this];

        while (stack.length) {
            var t = stack.pop();
            if (!t.inside) {
                t.inside = true;
                if (t.upperLeft) stack.push(t.upperLeft);
                if (t.lowerLeft) stack.push(t.lowerLeft);
                if (t.upperRight) stack.push(t.upperRight);
                if (t.lowerRight) stack.push(t.lowerRight);
            }
        }
    },

    contains: function (point) {
        return point.x > this.leftPoint.x &&
               point.x < this.rightPoint.x &&
               util.edgeAbove(this.top, point) &&
               util.edgeBelow(this.bottom, point);
    },

    addPoint: function (array, point) {
        var len = array.length;
        if (!len || util.neq(array[len - 1], point)) array.push(util.clone(point));
    },

    addPoints: function () {
        if (this.leftPoint !== this.bottom.p) this.addPoint(this.bottom.mpoints, this.leftPoint);
        if (this.rightPoint !== this.bottom.q) this.addPoint(this.bottom.mpoints, this.rightPoint);

        if (this.leftPoint !== this.top.p) this.addPoint(this.top.mpoints, this.leftPoint);
        if (this.rightPoint !== this.top.q) this.addPoint(this.top.mpoints, this.rightPoint);
    }
};
