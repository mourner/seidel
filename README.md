## Seidel's polygon triangulation

A JavaScript implementation of polygon triangulation based on [Seidel's incremental randomized algorithm](https://www.cs.princeton.edu/courses/archive/fall05/cos528/handouts/A%20Simple%20and%20fast.pdf).
Initially ported from earlier Scala/Python versions of [poly2tri](https://code.google.com/p/poly2tri/) by Mason Green,
it since has been heavily optimized and improved (including hole support).

Still yet to be implemented:

- true nlog*(n) randomized algorithm (eliminating current nlog(n) bottlenecks) [#1](https://github.com/mapbox/seidel/issues/1)
- handling degenerate cases (segments touching edges, edges touching edges) [#5](https://github.com/mapbox/seidel/issues/5)
- test coverage [#3](https://github.com/mapbox/seidel/issues/3)

#### Usage

```js
var points = [[[10, 0], [0, 50], [60, 60], [70, 10]]];
seidel(points); // returns an array of triangles (arrays of 3 point objects each)
```

#### Browser builds

```bash
npm install
npm run build-dev # builds dist/seidel.dev.js, a dev version with a source map
npm run build-min # builds dist/seidel.min.js, a minified production build
```

![](https://cloud.githubusercontent.com/assets/25395/3972752/a028e4c8-27e0-11e4-8bc6-134bd87f4655.png)

