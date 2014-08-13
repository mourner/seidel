'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    sub: function (other) {
        if (other instanceof Point) return new Point(this.x - other.x, this.y - other.y);
        return new Point(this.x - other, this.y - other);
    },
    add: function (other) {
        if (other instanceof Point) return new Point(this.x - other.x, this.y - other.y);
        return new Point(this.x - other, this.y - other);
    },

    mul: function (f) { return new Point(this.x * f, this.y * f); },
    div: function (a) { return new Point(this.x / a, this.y / a); },

    cross: function (p) { return this.x * p.y - this.y * p.x; },
    dot:   function (p) { return this.x * p.x + this.y * p.y; },

    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function () {
        return this.div(this.length());
    },
    less: function (p) {
        return this.x < p.x;
    },
    neq: function (other) {
        return other.x !== this.x || other.y !== this.y;
    },
    clone: function () {
        return new Point(this.x, this.y);
    }
};
