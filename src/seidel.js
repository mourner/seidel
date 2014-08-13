'use strict';

module.exports = triangulate;

var Triangulator = require('./triangulator');

function triangulate(points) {
	return new Triangulator(points).triangulate();
}
