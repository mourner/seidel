'use strict';

module.exports = earcut;

function PolygonNode(p) {
    this.p = p;
    this.convex = null;
    this.prev = null;
    this.next = null;
}

function insert(node, last) {
    if (!last) {
        node.prev = node;
        node.next = node;

    } else {
        node.next = last.next;
        node.prev = last;
        last.next.prev = node;
        last.next = node;
    }
    return node;
}

function earcut(points) {

    var last,
        sum = 0;

    // create a doubly linked list from polygon points, detecting winding order along the way
    for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        var p1 = points[i],
            p0 = points[j];

        sum += (p1[0] - p0[0]) * (p1[1] + p0[1]);

        last = insert(new PolygonNode(p1), last);
    }

    var clockwise = sum < 0;


    // find all convex nodes
    var node = last;
    do {
        node.convex = isConvex(node.prev.p, node.p, node.next.p, clockwise);
        node = node.next;
    } while (node !== last);


    var triangles = [];

    // iterate through ears, slicing them one by one
    var ear = last,
        prev, next;

    do {
        prev = ear.prev;
        next = ear.next;

        if (ear.convex && isEar(ear, clockwise)) {
            triangles.push([prev.p, ear.p, next.p]);

            ear.next.prev = ear.prev;
            ear.prev.next = ear.next;

            prev.convex = prev.convex || isConvex(prev.prev.p, prev.p, next.p, clockwise);
            next.convex = next.convex || isConvex(prev.p, next.p, next.next.p, clockwise);
        }

        ear = next;
    } while (ear.next !== ear.prev);

    return triangles;
}

// iterate through points to check if there's a reflex point inside a potential ear
function isEar(ear, clockwise) {

    var a = ear.prev.p,
        b = ear.p,
        c = ear.next.p,

        ax = a[0], bx = b[0], cx = c[0],
        ay = a[1], by = b[1], cy = c[1],
        A = (ay - by) * cx + (bx - ax) * cy + (ax * by - ay * bx),
        sign = clockwise ? 1 : -1,

        node = ear.next.next,
        p, px, py, s, t;

    while (node !== ear.prev) {
        p = node.p;
        if (!p.convex) {
            px = p[0];
            py = p[1];
            s = (ay * cx - ax * cy + (cy - ay) * px + (ax - cx) * py) * sign;
            t = (ax * by - ay * bx + (ay - by) * px + (bx - ax) * py) * sign;
            if (s >= 0 && t >= 0 && (s + t) <= A * sign) return false;
        }
        node = node.next;
    }
    return true;
}

function isConvex(a, b, p, clockwise) {
    var ax = a[0] - p[0],
        ay = a[1] - p[1],
        bx = b[0] - p[0],
        by = b[1] - p[1];
    return clockwise === (ax * by > ay * bx);
}
