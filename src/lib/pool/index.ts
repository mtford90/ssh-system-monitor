import {Pool, createPool, Factory} from 'generic-pool'
import {Client} from 'ssh2'
import {EventEmitter} from 'events'
import {SSH2Error, ServerDefinition} from '../typedefs/data'
import {operation} from 'retry'
import * as _ from 'lodash'
import InternalLogging from '../internalLogging'

const log = InternalLogging.pool

export type SSHPoolOptions = {
  pool?: {
    min?: number,
    max?: number,
  },
  events?: {
    maxListeners?: number,
  },
}

type OngoingOperation = {
  promise: Promise<any>,
  desc: string,
}

export class SSHPool extends EventEmitter {
  genericPool: Pool<Client>
  server: ServerDefinition
  _currentOperations: {
    [id: number]: OngoingOperation
  } = {} // Keep track of current operations to ensure clean termination
  _terminated: boolean = false
  _numOperations: number = 0

  constructor(server: ServerDefinition, opts: SSHPoolOptions = {}) {
    super()
    this.server = server

    const factory: Factory<Client> = {
      create: (): Promise<Client> => {
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

          // Connection ended
          client.on('end', () => {
            log.trace(`An ssh connection for ${this.server.ssh.host} has now disconnected.`)
          })

          // Connection closed
          client.on('close', (hadError: boolean) => {
            if (hadError) {
              log.error(`An ssh connection for ${this.server.ssh.host} has now closed due to an error`)
            }
            else {
              log.trace(`An ssh connection for ${this.server.ssh.host} has now closed`)
            }
          })

          const ssh = server.ssh
          client.connect(ssh)
        })
      },
      destroy: (client: Client): Promise<void> => {
        return new Promise<void>(resolve => {
          client.once('end', () => resolve())
          client.end()
        })
      },
    }

    const poolOpts = {
      max: 3,
      min: 1,
      ...(opts.pool || {}),
    }

    this.genericPool = createPool<Client>(factory, poolOpts)

    this.genericPool.on('factoryDestroyError', err => this.emit('factoryDestroyError', err))
    this.genericPool.on('factoryCreateError', err => this.emit('factoryCreateError', err))

    // Avoid warnings on EventEmitter memory leaks
    if (opts.events && opts.events.maxListeners) {
      this.setMaxListeners(opts.events.maxListeners)
    }
    else {
      this.setMaxListeners(20)
    }
  }

  acquire(): Promise<Client> {
    if (!this._terminated) {
      return this.genericPool.acquire()
    }
    else {
      throw new Error(`Cannot acquire a resource when the pool is terminating or terminated`)
    }
  }

  release(client: Client): Promise<void> {
    return this.genericPool.release(client)
  }

  destroy(client: Client): Promise<void> {
    return this.genericPool.destroy(client)
  }

  async terminate() {
    log.debug(`
              Terminating
              pool ${this.server.ssh.host}`)
    this._terminated = true
    const operations: OngoingOperation[] = _.values<OngoingOperation>(this._currentOperations)

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

  acquireExecuteRelease(desc: string, fn: (client: Client) => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const host = this.server.ssh.host

      if (!this._terminated) {
        this._numOperations++

        const n = this._numOperations

        const retries = 10
        const op = operation();

        let client: Client
        let sshError: SSH2Error | null = null

        let attempt = 1

        const errorHandler = err => {
          if (sshError) {
            // Something went wrong with the SSH connection - we need to destroy the resource
            this.destroy(client).catch(destroyErr => {
              log.error(`Resource was rejected by the ${host} pool:\n`, destroyErr.stack)
            })
          }
          else if (err) {
            // Something went wrong with the command executed over SSH so we release the client
            // and then try again
            this.release(client).catch(err => {
              log.error(`Resource was rejected by the ${host} pool:\n`, err.stack)
            })
          }

          if (op.retry(sshError || err)) {
            sshError = null
            const _err = (sshError || err)

            log.warn(`Attempt ${attempt}/${retries} failed: retrying ${host}<${desc}>`, _err.stack ? _err.stack : err)
            attempt++
            return
          }

          const mainError = op.mainError()
          reject(mainError)
        }


        op.attempt(() => {
          if (!this._terminated) {
            this.acquire().then(_client => {
              client = _client

              const sshClientErrorListener = (err: SSH2Error) => {
                client.removeListener('error', sshClientErrorListener)
                sshError = err
              }

              client.on('error', sshClientErrorListener)
              const promise: Promise<any> = fn(client).then(res => {
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
          }
          else {
            reject(new Error(`Operation cancelled due to termination of pool`))
          }
        })
      }
      else {
        reject(new Error(`Pool for ${this.server.ssh.host} is terminated so cannot perform any more operations`))
      }
    })
  }
}

export function constructPool(server: ServerDefinition) : SSHPool {
  return new SSHPool(server)
}
