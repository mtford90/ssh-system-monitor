/* @flow */

import genericPool from 'generic-pool'
import Client from 'ssh2'
import type {Server} from './types'

export function constructPool (server: Server) {
  const factory = {
    create:  () => {
      return new Promise((resolve, reject) => {
        const client = new Client()
        client.once('ready', () => resolve(client))
        const ssh = server.ssh
        client.connect(ssh)
      })
    },
    destroy: client => {
      return new Promise((resolve, reject) => {
        client.once('end', () => resolve())
        client.end()
      })
    },
  }

  const opts = {
    max: 10,
    min: 1,
  }

  const pool = genericPool.createPool(factory, opts)

  return pool
}
