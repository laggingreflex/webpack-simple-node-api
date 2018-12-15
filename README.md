# webpack-simple-node-api

Simpler Node API Wrapper for Webpack

## Install

```
npm i webpack-simple-node-api
```

## Usage

```js
const webpack = require('webpack-simple-node-api');

const {run, watch, devServer} = webpack(config);

const stats = await run() // === webpack
watch(opts, watcher)      // === webpack --watch
devServer(opts, watcher)  // === webpack-dev-server --hot
```
