#!/usr/bin/env node

var path = require('path');
var prepend = require('prepend-file');
var findUp = require('find-up')

var FIXED_FILE = ['react-chartjs-2', 'node_modules', 'chart.js', 'src', 'core', 'core.helpers.js'];
var FIXED_CODE = '// < HACK >\n'
                 +'if (typeof window === \'undefined\') {\n'
                 +'  global.window = {};\n'
                 +'}\n// </ HACK >\n\n';

/**
 * This bad boy makes sure that chart.js 2.x works for server side rendering.
 *
 * For some reason the chartJS team won't add this check
 */
function hackChartJs() {
  findUp('node_modules')
    .then(nodeModules => prepend(
      path.resolve.apply(path, [nodeModules].concat(FIXED_FILE)),
      FIXED_CODE,
      console.log
    ));
}

hackChartJs();