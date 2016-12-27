/* @flow */

import child_process from 'child_process'

const privateKey = child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()

import type {Server} from '../src/types'

export const servers: Server[] = [
  {
    name:  'Operator Dev',
    ssh:   {
      host:     'operator-dev.barchick.com',
      username: 'root',
      privateKey,
    },
    paths: [
      '/'
    ]
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