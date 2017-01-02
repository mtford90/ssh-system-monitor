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
  LoggerDatum,
} from '../types/index'
import {initLatestStats, receiveMonitorDatum} from '../util/data'
import DockerLogger from '../logging/dockerLogger'
import Logger from '../logging/logger'
import {SSHDataStore} from '../storage/DataStore'
import NEDBDataStore from '../storage/NEDBDataStore'
import {getLogger} from '../util/log'

const log = getLogger('Monitor')

export const ERROR_POOL_FACTORY_CREATE  = 'factoryCreateError'
export const ERROR_POOL_FACTORY_DESTROY = 'factoryDestroyError'

function asyncInterval (fn: Function, n: number = 10000): Function {
  let working = false

  const interval = setInterval(() => {
    if (!working) {
      working = true
      fn().then(x => {
        working = false
        return x
      }).catch(err => {
        working = false
        log.error(`Error in asyncInterval:`, err.stack)
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

    let _store = opts.store

    if (!_store) {
      _store = new NEDBDataStore()
    }

    this.opts = {
      rate:  opts.rate || 10000,
      store: _store
    }

    this.latest = initLatestStats(servers)
  }

// export function faultTolerantExecute (client: Client, cmd: string, timeout: number = 5000): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const operation = retry.operation({retries: 5, minTimeout: timeout, maxTimeout: timeout});
//
//     operation.attempt(() => {
//       execute(client, cmd).then((str: string) => {
//         resolve(str)
//       }).catch(err => {
//         if (operation.retry(err)) {
//           return
//         }
//
//         reject(operation.mainError())
//       })
//     })
//   })
// }

  acquireExecuteRelease (id: number, desc: string, fn: (client: Client) => Promise<*>): Promise<*> {
    const pool: SSHPool = this.pools[id]
    return pool.acquireExecuteRelease(desc, fn)
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
      const value                    = await this.acquireExecuteRelease(id, dataType, client => cmd(client))
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
  async _listenToStorage (): Promise<void> {
    const store = this.opts.store
    if (store) {
      log.debug(`Initialising store`)
      await store.init().then(() => {
        log.debug(`Initalised store`)

        this.on('data', (datum: MonitorDatum) => {
          store.storeMonitorDatum(datum).then(() => {
            log.debug('successfully stored monitor datum', datum)
          }).catch(err => {
            log.error('error storing monitor datum', err.stack)
          })
        })

        this.on('log', (datum: LoggerDatum) => {
          store.storeLoggerDatum(datum).then(() => {
            log.debug('successfully stored logger datum', datum)
          }).catch(err => {
            log.error('error storing log datum', err.stack)
          })
        })
      }).catch(err => {
        log.info('error initialising data store', err.stack)
      })
    }
  }

  _configureSSHPools () {
    _.forEach(this.servers, (server: ServerDefinition, idx: number) => {
      const pool      = constructPool(server)
      this.pools[idx] = pool

      pool.on(ERROR_POOL_FACTORY_CREATE, err => {
        const type = `pool:${ERROR_POOL_FACTORY_CREATE}`
        log.error(`${type}`, err.stack)
        this.emit('error', {type, err})
      })

      pool.on(ERROR_POOL_FACTORY_DESTROY, err => {
        const type = `pool:${ERROR_POOL_FACTORY_DESTROY}`
        log.error(`${type}`, err.stack)
        this.emit('error', {type, err})
      })
    })
  }

  _configureLatest () {
    this.servers.map((s: ServerDefinition) => {
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
  }

  _configureCommands () {
    _.forEach(this.servers, (server: ServerDefinition, idx: number) => {
      const paths: string[]                = (server.paths || [])
      const processes: ProcessDefinition[] = (server.processes || [])

      const _intervals = [
        this.simpleCommandInterval(idx, 'cpuUsage'),
        this.simpleCommandInterval(idx, 'swapUsedPercentage'),
        this.simpleCommandInterval(idx, 'memoryUsedPercentage'),
        this.simpleCommandInterval(idx, 'averageLoad'),
        ...paths.map(path => {
          return asyncInterval(async () => {
            const value: number = (await this.acquireExecuteRelease(idx, `percentageDiskSpaceUsed(${path})`, client => system.percentageDiskSpaceUsed(client, path)))

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
            const value: ProcessInfo = await this.acquireExecuteRelease(idx, `processInfo(${p.id})`, client => process.info(client, p.grep))

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

      this.intervals[idx] = _intervals
    })
  }

  _configureLoggers (): Promise<*> {
    const loggerPromises: Promise<*>[] = []
    _.forEach(this.servers, (server: ServerDefinition, idx: number) => {
      const logs: LogDefinition[] = server.logs || []

      const _loggers = logs.map((l: LogDefinition) => {
        const loggerIdentifier = `${server.name}.${l.name}`
        log.debug(`Starting logger ${loggerIdentifier}`)
        const type = l.type
        switch (type) {
          case 'command': {
            const logger = new Logger({
              serverDefinition: server,
              logDefinition:    l,
              cmd:              l.grep
            })
            logger.on('data', (datum: LoggerDatum) => this.emitLogData(datum))
            loggerPromises.push(
              logger.start().then(() => {
                log.debug(
                  `Started logger ${loggerIdentifier}`
                )
              }).catch(err => {
                log.error(
                  `Unable to start logger ${loggerIdentifier}`,
                  err.stack
                )
              })
            )
            return logger
          }
          case 'docker': {
            const logger = new DockerLogger({
              serverDefinition: server,
              logDefinition:    l,
            })
            logger.on('data', (datum: LoggerDatum) => this.emitLogData(datum))

            loggerPromises.push(
              logger.start().then(() => {
                log.debug(
                  `Started logger ${loggerIdentifier}`
                )
              }).catch(err => {
                log.error(
                  `Unable to start logger ${loggerIdentifier}`,
                  err.stack
                )
              })
            )

            return logger
          }
          default:
            throw new Error(`Unknown log type ${type}`)
        }
      })

      this.loggers[idx] = _loggers
    })
    // Wait for the loggers to startup
    log.debug(`Waiting for ${loggerPromises.length} loggers to startup`)


    log.debug(`All ${loggerPromises.length} loggers have started up`)

    log.debug(`Wait for data store to startup`)

    return Promise.all(loggerPromises)

  }

  async start (): Promise<*> {
    log.debug(`Monitor starting up - monitoring ${_.keys(this.servers).length} servers`)

    this._configureLatest()
    this._configureSSHPools()
    this._configureCommands()

    await Promise.all([
      this._configureLoggers(),
      this._listenToStorage()
    ])

    log.debug(`Monitor has finished starting up - monitoring ${_.keys(this.servers).length} servers`)
  }

  async terminate (): Promise<void> {
    log.info('Terminating Monitor')

    log.debug('Ensuring that startup finished before terminating')

    this.removeAllListeners('data')

    log.debug('Removed all listeners')
    _.flatten(_.values(this.intervals)).forEach((fn: Function) => fn())
    log.debug('Cleared intervals')

    const pools    = this.pools
    const numPools = _.keys(pools).length

    const loggers    = _.chain(this.loggers).values().flatten().compact().value()
    const numLoggers = loggers.length

    await Promise.all([
      ..._.values(pools).map((pool: Pool, idx: number) => {
        log.debug(`Terminating pool ${idx + 1}/${numPools}`)
        return pool.terminate().then(() => {
          log.debug(`Terminated pool ${idx + 1}/${numPools}`)
        }).catch(err => {
          log.error(`Unable to terminate pool ${idx + 1}`, err.stack)
        })
      }),
      ...loggers.map((l: Logger, idx: number) => {
        const logDefinition: LogDefinition = l.opts.logDefinition
        log.debug(`Terminating logger ${idx + 1}/${numLoggers}`)
        return l.terminate().then(() => {
          log.debug(`Terminated logger ${idx + 1}/${numLoggers}`)
        }).catch(err => {
          log.debug(`Unable to terminate logger ${idx + 1} ${logDefinition.name}`, err.stack)
        })
      })
    ])
    log.info('Terminated monitor')
  }
}
