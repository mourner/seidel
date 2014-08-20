'use strict';

var Point = require('./point');

exports.neq = function (p1, p2) {
    return p1.x !== p2.x || p1.y !== p2.y;
};

exports.clone = function (p) {
    return new Point(p.x, p.y);
};

exports.cross = function (a, b, c) {
    var acx = a.x - c.x,
        bcx = b.x - c.x,
        acy = a.y - c.y,
        bcy = b.y - c.y;
    return acx * bcy - acy * bcx;
};

exports.edgeOrient = function (edge, point) { return exports.cross(edge.p, edge.q, point); };
exports.edgeAbove  = function (edge, point) { return exports.cross(edge.p, edge.q, point) < 0; };
exports.edgeBelow  = function (edge, point) { return exports.cross(edge.p, edge.q, point) > 0; };

