'use strict';

module.exports = QueryGraph;

function QueryGraph(head) {
    this.head = getSink(head);
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
        var yNode = new YNode(edge, getSink(t2), getSink(t3)),
            qNode = new XNode(edge.q, yNode, getSink(t4)),
            pNode = new XNode(edge.p, getSink(t1), qNode);
        this.replace(sink, pNode);
    },

    case2: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, getSink(t2), getSink(t3)),
            pNode = new XNode(edge.p, getSink(t1), yNode);
        this.replace(sink, pNode);
    },

    case3: function (sink, edge, t1, t2) {
        var yNode = new YNode(edge, getSink(t1), getSink(t2));
        this.replace(sink, yNode);
    },

    case4: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, getSink(t1), getSink(t2)),
            qNode = new XNode(edge.q, yNode, getSink(t3));
        this.replace(sink, qNode);
    }
};


function YNode(edge, lchild, rchild) {
    this.parents = [];

    this.lchild = lchild;
    this.rchild = rchild;

    lchild.parents.push(this);
    rchild.parents.push(this);

    this.edge = edge;
}

YNode.prototype.replace = function (node) {
    for (var i = 0; i < node.parents.length; i++) {
        var parent = node.parents[i];

        if (parent.lchild === node) parent.lchild = this;
        else parent.rchild = this;

        this.parents.push(parent);
    }
}

YNode.prototype.locate = function (edge) {
    if (this.edge.isAbove(edge.p)) return this.rchild.locate(edge);
    if (this.edge.isBelow(edge.p)) return this.lchild.locate(edge);
    if (edge.slope < this.edge.slope) return this.rchild.locate(edge);
    return this.lchild.locate(edge);
};


function XNode(point, lchild, rchild) {
    this.parents = [];

    this.lchild = lchild;
    this.rchild = rchild;

    lchild.parents.push(this);
    rchild.parents.push(this);

    this.x = point.x;
}

XNode.prototype.locate = function (edge) {
    if (edge.p.x >= this.x) return this.rchild.locate(edge);
    return this.lchild.locate(edge);
};

XNode.prototype.replace = YNode.prototype.replace;


function Sink(trapezoid) {
    this.parents = [];
    this.trapezoid = trapezoid;
    trapezoid.sink = this;
}

Sink.prototype.locate = function () {
    return this;
};

function getSink(trapezoid) {
    return trapezoid.sink || new Sink(trapezoid);
};


