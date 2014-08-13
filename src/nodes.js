'use strict';

exports.Node = Node;
exports.Sink = Sink;
exports.XNode = XNode;
exports.YNode = YNode;


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
    this.point = point;
}

XNode.prototype = Object.create(Node.prototype);

XNode.prototype.locate = function (edge) {
    if (edge.p.x >= this.point.x) return this.rchild.locate(edge);
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
