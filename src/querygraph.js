'use strict';

module.exports = QueryGraph;

function QueryGraph(head) {
    this.head = Sink.get(head);
}

QueryGraph.prototype = {

    locate: function (edge) {
        return this.head.locate(edge).trapezoid;
    },

    replace: function (sink, node) {
        if (sink.parents.length) {
            node.replace(sink);
        } else {
            this.head = node;
        }
    },

    case1: function (sink, edge, t1, t2, t3, t4) {
        var yNode = new YNode(edge, Sink.get(t2), Sink.get(t3)),
            qNode = new XNode(edge.q, yNode, Sink.get(t4)),
            pNode = new XNode(edge.p, Sink.get(t1), qNode);
        this.replace(sink, pNode);
    },

    case2: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, Sink.get(t2), Sink.get(t3)),
            pNode = new XNode(edge.p, Sink.get(t1), yNode);
        this.replace(sink, pNode);
    },

    case3: function (sink, edge, t1, t2) {
        var yNode = new YNode(edge, Sink.get(t1), Sink.get(t2));
        this.replace(sink, yNode);
    },

    case4: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, Sink.get(t1), Sink.get(t2)),
            qNode = new XNode(edge.q, yNode, Sink.get(t3));
        this.replace(sink, qNode);
    }
};


function Node(lchild, rchild) {
    this.parents = [];

    this.lchild = lchild;
    this.rchild = rchild;

    if (lchild) lchild.parents.push(this);
    if (rchild) rchild.parents.push(this);
}

Node.prototype.replace = function (node) {
    for (var i = 0; i < node.parents.length; i++) {
        var parent = node.parents[i];

        if (parent.lchild === node) parent.lchild = this;
        else parent.rchild = this;

        this.parents.push(parent);
    }
};


function Sink(trapezoid) {
    this.parents = [];
    this.trapezoid = trapezoid;
    trapezoid.sink = this;
}

Sink.prototype = Object.create(Node.prototype);

Sink.prototype.locate = function () {
    return this;
};

Sink.get = function (trapezoid) {
    return trapezoid.sink || new Sink(trapezoid);
};


function XNode(point, lchild, rchild) {
    Node.call(this, lchild, rchild);
    this.x = point.x;
}

XNode.prototype = Object.create(Node.prototype);

XNode.prototype.locate = function (edge) {
    if (edge.p.x >= this.x) return this.rchild.locate(edge);
    return this.lchild.locate(edge);
};


function YNode(edge, lchild, rchild) {
    Node.call(this, lchild, rchild);
    this.edge = edge;
}

YNode.prototype = Object.create(Node.prototype);

YNode.prototype.locate = function (edge) {
    if (this.edge.isAbove(edge.p)) return this.rchild.locate(edge);
    if (this.edge.isBelow(edge.p)) return this.lchild.locate(edge);
    if (edge.slope < this.edge.slope) return this.rchild.locate(edge);
    return this.lchild.locate(edge);
};
