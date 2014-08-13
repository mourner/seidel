'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    sub: function (other) {
        return new Point(this.x - other.x, this.y - other.y);
    },
    cross: function (p) {
        return this.x * p.y - this.y * p.x;
    },
    dot: function (p) {
        return this.x * p.x + this.y * p.y;
    },
    neq: function (other) {
        return other.x !== this.x || other.y !== this.y;
    },
    clone: function () {
        return new Point(this.x, this.y);
    }
};
