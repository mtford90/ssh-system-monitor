/* @flow */

import Monitor from '../../src/monitors/monitor'
import start from '../../src/server/server.babel'
import {servers} from '../config'

const monitor = new Monitor(servers)

const server = start(monitor)

const terminate = () => {
  console.log('terminating monitor')
  monitor.terminate().then(() => {
    console.log('terminated monitor, now terminating server')
    server.close()
    process.exit(0)
  }).catch(err => {
    console.log('error terminating the monitor', err.stack)
    console.log('terminating server anyway & shutting down ungracefully')
    server.close()
    process.exit(1)
  })
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)