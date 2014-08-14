'use strict';

module.exports = Edge;

function Edge(p, q) {
    this.p = p;
    this.q = q;
    this.slope = q.x - p.x !== 0 ? (q.y - p.y) / (q.x - p.x) : 0;
    this.b = p.y - (p.x * this.slope);
    this.mpoints = [];
}

Edge.prototype = {
    isAbove: function (point) { return orient2d(this.p, this.q, point) < 0; },
    isBelow: function (point) { return orient2d(this.p, this.q, point) > 0; }
};

function orient2d(pa, pb, pc) {
    var acx = pa.x - pc.x,
        bcx = pb.x - pc.x,
        acy = pa.y - pc.y,
        bcy = pb.y - pc.y;
    return acx * bcy - acy * bcx;
}
