'use strict';

module.exports = Polygon;

// polygon contour as a doubly linked list

function Polygon() {
	this.length = 0;
	this.first = null;
	this.last = null;
}

function PolygonNode(point) {
	this.point = point;
	this.next = null;
	this.prev = null;
	this.ear = false;
}

Polygon.prototype = {
	add: function (point) {
		var node = new PolygonNode(point);

		if (!this.length) {
			this.first = this.last = node;

		} else {
			this.last.next = node;
			node.prev = this.last;
			this.last = node;
		}

		this.length++;
	},

	remove: function (node) {
		if (!this.length) return;

		if (node === this.first) {
			this.first = this.first.next;

			if (!this.first) this.last = null;
			else this.first.prev = null;

		} else if (node === this.last) {
			this.last = this.last.prev;
			this.last.next = null;

		} else {
			node.prev.next = node.next;
			node.next.prev = node.prev;
		}

		node.prev = null;
		node.next = null;

		this.length--;
	},

	insertBefore: function (point, node) {
		var newNode = new PolygonNode(point);
		newNode.prev = node.prev;
		newNode.next = node;

		if (!node.prev) this.first = newNode;
		else node.prev.next = newNode;

		node.prev = newNode;

		this.length++;
	}
};
