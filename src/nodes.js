'use strict';

exports.Node = Node;
exports.Sink = Sink;
exports.XNode = XNode;
exports.YNode = YNode;
exports.isink = isink;


function Node(lchild, rchild) {
    this.parentList = [];
    if (lchild) {
        this.lchild = lchild;
        lchild.parentList.push(this);
    }
    if (rchild) {
        this.rchild = rchild;
        rchild.parentList.push(this);
    }
}

Node.prototype.replace = function (node) {
    for (var i = 0; i < node.parentList.length; i++) {
        var parent = node.parentList[i];

        if (parent.lchild === node) parent.lchild = this;
        else parent.rchild = this;
    }
    this.parentList = this.parentList.concat(node.parentList);
};


function Sink(trapezoid) {
    this.parentList = [];
    this.trapezoid = trapezoid;
    trapezoid.sink = this;
}

Sink.prototype = Object.create(Node.prototype);

Sink.prototype.locate = function () {
    return this;
};

function isink(trapezoid) {
    if (!trapezoid.sink) return new Sink(trapezoid);
    return trapezoid.sink;
}


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
    Node.call(lchild, rchild);
    this.edge = edge;
}

YNode.prototype.locate = function (edge) {
    if (this.edge.isAbove(edge.p)) return this.rchild.locate(edge);
    if (this.edge.isBelow(edge.p)) return this.lchild.locate(edge);
    if (edge.slope < this.edge.slope) return this.rchild.locate(edge);
    return this.lchild.locate(edge);
};
