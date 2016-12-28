require("babel-core/register")({
  presets: [
    "react",
    "es2015",
    "stage-0",
    "stage-1",
  ],
  plugins: [
    "transform-decorators-legacy",
    "transform-flow-strip-types",
  ]
});

require('babel-polyfill');

module.exports = require('./server.babel');