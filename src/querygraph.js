'use strict';

module.exports = QueryGraph;

var edgeOrient = require('./util').edgeOrient;


function QueryGraph(head) {
    this.head = getSink(head);
}

QueryGraph.prototype = {

    locate: function (point, slope) {
        var node = this.head,
            orient;

        while (node) {
            if (node.trapezoid) return node.trapezoid;

            if (node.point) {
                node = point.x >= node.point.x ? node.rchild : node.lchild;

            } else if (node.edge) {
                orient = edgeOrient(node.edge, point);
                node =
                    orient < 0 ? node.rchild :
                    orient > 0 ? node.lchild :
                    slope < node.edge.slope ? node.rchild : node.lchild;
            }
        }
    },

    case1: function (sink, edge, t1, t2, t3, t4) {
        var yNode = setYNode(new Node(), edge, getSink(t2), getSink(t3)),
            qNode = setXNode(new Node(), edge.q, yNode, getSink(t4));
        setXNode(sink, edge.p, getSink(t1), qNode);
    },

    case2: function (sink, edge, t1, t2, t3) {
        var yNode = setYNode(new Node(), edge, getSink(t2), getSink(t3));
        setXNode(sink, edge.p, getSink(t1), yNode);
    },

    case3: function (sink, edge, t1, t2) {
        setYNode(sink, edge, getSink(t1), getSink(t2));
    },

    case4: function (sink, edge, t1, t2, t3) {
        var yNode = setYNode(new Node(), edge, getSink(t1), getSink(t2));
        setXNode(sink, edge.q, yNode, getSink(t3));
    }
};


function Node() {
    this.point = null;
    this.edge = null;
    this.lchild = null;
    this.rchild = null;
    this.trapezoid = null;
}

function setYNode(node, edge, lchild, rchild) {
    node.edge = edge;
    node.lchild = lchild;
    node.rchild = rchild;
    node.trapezoid = null;
    return node;
}

function setXNode(node, point, lchild, rchild) {
    node.point = point;
    node.lchild = lchild;
    node.rchild = rchild;
    node.trapezoid = null;
    return node;
}


function setSink(node, trapezoid) {
    node.trapezoid = trapezoid;
    trapezoid.sink = node;
    return node;
}

function getSink(trapezoid) {
    return trapezoid.sink || setSink(new Node(), trapezoid);
}


