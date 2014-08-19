'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.prev = null;
    this.next = null;
    this.ear = false;
}
