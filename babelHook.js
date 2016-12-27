require("babel-core/register")({
  presets: [
    "es2015",
    "stage-0",
    "stage-1",
  ],
  plugins: [
    "transform-flow-strip-types",
  ]
})

global.fetch = require('node-fetch')

require('babel-polyfill')