/* @flow */

import child_process from 'child_process'

const privateKey = child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()

import type {ServerDefinition, ProcessDefinition} from '../src/types'

const operatorProcesses: ProcessDefinition[] = [
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
]

export const servers: ServerDefinition[] = [
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
    processes: operatorProcesses
  },
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
    processes: operatorProcesses
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