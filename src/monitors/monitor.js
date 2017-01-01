/* @flow */

import _ from 'lodash'
import {constructPool} from '../pool'
import * as system from '../platforms/linux/system'
import * as process from '../platforms/linux/process'
import EventEmitter from 'events'
import {Pool} from 'generic-pool'
import Client from 'ssh2'
import type {
  ServerDefinition,
  MonitorDatum,
  ProcessDefinition,
  HostStatsCollection,
  ProcessInfo,
  SimpleDataType,
  LogDefinition,
  LoggerDatum
} from '../types/index'
import {initLatestStats, receiveMonitorDatum} from '../util/data'
import DockerLogger from '../logging/dockerLogger'
import Logger from '../logging/logger'
import {SSHDataStore} from '../storage/DataStore'
import NEDBDataStore from '../storage/NEDBDataStore'

export const ERROR_POOL_FACTORY_CREATE  = 'factoryCreateError'
export const ERROR_POOL_FACTORY_DESTROY = 'factoryDestroyError'

function asyncInterval (fn: Function, n: number = 10000): Function {
  let working = false

  const interval = setInterval(() => {
    if (!working) {
      working = true
      fn().then(() => {
        working = false
      }).catch(err => {
        working = false
        // TODO: These errors happen occasionally but should be optional to silence them
        console.log(`Error in asyncInterval:\n`, err.stack)
      })
    }
  }, n)

  return () => clearInterval(interval)
}


/**
 * This is for testing purposes - allows use of async/await for cleaner tests.
 *
 * Might be useful in other scenarios too though... who knows
 */
function waitForDatum (
  monitor: Monitor,
  event: string,
  check: (datum: *) => boolean = () => true
): Promise<*> {
  return new Promise(resolve => {
    const listener = (datum: *) => {
      if (check(datum)) {
        monitor.removeListener(event, listener)
        resolve(datum)
      }
    }
    monitor.on(event, listener)
  })
}

export function waitForMonitorDatum (
  monitor: Monitor,
  check: (datum: MonitorDatum) => boolean = () => true
): Promise<MonitorDatum> {
  return waitForDatum(
    monitor,
    'data',
    check,
  )
}

export function waitForLoggerDatum (
  monitor: Monitor,
  check: (datum: LoggerDatum) => boolean = () => true
): Promise<LoggerDatum> {
  return waitForDatum(
    monitor,
    'log',
    check,
  )
}

export default class Monitor extends EventEmitter {
  opts: {
    rate: number,
    store: SSHDataStore,
  }
  servers: ServerDefinition[]
  pools: {[id:number]: Pool}                   = {}
  latest: {[host:string]: HostStatsCollection} = {}
  intervals: {[id:number]: Function[]}         = {}
  loggers: {[id:number]: Logger[]}             = {}

  constructor (
    servers: ServerDefinition[],
    opts?: {
      rate?: number,
      store?: SSHDataStore,
    } = {}
  )
  {
    super()
    this.servers = servers

    this.opts = {
      rate:  opts.rate || 10000,
      store: opts.store || new NEDBDataStore() // in memory data store by default
    }

    this.latest = initLatestStats(servers)

    this._start()

    this._listenToStorage()
  }

  async _acquireAndReleaseClient (id: number, fn: (client: Client) => Promise<any>): any {
    const pool   = this.pools[id]
    const client = await pool.acquire()
    const res    = await fn(client)
    pool.release(client)
    return res
  }

  emitData (datum: MonitorDatum) {
    this.emit('data', datum)
  }

  emitLogData (logDatum: LoggerDatum) {
    this.emit('log', logDatum)
  }

  // TODO: Can't be doing this
  simpleCommandInterval (id: number, dataType: SimpleDataType): Function {
    return asyncInterval(async () => {
      const cmd: Function            = system[dataType]
      const value                    = await this._acquireAndReleaseClient(id, client => cmd(client))
      const server: ServerDefinition = this.servers[id]

      const datum: MonitorDatum = {
        type:      dataType,
        server,
        value,
        extra:     {},
        timestamp: Date.now()
      }

      this.latest = receiveMonitorDatum(this.latest, datum)
      this.emitData(datum)
    }, this.opts.rate)
  }

  /**
   * If a store was provided, store all data!
   * @private
   */
  _listenToStorage () {
    const store = this.opts.store
    if (store) {
      store.init().then(() => {
        // TODO: debug logs
        this.on('data', (datum: MonitorDatum) => {
          store.storeMonitorDatum(datum).then(() => {
            // TODO: debug logs
            console.log('successfully stored monitor datum', datum)
          }).catch(err => {
            console.log('error storing monitor datum', err.stack)
          })
        })

        this.on('log', (datum: LoggerDatum) => {
          store.storeLoggerDatum(datum).then(() => {
            // TODO: debug logs
            console.log('successfully stored logger datum', datum)
          }).catch(err => {
            console.log('error storing log datum', err.stack)
          })
        })
      }).catch(err => {
        console.log('error initialising data store', err.stack)
      })
    }
  }

