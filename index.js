const { merge } = require('webpack-merge');

module.exports = (config, opts = {}) => {
  if (Array.isArray(config)) config = merge(config.filter(Boolean));
  const toString = stats => stats.toString(config.stats);

  return { build, devServer, watch };

  function build({ log = true } = {}) {
    const webpack = require('webpack');
    const compiler = webpack(config);
    return new Promise((resolve, reject) => compiler.run((error, stats) => {
      const string = toString(stats);
      if (error || stats.hasErrors()) {
        if (log) console.error(string);
        reject(error || stats.compilation?.errors?.[0]);
      } else {
        if (log) console.log(string);
        resolve(stats);
      }
    }));
  }

  function watch(options = {}, handler) {
    const webpack = require('webpack');
    if (typeof options === 'function') {
      [handler, options] = [options, {}];
    }
    const compiler = webpack(config);
    compiler.hooks.watchRun.tap('webpack-simple-node-api', (context, entry) => {
      if (options.watchRun) options.watchRun(context, entry);
      else if (options.log) console.log('(Re)compiling...');
    });
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

  async function devServer(options, onCompile) {
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    if (typeof options === 'function') {
      [onCompile, options] = [options, {}];
    }
    const opts = {
      // inline: true,
      // hot: true,
      // port: (config.devServer && config.devServer.port || 8000),
      host: 'localhost',
      ...options,
      ...config.devServer,
    };
    // WebpackDevServer.addDevServerEntrypoints(config, opts);
    if (opts.hot) {
      config.plugins = config.plugins || [];
      // config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }
    config.mode = config.mode || 'development';
    const compiler = webpack(config);
    const deferred = defer();
    let devServer;
    let counter = 1;
    const resolve = () => {
      if (!counter--) deferred.resolve(devServer);
    }

    compiler.hooks.done.tap('webpack-simple-node-api', (...args) => {
      if (onCompile) {
        onCompile(...args)
      }
      resolve();
    });

    devServer = new WebpackDevServer(opts, compiler);

    await devServer.start(opts.port, opts.host);

    return deferred.promise;
  }
};

function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}
