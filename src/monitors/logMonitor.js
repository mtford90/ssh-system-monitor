/**
 * A super simple monitor that just logs all data events
 */

import {monitor} from './monitor'

/**
 * @param {object[]} servers
 * @param {object} [opts]
 * @returns {function(): *} - call to stop the monitor
 */
export default function (servers, opts = {}) {
  const m = monitor(servers, opts)

  m.on('data', data => {
    const {server, value, path, type} = data

    const name = server.name

    switch (type) {
      case 'cpuUsage':
        return console.log(`{${name}} CPU Usage: ${value}`)
      case 'swapUsedPercentage':
        return console.log(`{${name}} Swap Usage: ${value}`)
      case 'memoryUsedPercentage':
        return console.log(`{${name}} Memory Used Percentage: ${value}`)
      case 'averageLoad':
        return console.log(`{${name}} Average CPU Load: 1m: ${value["1"]}, 5m: ${value["5"]}, 15m: ${value["15"]}`)
      case 'percentageDiskSpaceUsed':
        return console.log(`{${name}} Disk space used for '${path}': ${value}`)
      default:
        throw new Error(`Log monitor doesnt know how to handle data type ${type}`)
    }
  })

  return m
}