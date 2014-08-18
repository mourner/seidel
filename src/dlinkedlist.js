'use strict';

module.exports = DoublyLinkedList;

function DoublyLinkedList() {
	this.length = 0;
	this.head = null;
	this.tail = null;
}

DoublyLinkedList.prototype = {
	add: function (node) {

		if (!this.length) {
			this.head = this.tail = node;

		} else {
			this.tail.next = node;
			node.prev = this.tail;
			this.tail = node;
		}

		this.length++;
	},

	remove: function (node) {
		if (!this.length) return;

		if (node === this.head) {
			this.head = this.head.next;

			if (!this.head) this.tail = null;
			else this.head.prev = null;

		} else if (node === this.tail) {
			this.tail = this.tail.prev;
			this.tail.next = null;

		} else {
			node.prev.next = node.next;
			node.next.prev = node.prev;
		}

		node.prev = null;
		node.next = null;

		this.length--;
	},

	pop: function () {
		var node = this.tail;
		this.remove(node);
		return node;
	}
};
