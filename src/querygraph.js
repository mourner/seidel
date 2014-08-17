'use strict';

module.exports = QueryGraph;

var nodes = require('./nodes'),
    YNode = nodes.YNode,
    XNode = nodes.XNode,
    Sink = nodes.Sink;

function QueryGraph(head, map) {
    this.head = Sink.get(head);
    this.map = map;
}

QueryGraph.prototype = {

    locate: function (edge) {
        return this.head.locate(edge).trapezoid;
    },

    followEdge: function (edge) {
        var t = this.locate(edge);

        this.splitTrapezoid(t, edge);

        while (edge.q.x > t.rightPoint.x) {
            t = edge.isAbove(t.rightPoint) ? t.upperRight : t.lowerRight;
            this.splitTrapezoid(t, edge);
        }

        this.map.clear();
    },

    splitTrapezoid: function (t, edge) {
         // Remove old trapezoid
        t.removed = true;

        // Bisect old trapezoids and create new
        var cp = t.contains(edge.p),
            cq = t.contains(edge.q);

        if (cp && cq) this.map.case1(t, edge);
        else if (cp && !cq) this.map.case2(t, edge);
        else if (!cp && !cq) this.map.case3(t, edge);
        else this.map.case4(t, edge);
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
