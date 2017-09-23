// Karma configuration
const webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ],
    basePath: '',
    files: [
      {
        pattern: 'assets/**/*.css',
        watched: false, served: true, nocache: false, included: false
      },
      {
        pattern: 'data/**/*.json',
        watched: false, served: true, nocache: false, included: false
      },
      {
        pattern: 'dist/bundle.js',
        watched: true, served: true, nocache: true, included: false
      },
      { pattern: 'src/**/*.js', watched: true, included: false },
      { pattern: 'tests/**/*.spec.js', watched: true },
      { pattern: 'tests/**/*.test.js', watched: true }
    ],
    exclude: [],
    proxies: {
      '/assets/': '/base/assets/',
      '/data/': '/base/data/',
      '/dist/': '/base/dist/'
    },
    frameworks: [ 'jasmine' ],
    plugins: [
      'karma-babel-preprocessor',
      'karma-chrome-launcher',
      'karma-html',
      'karma-jasmine',
      'karma-webpack'
    ],
    preprocessors: {
      'src/**/*.js': [ 'webpack' ],
      'tests/**/*.spec.js': [ 'webpack' ],
      'tests/**/*.test.js': [ 'webpack' ]
    },
    reporters: [ 'progress', 'karmaHTML' ],
    clearContext:false,
    client: {
      karmaHTML: {
        auto: true,
        source: [
          { src: 'index.html', tag: 'index' }
        ]
      }
    },
    coverageReporter: {
      dir: 'coverage/',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    },
    autoWatch: true,
    logLevel: config.LOG_INFO,
    colors: true,
    singleRun: false,
    port: 9876,
    concurrency: Infinity
  })
}
