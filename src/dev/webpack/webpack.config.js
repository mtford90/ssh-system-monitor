const path    = require('path');
const webpack = require('webpack');

import loaders from './loaders.config'
import plugins from './plugins.config'

module.exports = {
  devtool: null,
  entry:   [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    path.resolve(path.join(__dirname, '../../app/index.tsx')),
  ],
  output:  {
    path:       path.join(__dirname, '../dist'),
    filename:   'bundle.js',
    publicPath: '/dist/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    ...plugins
  ],
  module:  {
    loaders:    [{
      test:    /\.js$/,
      loaders: [
        'react-hot',
        'babel',
      ],
      exclude: /(node_modules|bower_components)/,
    },
      {
        test:    /\.tsx?$/,
        loaders: [
          "react-hot",
          "awesome-typescript-loader"]
      },
      {
        test:    /\.css/,
        loaders: ['style', 'css'],
      },
      {
        test:   /\.json$/,
        loader: 'json-loader'
      },
      {
        test:    /\.scss$/,
        loaders: [
          'style',
          'css',
          'sass'
        ],
      },
      {
        test:   /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      },
      {
        test:   /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff"
      },
      {
        test:   /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=application/octet-stream"
      },
      {
        test:   /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file"
      },
      {
        test:   /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?limit=10000&mimetype=image/svg+xml"
      }
    ],
    preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {test: /\.js$/, loader: "source-map-loader"}
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules',
    ],
    extensions:         [
      '',
      '.js',
      '.json',
      '.jsx',
    ],
  },
};
