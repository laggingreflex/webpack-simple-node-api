const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

module.exports = (config, opts = {}) => {
  const toString = stats => stats.toString(config.stats);

  return { build, devServer, watch };

  function build({ log = true } = {}) {
    const compiler = webpack(config);
    return new Promise((resolve, reject) => compiler.run((error, stats) => {
      if (error || stats.hasErrors()) {
        if (log) console.error(toString(stats));
        reject(error);
      } else {
        if (log) console.log(toString(stats));
        resolve(stats);
      }
    }));
  }

  function watch(options = {}, handler) {
    if (typeof options === 'function') {
      [handler, options] = [options, {}];
    }
    const compiler = webpack(config);
    compiler.watch(options, (error, stats) => {
      if (handler) handler(error, stats);
      else if (error) {
        if (options.log) console.error(toString(stats));
      } else {
        if (options.log) console.log(toString(stats));
      }
    });
    console.log(`Webpack is watching files...`);
    return compiler;
  }

  function devServer(options, onCompile) {
    if (typeof options === 'function') {
      [onCompile, options] = [options, {}];
    }
    const opts = {
      inline: true,
      hot: true,
      // port: (config.devServer && config.devServer.port || 8000),
      host: 'localhost',
      ...options,
      ...config.devServer,
    };
    WebpackDevServer.addDevServerEntrypoints(config, opts);
    if (opts.hot) {
      config.plugins = config.plugins || [];
      // config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    config.mode = config.mode || 'development';
    const compiler = webpack(config);
    if (onCompile) {
      compiler.hooks.done.tap('webpack-simple-node-api', onCompile);
    }
    const server = new WebpackDevServer(compiler, opts);
    return new Promise((resolve, reject) => {
      const listener = server.listen(opts.port, opts.host, (error) => {
        if (error) reject(error)
        const address = listener.address();
        console.log('Listening at', address);
        resolve(listener);
      });
    })
  }
};
