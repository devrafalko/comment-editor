// Karma configuration

module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '',
    browsers: [ 'Chrome' ],
    colors: true,
    concurrency: 1,
    coverageReporter: {
      dir: 'coverage/',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },
    exclude: [],
    files: [
      'src/**/*.js',
      'tests/**/*-test.js'
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
      'karma-phantomjs-launcher',
      'karma-tap',
      'karma-webpack'
    ],
    preprocessors: {
      'src/**/*.js': [ 'eslint', 'webpack', 'coverage' ],
      'tests/**/*-test.js': [ 'webpack' ]
    },
    eslint: {
      engine: { configFile: '.eslintrc.json' },
      errorThreshold: 100,
      showWarnings: true,
      stopAboveErrorThreshold: true,
      stopOnError: false,
      stopOnWarning: false
    },
    reporters: [ 'progress', 'coverage' ],
    singleRun: false
  })
}
