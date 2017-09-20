const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          '/src/**/*.js',
          '/tests/**/*.js'
        ],
        exclude: [ '/node_modules/' ]
      }
    ]
  },
  plugins: [
    // new UglifyJSPlugin({
    //   sourceMap: true
    // })
  ]
}
