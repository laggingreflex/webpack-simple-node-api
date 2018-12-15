const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

module.exports = (config, opts = {}) => {
  return ({
    run,
    watch,
    devServer,
  });

  function run() {
    const compiler = webpack(config);
    return new Promise((resolve, reject) => compiler.run((error, stats) => {
      if (error) reject(error)
      else resolve(stats);
    }));
  }

  function watch(options, watcher) {
    if (typeof options === 'function') {
      [watcher, options] = [options, {}];
    }
    if (!watcher) watcher = () => {};
    return webpack(config).watch(options, watcher);
  }

  function devServer(options, watcher) {
    if (typeof options === 'function') {
      [watcher, options] = [options, {}];
    }
    if (!watcher) watcher = () => {};
    const opts = {
      inline: true,
      hot: true,
      port: config.devServer.port,
      host: '0.0.0.0',
      ...options,
    };
    WebpackDevServer.addDevServerEntrypoints(config, opts);
    if (opts.hot) {
      config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    const compiler = webpack(config);
    compiler.hooks.done.tap('webpack-simple-node-api', watcher);
    const server = new WebpackDevServer(compiler, opts);
    return server.listen(opts.port, opts.host, (error) => {
      if (error) console.error(error);
      else console.log('Listening at port', opts.port);
    });
  }
};
