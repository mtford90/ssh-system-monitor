const path               = require('path');
const webpack            = require('webpack');
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

import loaders from './loaders.config'
import plugins from './plugins.config'

module.exports = {
  entry:   path.resolve(path.join(__dirname, '../app/index')),
  output:  {
    path:     path.join(__dirname, 'dist'),
    filename: 'bundle.[chunkhash].js',
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {verbose: false}),
    new CopyWebpackPlugin([
      {from: 'images/', to: 'images/'},
      {from: 'manifest.json'}]),
    new webpack.optimize.UglifyJsPlugin({
      compress:  {
        warnings: false,
      },
      sourceMap: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    ...plugins,
  ],
  module:  {
    loaders: loaders
  },
};
