'use strict';

module.exports = seidel;

var Triangulator = require('./triangulator');

function seidel(points) {
	return new Triangulator(points).triangulate();
}

seidel.Triangulator = Triangulator;
