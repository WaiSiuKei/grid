const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FailPlugin = require('webpack-fail-plugin');

module.exports = {
  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: ['ts-loader']
      },
      {
        test: /\.(css|scss)$/,
        loaders: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    FailPlugin,
    new HtmlWebpackPlugin({
      template: conf.path.src('index.html')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        ts: {
          configFile: 'tsconfig.json'
        }
      },
      debug: true
    })
  ],
  devtool: 'eval-source-map',
  output: {
    path: path.join(process.cwd(), conf.paths.tmp),
    filename: 'index.js'
  },
  resolve: {
    extensions: [
      '.webpack.js',
      '.web.js',
      '.js',
      '.ts'
    ],
    alias: {
      src: path.resolve(__dirname, '../src'),
    }
  },
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?reload=true',
    `./${conf.path.src('index')}`
  ]
};
