/* @flow */

import Monitor from '../../src/lib/monitors/monitor'
import start from '../../src/server/server.babel'
import child_process from 'child_process'

const privateKey = child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()

const monitor = new Monitor([
  {
    name:      'Operator Dev',
    ssh:       {
      host:     'operator-dev.barchick.com',
      username: 'root',
      privateKey,
    },
    paths:     [
      '/'
    ],
    processes: [
      {
        grep: 'node /app/src/push.js',
        id:   'push',
        name: 'Push Service'
      },
      {
        grep: 'node /app/src/paying.js',
        id:   'paying',
        name: 'Paying Service'
      },
    ],
    logs:      [
      {
        grep: 'services.push.1',
        type: 'docker',
        name: '[DEV] services.push',
      },
      {
        grep: 'services.indexer.1',
        type: 'docker',
        name: '[DEV] services.indexer',
      },
    ]
  }
])

let server

monitor.start().then(() => {
  server = start(monitor)

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
})

