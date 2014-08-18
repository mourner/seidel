'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.prev = null;
    this.next = null;
    this.ear = false;
}

Point.prototype = {
    neq: function (other) {
        return other.x !== this.x || other.y !== this.y;
    },
    clone: function () {
        return new Point(this.x, this.y);
    }
};
