'use strict';

module.exports = MonotoneMountain;

var DoublyLinkedList = require('./dlinkedlist');

function MonotoneMountain(a, b, points) {
    this.a = a;
    this.b = b;

    this.positive = false;

    points.sort(compareX);

    var list = this.list = new DoublyLinkedList();

    list.add(a);
    for (var i = 0; i < points.length; i++) {
        if (points[i].neq(list.tail)) list.add(points[i]);
    }
    if (b.neq(list.tail)) list.add(b);
}

function compareX(a, b) {
    return a.x - b.x;
}

MonotoneMountain.prototype = {

    triangulate: function (triangles) {
        var list = this.list,
            p = list.head.next;

        if (list.length === 3) {
            triangles.push([this.a, p, this.b]);
            return;
        } else if (list.length < 3) return;

        // triangles.push(this.poly());
        // return;

        var convexPoints = [];

        this.positive = angle(p, this.b, this.a) >= 0;

        while (p !== list.tail) {
            this.addEar(convexPoints, p);
            p = p.next;
        }

        while (convexPoints.length) {
            var ear = convexPoints.shift(),
                prev = ear.prev,
                next = ear.next;

            triangles.push([prev, ear, next]);

            list.remove(ear);

            this.addEar(convexPoints, prev);
            this.addEar(convexPoints, next);
        }
    },

    poly: function () {
        var poly = [];
        var p = this.list.head;
        while (p) {
            poly.push(p);
            p = p.next;
        }
        return poly;
    },

    addEar: function (points, p) {
        if (!p.ear && p !== this.list.head && p !== this.list.tail && this.isConvex(p)) {
            p.ear = true;
            points.push(p);
        }
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
