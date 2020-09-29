# webpack-simple-node-api

Simpler Node API Wrapper for Webpack

## Install

```
npm i webpack-simple-node-api webpack webpack-dev-server
```

## Usage

```js
const webpack = require('webpack-simple-node-api');

const { build, watch, devServer } = webpack(config);

build()                     // === webpack
watch(opts, handler)        // === webpack --watch
devServer(opts, onCompile)  // === webpack-dev-server --hot
```
