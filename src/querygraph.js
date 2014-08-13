'use strict';

module.exports = QueryGraph;

var nodes = require('./nodes'),
    YNode = nodes.YNode,
    XNode = nodes.XNode,
    isink = nodes.isink;

function QueryGraph(head) {
    this.head = head;
}

QueryGraph.prototype = {

    locate: function (edge) {
        return this.head.locate(edge).trapezoid;
    },

    followEdge: function (edge) {
        var t = this.locate(edge),
            trapezoids = [t];

        while (edge.q.x > t.rightPoint.x) {
            t = edge.isAbove(t.rightPoint) ? t.upperRight : t.lowerRight;
            trapezoids.push(t);
        }
        return trapezoids;
    },

    replace: function (sink, node) {
        if (sink.parents.length) {
            node.replace(sink);
        } else {
            this.head = node;
        }
    },

    case1: function (sink, edge, t1, t2, t3, t4) {
        var yNode = new YNode(edge, isink(t2), isink(t3)),
            qNode = new XNode(edge.q, yNode, isink(t4)),
            pNode = new XNode(edge.p, isink(t1), qNode);
        this.replace(sink, pNode);
    },

    case2: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, isink(t2), isink(t3)),
            pNode = new XNode(edge.p, isink(t1), yNode);
        this.replace(sink, pNode);
    },

    case3: function (sink, edge, t1, t2) {
        var yNode = new YNode(edge, isink(t1), isink(t2));
        this.replace(sink, yNode);
    },

    case4: function (sink, edge, t1, t2, t3) {
        var yNode = new YNode(edge, isink(t1), isink(t2)),
            qNode = new XNode(edge.q, yNode, isink(t3));
        this.replace(sink, qNode);
    }
};
