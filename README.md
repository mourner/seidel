## Seidel's polygon triangulation

A crazy fast JavaScript implementation of polygon triangulation based on [Seidel's incremental randomized algorithm](https://www.cs.princeton.edu/courses/archive/fall05/cos528/handouts/A%20Simple%20and%20fast.pdf). Initially ported from earlier versions of [poly2tri](https://code.google.com/p/poly2tri/) by Mason Green,
it since has been heavily optimized and improved.

#### Usage

```js
var points = [[[10, 0], [0, 50], [60, 60], [70, 10]]];
seidel(points); // returns an array of triangles (arrays of 3 point objects each)
```

#### Why another triangulation library?

The aim of this project is to create a JS triangulation library that is **fast enough for real-time triangulation in the browser**,
sacrificing triangulation quality for raw speed.

The current state of the art in JS polygon triangulation is [poly2tri.js](https://github.com/r3mi/poly2tri.js),
which implements Constrained Delaunay Triangulation algorithm. It produces the best quality triangulation,
and is quite fast, but its performance is still limited. Seidel's implementation already significantly surpasses
it (while still having some nice room for further improvement):

```bash
$ node debug/bench.js

dude shape (94 vertices)
seidel x 7,952 ops/sec ±0.51% (100 runs sampled)
poly2tri x 4,243 ops/sec ±0.79% (97 runs sampled)
seidel is 87% faster than poly2tri

monkey (1204 vertices)
seidel x 467 ops/sec ±0.71% (91 runs sampled)
poly2tri x 294 ops/sec ±0.91% (91 runs sampled)
seidel is 59% faster than poly2tri
```

Another advantage of Seidel's algorithm is that it's potentially more forgiving to bad input data, so the goal is to
handle as many bad data cases as possible, dropping the [JS Clipper](http://sourceforge.net/projects/jsclipper/) preprocessing
requirement when triangulating user-generated data (e.g. for [WebGL Vector Maps](https://www.mapbox.com/blog/mapbox-gl-js/)).


#### To Do

- true nlog*(n) randomized algorithm (eliminating current performance bottlenecks) [#1](https://github.com/mapbox/seidel/issues/1)
- handling degenerate cases (e.g. segments touching edges, edges touching edges) [#5](https://github.com/mapbox/seidel/issues/5)
- test coverage [#3](https://github.com/mapbox/seidel/issues/3)

#### Browser builds

```bash
npm install
npm run build-dev # builds dist/seidel.dev.js, a dev version with a source map
npm run build-min # builds dist/seidel.min.js, a minified production build
```

![](https://cloud.githubusercontent.com/assets/25395/3972752/a028e4c8-27e0-11e4-8bc6-134bd87f4655.png)

