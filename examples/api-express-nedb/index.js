import {start, monitors} from '../../src'

import child_process from 'child_process'

const privateKey = child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()

const servers = [
  {
    name: 'Operator Dev',
    ssh:  {
      host:     'operator-dev.barchick.com',
      username: 'root',
      privateKey,
    }
  },
  {
    name: 'Operator Prod',
    ssh:  {
      host:     'operator.barchick.com',
      username: 'root',
      privateKey,
    }
  },
  {
    name: 'Portal Dev',
    ssh:  {
      host:     'partner-dev.barchick.com',
      username: 'root',
      privateKey,
    }

  },
  {
    name: 'Portal Prod',
    ssh:  {
      host:     'partner.barchick.com',
      username: 'root',
      privateKey,
    },
  },
]

const monitor = monitors.nedb(servers)

const server = start(monitor)

const terminate = () => {
  server.close()
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)