const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/dist')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          '/src/**/*.js',
          '/tests/*.js',
          '/tests/**/*.js'
        ],
        exclude: [ '/node_modules/' ]
      }
    ]
  },
  node: {
    fs: 'empty'// prevent Error: Cannot find module "fs" when loading karma-html
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin()
  ],
  devServer: {
    compress: true,
    hot: true
  },
  watch: false,
  watchOptions: {
    ignored: '/node_modules/'
  }
}
