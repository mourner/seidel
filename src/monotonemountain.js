'use strict';

module.exports = MonotoneMountain;

var PI_SLOP = 3.1;

function MonotoneMountain() {
    this.size = 0;
    this.convexPoints = [];
    this.monoPoly = [];
    this.triangles = [];
    this.positive = false;
}

MonotoneMountain.prototype = {

    add: function (point) {
        if (this.size === 0) {
            this.head = point;
            this.size++;

        } else if (this.size === 1) {
            if (point.neq(this.head)) {
                this.tail = point;
                this.tail.prev = this.head;
                this.head.next = this.tail;
                this.size++;
            }
        } else if (point.neq(this.tail)) {
            this.tail.next = point;
            point.prev = this.tail;
            this.tail = point;
            this.size++;
        }
    },

    remove: function (point) {
        var next = point.next,
            prev = point.prev;
        point.prev.next = next;
        point.next.prev = prev;
        this.size--;
    },

    process: function () {
        this.positive = this.angleSign();
        this.genMonoPoly();

        var p = this.head.next;

        while (p !== this.tail) {
            var a = this.angle(p);

            if (a >= PI_SLOP || a <= -PI_SLOP || a === 0) {
                this.remove(p);

            } else if (this.isConvex(p)) {
                this.convexPoints.push(p);
            }
            p = p.next;
        }

        this.triangulate();
    },

    triangulate: function () {
        while (this.convexPoints.length) { // TODO slow?
            var ear = this.convexPoints.shift(),
                prev = ear.prev,
                next = ear.next;
            this.triangles.push([prev, ear, next]);
            this.remove(ear);
            if (this.valid(prev)) this.convexPoints.push(prev);
            if (this.valid(next)) this.convexPoints.push(next);
        }
        // assert this.size <= 3, "Triangulation bug, please report"
    },

    valid: function (p) {
        return p !== this.head && p !== this.tail && this.isConvex(p);
    },

    genMonoPoly: function () {
        var p = this.head;
        while (p) {
            this.monoPoly.push(p);
            p = p.next;
        }
    },

    angle: function (p) {
        var a = p.next.sub(p),
            b = p.prev.sub(p);
        return Math.atan2(a.cross(b), a.dot(b));
    },

    angleSign: function () {
        var a = this.head.next.sub(this.head),
            b = this.tail.sub(this.head);
        return Math.atan2(a.cross(b), a.dot(b)) >= 0;
    },

    isConvex: function (p) {
        return this.positive === (this.angle(p) >= 0);
    }
};
