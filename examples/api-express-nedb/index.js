import {start, monitors} from '../../src'
import {servers} from '../config'

const monitor = monitors.nedb(servers)

const server = start(monitor)

const terminate = () => {
  server.close()
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)