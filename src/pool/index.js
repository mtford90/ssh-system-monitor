/* @flow */

import genericPool, {Pool} from 'generic-pool'
import Client from 'ssh2'
import type {ServerDefinition} from '../types'
import {getLogger} from '../util/log'
import EventEmitter from 'events'
import type {SSH2Error} from '../types/index'
import retry from 'retry'
import _ from 'lodash'

const log = getLogger('pool')

class SSHPool extends EventEmitter {
  genericPool: Pool
  server: ServerDefinition
  _currentOperations: {
    [id:number]: {
      promise: Promise<*>,
      desc: string,
    }
  }                      = {} // Keep track of current operations to ensure clean termination
  _terminated: boolean   = false
  _numOperations: number = 0

  constructor (server: ServerDefinition) {
    super()
    this.server = server

    const factory = {
      create:  () => {
        return new Promise((resolve, reject) => {
          const client = new Client()

          const rejectListener = (err: SSH2Error) => {
            client.removeListener('error', rejectListener)
            reject(err)
          }

          // Client ready to be used
          client.once('ready', () => {
            client.removeListener('error', rejectListener)
            resolve(client)
          })

          // Client failed to connect...
          client.on('error', rejectListener)

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
        return new Promise(resolve => {
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
    if (!this._terminated) {
      return this.genericPool.acquire()
    }
    else {
      throw new Error(`Cannot acquire a resource when the pool is terminating or terminated`)
    }
  }

  release (client: Client): Promise<void> {
    const host = client.config.host
    return this.genericPool.release(client)
  }

  destroy (client: Client): Promise<void> {
    return this.genericPool.destroy(client)
  }

  async drain (): Promise<void> {
    await Promise.all(this._currentOperations)
    await this.genericPool.drain()
  }

  clear (): void {
    return this.genericPool.clear()
  }

  async terminate () {
    log.debug(`Terminating pool ${this.server.ssh.host}`)
    this._terminated = true
    const operations = _.values(this._currentOperations)

    log.debug(`Waiting for ${operations.length} operations to finish before terminating pool ${this.server.ssh.host}`)

    for (let i = 0; i < operations.length; i++) {
      const {promise, desc} = operations[i]

      log.debug(`Waiting for operation ${this.server.ssh.host}.${desc}`)
      await promise
      log.debug(`Finished operation ${this.server.ssh.host}.${desc}`)
    }

    log.debug(`${operations.length} operations have finished`)
    log.debug(`Draining pool ${this.server.ssh.host}`)
    await this.genericPool.drain()
    log.debug(`Drained pool ${this.server.ssh.host}`)
    this.genericPool.clear()
    log.info(`Terminated pool ${this.server.ssh.host}`)
  }

  acquireExecuteRelease (desc: string, fn: (client: Client) => Promise<*>): Promise<*> {
    return new Promise((resolve, reject) => {
      if (!this._terminated) {
        this._numOperations++

        const n = this._numOperations

        const operation = retry.operation();

        let client: Client
        let sshError: SSH2Error | null = null

        const errorHandler = err => {
          if (sshError) {
            // Something went wrong with the SSH connection - we need to destroy the resource
            this.destroy(client).catch(destroyErr => {
              log.error(`Resource was rejected by the ${this.server.ssh.host} pool:\n`, destroyErr.stack)
            })
            log.warn(`There was an ssh error`, err)
          }
          else if (err) {
            log.error(`fuck`, err.stack)
            // Something went wrong with the command executed over SSH so we release the client
            // and then try again
            this.release(client).catch(err => {
              log.error(`Resource was rejected by the ${this.server.ssh.host} pool:\n`, err.stack)
            })
          }

          if (operation.retry(sshError || err)) {
            sshError = null
            return
          }

          const mainError = operation.mainError()
          reject(mainError)
        }

        operation.attempt(() => {
          this.acquire().then(_client => {
            client = _client

            const sshClientErrorListener = (err: SSH2Error) => {
              client.off('error', sshClientErrorListener)
              sshError = err
            }

            client.on('error', sshClientErrorListener)
            const promise              = fn(client).then(res => {
              this.release(client).catch(err => {
                log.error(`Resource was rejected by the ${this.server.ssh.host} pool:\n`, err.stack)
              })
              delete this._currentOperations[n]
              resolve(res)
              return res
            }).catch(err => {
              errorHandler(err)
              delete this._currentOperations[n]
              return null
            })
            this._currentOperations[n] = {
              promise,
              desc,
            }
          }).catch(errorHandler)
        })
      }
      else {
        reject(new Error(`Pool for ${this.server.ssh.host} is terminated so cannot perform any more operations`))
      }
    })
  }
}

export function constructPool (server: ServerDefinition) {
  return new SSHPool(server)
}
