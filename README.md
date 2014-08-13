
A JavaScript port of the Seidel's polygon triangulation [Python implementation](https://code.google.com/p/poly2tri/source/browse/python/seidel.py?repo=archive&r=5ad6efedc1c120ea194bbce2a0d4ed849e6e6903)
from earlier version of [poly2tri](https://code.google.com/p/poly2tri/) by Mason Green.
Ported to JavaScript by Vladimir Agafonkin.

Based on Raimund Seidel's paper "A simple and fast incremental randomized algorithm for computing trapezoidal decompositions and for triangulating polygons".

To build for use in a browser, run:

```bash
npm install
npm run build-dev # dist/seidel.dev.js, a dev version with a source map
npm run build-min # dist/seidel.min.js, a minified production build
```
