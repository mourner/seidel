'use strict';

module.exports = MonotoneMountain;

var PI_SLOP = 3.1;

function MonotoneMountain() {}

MonotoneMountain.prototype = {

    add: function (point) {
        if (!this.head) {
            this.head = point;
            this.size++;

        } else if (!this.tail) {
            if (point.neq(this.head)) {
                this.tail = point;
                this.tail.prev = this.head;
                this.head.next = this.tail;
            }
        } else if (point.neq(this.tail)) {
            this.tail.next = point;
            point.prev = this.tail;
            this.tail = point;
        }
    },

    remove: function (point) {
        var next = point.next,
            prev = point.prev;
        point.prev.next = next;
        point.next.prev = prev;
        point.removed = true;
    },

    triangulate: function () {
        this.positive = angle(this.head.next, this.tail, this.head) >= 0;

        var p = this.head.next,
            convexPoints = [];

        while (p !== this.tail) {
            // var a = angle(p.next, p.prev, p);
            // if (a >= PI_SLOP || a <= -PI_SLOP || a === 0) this.remove(p);
            if (this.isConvex(p)) convexPoints.push(p);
            p = p.next;
        }

        var triangles = [];

        while (convexPoints.length) {
            var ear = convexPoints.shift();
            if (ear.removed) continue;
            // TODO see if there's a more efficient way to fix this

            var prev = ear.prev,
                next = ear.next;

            triangles.push([prev, ear, next]);
            this.remove(ear);

            if (this.valid(prev)) convexPoints.push(prev);
            if (this.valid(next)) convexPoints.push(next);
        }

        return triangles;
    },

    // for debugging purposes

    // monoPoly: function () {
    //     var poly = [];
    //     var p = this.head;
    //     while (p) {
    //         poly.push(p);
    //         p = p.next;
    //     }
    //     return poly;
    // },

    valid: function (p) {
        return p !== this.head && p !== this.tail && this.isConvex(p);
    },

    isConvex: function (p) {
        return this.positive === (angle(p.next, p.prev, p) >= 0);
    }
};

function angle(a, b, c) {
    var x1 = a.x - c.x,
        x2 = b.x - c.x,
        y1 = a.y - c.y,
        y2 = b.y - c.y;

    return Math.atan2(
        x1 * y2 - y1 * x2,
        x1 * x2 + y1 * y2);
}
