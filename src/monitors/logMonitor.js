/** @flow **/

/**
 * A super simple monitor that just logs all data events
 */

import Monitor from './monitor'
import type {MonitorOptions} from './monitor'
import type {ServerDefinition, Datum, ProcessDefinition} from '../types'

export default class LogMonitor extends Monitor {
  constructor (servers: ServerDefinition[], opts: MonitorOptions) {
    super(servers, opts)

    this.on('data', (data: Datum) => {
      const {server, value, type}             = data

      const path: ? string               = data.extra.path
      const process: ? ProcessDefinition = data.extra.process

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
          return console.log(`{${name}} Disk space used for '${path || ''}': ${value}`)
        case 'processInfo':
          return console.log(`Process info for ${name}: '${process ? process.name || process.id : ''}': ${JSON.stringify(process)}`)
        default:
          throw new Error(`Log monitor doesnt know how to handle data type ${type}`)
      }
    })
  }
}