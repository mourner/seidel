## Seidel's polygon triangulation

The fastest and smallest JavaScript polygon triangulation library for your WebGL apps, based on [Seidel's incremental randomized algorithm](https://www.cs.princeton.edu/courses/archive/fall05/cos528/handouts/A%20Simple%20and%20fast.pdf). 2.7KB gzipped.

Initially ported from earlier versions of [poly2tri](https://code.google.com/p/poly2tri/) by Mason Green,
it since has been heavily optimized and improved.

#### Usage

```js
var points = [[[10, 0], [0, 50], [60, 60], [70, 10]]];
seidel(points); // returns an array of triangles (arrays of 3 point objects each)
```

The library only supports strictly simple polygons with holes (no intersecting/overlapping edges).
If you need to support weak/complex polygons, preprocess your data with [JS Clipper](http://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippersimplifypolygon).

#### Why another triangulation library?

The aim of this project is to create a JS triangulation library that is **fast enough for real-time triangulation in the browser**,
sacrificing triangulation quality for raw speed.

Benchmarks show that its by far the fastest among JS triangulation libraries, in addition to being the smallest and simplest:

(ops/sec) | points | seidel | poly2tri | libtess | fastest vs 2nd fastest
--- | --- | --- | --- | --- | ---
OSM building | 15 | _76,361_ | _29,041_ | _21,825_ | seidel vs poly2tri, 163% faster
dude shape | 94 | _9,845_ | _3,782_ | _4,336_ | seidel vs libtess, 127% faster
nazca monkey | 1204 | _578_ | _266_ | _332_ | seidel vs libtess, 74% faster

#### Browser builds

```bash
npm install
npm run build-dev # builds dist/seidel.dev.js, a dev version with a source map
npm run build-min # builds dist/seidel.min.js, a minified production build
```

![](https://cloud.githubusercontent.com/assets/25395/3972752/a028e4c8-27e0-11e4-8bc6-134bd87f4655.png)

