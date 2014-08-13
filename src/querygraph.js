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
        if (sink.parentList.length) {
            node.replace(sink);
        } else {
            this.head = node;
        }
    },

    case1: function (sink, edge, tlist) {
        var yNode = new YNode(edge, isink(tlist[1]), isink(tlist[2])),
            qNode = new XNode(edge.q, yNode, isink(tlist[3])),
            pNode = new XNode(edge.p, isink(tlist[0]), qNode);
        this.replace(sink, pNode);
    },

    case2: function (sink, edge, tlist) {
        var yNode = new YNode(edge, isink(tlist[1]), isink(tlist[2])),
            pNode = new XNode(edge.p, isink(tlist[0]), yNode);
        this.replace(sink, pNode);
    },

    case3: function (sink, edge, tlist) {
        var yNode = new YNode(edge, isink(tlist[0]), isink(tlist[1]));
        this.replace(sink, yNode);
    },

    case4: function (sink, edge, tlist) {
        var yNode = new YNode(edge, isink(tlist[0]), isink(tlist[1])),
            qNode = new XNode(edge.q, yNode, isink(tlist[2]));
        this.replace(sink, qNode);
    }
};
