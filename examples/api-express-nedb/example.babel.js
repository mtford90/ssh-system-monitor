/* @flow */

import NEDBMonitor from '../../src/monitors/nedbMonitor'
import start from '../../src/server/server.babel'
import {servers} from '../config'

const monitor = new NEDBMonitor(servers)

const server = start(monitor)

const terminate = () => {
  server.close()
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)