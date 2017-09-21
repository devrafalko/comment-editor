// Karma configuration
const webpackConfig = require('./webpack.config.js')

module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: [ 'ChromeCanaryHeadless' ],
    colors: true,
    coverageReporter: {
      dir: 'coverage/',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },
    exclude: [],
    files: [
      'src/**/*.js',
      'tests/**/*.test.js',
      'tests/**/*.spec.js'
    ],
    frameworks: [ 'jasmine', 'tap' ],
    logLevel: config.LOG_INFO,
    port: 9876,
    plugins: [
      'karma-babel-preprocessor',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-eslint',
      'karma-jasmine',
      'karma-spec-reporter',
      'karma-tap',
      'karma-webpack'
    ],
    preprocessors: {
      'src/**/*.js': [ 'webpack' ],
      'tests/**/*.test.js': [ 'webpack' ],
      'tests/**/*.spec.js': [ 'webpack' ]
    },
    eslint: {
      engine: { configFile: '.eslintrc.json' },
      errorThreshold: 100,
      showWarnings: true,
      stopAboveErrorThreshold: true,
      stopOnError: false,
      stopOnWarning: false
    },
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    },
    reporters: [ 'progress', 'spec', 'coverage' ],
    singleRun: false,
    concurrency: Infinity
  })
}
