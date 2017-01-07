require("babel-core/register")({
  presets: [
    "react",
    "es2015",
    "stage-0",
    "stage-1",
  ],
  plugins: [
    "transform-flow-strip-types",
    "transform-decorators-legacy",
  ]
})

global.fetch = require('node-fetch')

require('babel-polyfill')