  _start () {
    const servers = this.servers
    servers.map((s: ServerDefinition) => {
      const paths         = s.paths || []
      const host          = s.ssh.host
      const latest        = this.latest[host]
      const diskSpaceUsed = {}

      paths.forEach(path => {
        diskSpaceUsed[path] = null
      })

      latest.percentageDiskSpaceUsed = diskSpaceUsed
      this.latest[host]              = latest
    })

    _.forEach(servers, (server: ServerDefinition, idx: number) => {
      const pool      = constructPool(server)
      this.pools[idx] = pool

      pool.on(ERROR_POOL_FACTORY_CREATE, err => {
        const type = `pool:${ERROR_POOL_FACTORY_CREATE}`
        console.log(`Error ${type}`, err.stack)
        this.emit('error', {type, err})
      })

      pool.on(ERROR_POOL_FACTORY_DESTROY, err => {
        const type = `pool:${ERROR_POOL_FACTORY_DESTROY}`
        console.log(`Error ${type}`, err.stack)
        this.emit('error', {type, err})
      })

      const paths: string[]                = (server.paths || [])
      const processes: ProcessDefinition[] = (server.processes || [])

      const _intervals = [
        this.simpleCommandInterval(idx, 'cpuUsage'),
        this.simpleCommandInterval(idx, 'swapUsedPercentage'),
        this.simpleCommandInterval(idx, 'memoryUsedPercentage'),
        this.simpleCommandInterval(idx, 'averageLoad'),
        ...paths.map(path => {
          return asyncInterval(async () => {
            const value: number = (await this._acquireAndReleaseClient(idx, client => system.percentageDiskSpaceUsed(client, path)))

            const datum: MonitorDatum = {
              type:      'percentageDiskSpaceUsed',
              server,
              value,
              extra:     {
                path,
              },
              timestamp: Date.now()
            }

            this.latest = receiveMonitorDatum(this.latest, datum)
            this.emitData(datum)

          }, this.opts.rate)
        }),
        ...processes.map((p: ProcessDefinition) => {
          return asyncInterval(async () => {
            const value: ProcessInfo = await this._acquireAndReleaseClient(idx, client => process.info(client, p.grep))

            const datum: MonitorDatum = {
              type:      'processInfo',
              server,
              value,
              extra:     {
                process: p
              },
              timestamp: Date.now()
            }

            this.latest = receiveMonitorDatum(this.latest, datum)
            this.emitData(datum)
          }, this.opts.rate)
        })
      ]

      const logs: LogDefinition[] = server.logs || []

      const _loggers = logs.map((l: LogDefinition) => {
        const loggerIdentifier = `${server.name}.${l.name}`
        console.log(`Starting logger ${loggerIdentifier}`)
        const type = l.type
        switch (type) {
          case 'command': {
            const logger = new Logger({
              serverDefinition: server,
              logDefinition:    l,
              cmd:              l.grep
            })
            logger.on('data', (datum: LoggerDatum) => this.emitLogData(datum))
            logger.start().then(() => {
              console.log(
                `Started logger ${loggerIdentifier}`
              )
            }).catch(err => {
              console.log(
                `Unable to start logger ${loggerIdentifier}`,
                err.stack
              )
            })
            return logger
          }
          case 'docker': {
            const logger = new DockerLogger({
              serverDefinition: server,
              logDefinition:    l,
            })
            logger.on('data', (datum: LoggerDatum) => this.emitLogData(datum))
            logger.start().then(() => {
              console.log(
                `Started logger ${loggerIdentifier}`
              )
            }).catch(err => {
              console.log(
                `Unable to start logger ${loggerIdentifier}`,
                err.stack
              )
            })
            return logger
          }
          default:
            throw new Error(`Unknown log type ${type}`)
        }
      })

      this.loggers[idx]   = _loggers
      this.intervals[idx] = _intervals
    })
  }

  async terminate (): Promise<void> {
    this.removeAllListeners('data')
    _.flatten(_.values(this.intervals)).forEach((fn: Function) => fn())

    const pools = this.pools

    // Wait for all pools to drain
    await Promise.all([
      ..._.values(pools).map((pool: Pool) => {
        return pool.drain().then(() => {
          pool.clear()
        })
      }),
      ..._.chain(this.loggers).values().flatten().map((l: Logger) => {
        return l.terminate()
      }).value()
    ])
  }
}
