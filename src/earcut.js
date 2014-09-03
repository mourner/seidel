'use strict';

module.exports = earcut;

function earcut(points) {

    var triangles = [],
        sum = 0,
        len = points.length,
        i, j, last, clockwise, ear, prev, next;

    // create a doubly linked list from polygon points, detecting winding order along the way
    for (i = 0, j = len - 1; i < len; j = i++) {
        last = insertNode(points[i], last);
        sum += (points[i][0] - points[j][0]) * (points[i][1] + points[j][1]);
    }
    clockwise = sum < 0;

    // iterate through ears, slicing them one by one
    ear = last;
    while (len > 2) {
        prev = ear.prev;
        next = ear.next;

        if (len === 3 || isEar(ear, clockwise)) {
            triangles.push([prev.p, ear.p, next.p]);
            ear.next.prev = ear.prev;
            ear.prev.next = ear.next;
            len--;
        }
        ear = next;
    }

    return triangles;
}

// iterate through points to check if there's a reflex point inside a potential ear
function isEar(ear, clockwise) {

    var a = ear.prev.p,
        b = ear.p,
        c = ear.next.p,

        ax = a[0], bx = b[0], cx = c[0],
        ay = a[1], by = b[1], cy = c[1];

    if (clockwise !== ((ax - cx) * (by - cy) > (ay - cy) * (bx - cx))) return false; // reflex

    var A = (ay - by) * cx + (bx - ax) * cy + (ax * by - ay * bx),
        sign = clockwise ? 1 : -1,

        node = ear.next.next,
        p, px, py, s, t;

    while (node !== ear.prev) {
        p = node.p;
        px = p[0];
        py = p[1];

        s = (ay * cx - ax * cy + (cy - ay) * px + (ax - cx) * py) * sign;
        t = (ax * by - ay * bx + (ay - by) * px + (bx - ax) * py) * sign;

        if (s >= 0 && t >= 0 && (s + t) <= A * sign) return false;

        node = node.next;
    }
    return true;
}

function insertNode(point, last) {
    var node = {
        p: point,
        prev: null,
        next: null
    };

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

