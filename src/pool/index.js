/* @flow */

import genericPool, {Pool} from 'generic-pool'
import Client from 'ssh2'
import type {ServerDefinition} from '../types'
import {getLogger} from '../util/log'
import EventEmitter from 'events'
import type {SSH2Error} from '../types/index'

const log = getLogger('pool')

class SSHPool extends EventEmitter {
  genericPool: Pool
  server: ServerDefinition

  constructor (server: ServerDefinition) {
    super()
    this.server = server

    const factory = {
      create:  () => {
        return new Promise((resolve, reject) => {
          const client = new Client()

          // Client ready to be used
          client.once('ready', () => resolve(client))

          // Authentication was successful
          client.on('ready', () => {
            log.trace(`An SSH connection was created for ${this.server.ssh.host}`)
          })

          // An error occurred
          client.on('error', (err: SSH2Error) => {
            log.warn(`There was an error within an ssh connection for ${this.server.ssh.host}`, JSON.stringify(err))
          })

          // Connection closed
          client.on('end', (err: SSH2Error) => {
            log.info(`An ssh connection for ${this.server.ssh.host} has now ended.`, JSON.stringify(err))
          })

          // An error occurred
          client.on('close', (err: SSH2Error) => {
            log.info(`An ssh connection for ${this.server.ssh.host} has now ended.`, JSON.stringify(err))
          })

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
      max: 3,
      min: 1,
    }

    this.genericPool = genericPool.createPool(factory, opts)

    this.genericPool.on('factoryDestroyError', err => this.emit('factoryDestroyError', err))
    this.genericPool.on('factoryCreateError', err => this.emit('factoryCreateError', err))
  }

  acquire (): Promise<Client> {
    return this.genericPool.acquire()
  }

  release (client: Client): Promise<void> {
    return this.genericPool.release(client)
  }

  destroy (client: Client, reason?: string) {
    return this.genericPool.destroy(client)
  }

  drain (): Promise<void> {
    return this.genericPool.drain()
  }

  clear (): void {
    return this.genericPool.clear()
  }
}

export function constructPool (server: ServerDefinition) {
  return new SSHPool(server)
}
