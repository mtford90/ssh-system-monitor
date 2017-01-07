/* @flow */

import Monitor from '../../src/lib/monitors/monitor'
import start from '../../src/server/index'
import * as child_process from 'child_process'

const privateKey = child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()

const monitor = new Monitor([
  {
    name:      'Operator Prod',
    ssh:       {
      host:     'operator.barchick.com',
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
        grep: 'services.paying.1',
        type: 'docker',
        name: 'services.paying',
      },
      {
        grep: 'services.campaignMonitor.1',
        type: 'docker',
        name: 'services.campaignMonitor',
      },
      {
        grep: 'services.bookingslackbot.1',
        type: 'docker',
        name: 'services.bookingslackbot',
      },
      {
        grep: 'services.rethink.1',
        type: 'docker',
        name: 'services.rethink',
      },
      {
        grep: 'services.welcome.1',
        type: 'docker',
        name: 'services.welcome',
      },
      {
        grep: 'services.away.1',
        type: 'docker',
        name: 'services.away',
      },
      {
        grep: 'services.pushbookings.1',
        type: 'docker',
        name: 'services.pushbookings',
      },
      {
        grep: 'services.adminunread.1',
        type: 'docker',
        name: 'services.adminunread',
      },
      {
        grep: 'services.indexer.1',
        type: 'docker',
        name: 'services.indexer',
      },
      {
        grep: 'services.push.1',
        type: 'docker',
        name: 'services.push',
      },
      {
        grep: 'services.slackbot.1',
        type: 'docker',
        name: 'services.slackbot',
      }
    ]
  },
  {
    name: 'Operator Dev',
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
    logs: [
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

