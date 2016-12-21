import {monitors} from '../../src'

import {servers} from '../config'

const monitor = monitors.log(servers)

const terminate = () => {
  monitor.terminate()
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)