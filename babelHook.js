require("babel-core/register")({
  presets: [
    "es2015",
    "stage-0",
    "stage-1",
  ]
})

global.fetch = require('node-fetch')

require('babel-polyfill')