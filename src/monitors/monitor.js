/* @flow */

import _ from 'lodash'
import {constructPool} from '../pool'
import * as system from '../platforms/linux/system'
import * as process from '../platforms/linux/process'
import EventEmitter from 'events'
import {Pool} from 'generic-pool'
import Client from 'ssh2'
import type {ServerDefinition, MonitorDatum, ProcessDefinition, HostStatsCollection, ProcessInfo} from '../types'
import {cleanServer, initLatestStats} from '../util/data'

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

export type MonitorOptions = {
  rate?: number,
}

export default class Monitor extends EventEmitter {
  opts: MonitorOptions
  servers: ServerDefinition[]
  pools: {[id:number]: Pool}           = {}
  latest: {[host:string]: HostStatsCollection} = {}
  intervals: {[id:number]: Function[]} = {}

  constructor (servers: ServerDefinition[], opts?: MonitorOptions = {}) {
    super()
    this.servers = servers
    this.opts    = {
      rate: 10000,
      ...opts,
    }

    this.latest = initLatestStats(servers)

    this._start()
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

  // TODO: Can't be doing this
  simpleCommandInterval (id: number, type: 'cpuUsage' | 'swapUsedPercentage' | 'memoryUsedPercentage' | 'averageLoad'): Function {
    return asyncInterval(async () => {
      const cmd: Function            = system[type]
      const server: ServerDefinition = this.servers[id]
      const value                    = await this._acquireAndReleaseClient(id, client => cmd(client))

      this.latest[server.ssh.host][type] = value
      this.emitData({
        type,
        server:    cleanServer(server),
        value,
        extra:     {},
        timestamp: Date.now()
      })
    }, this.opts.rate)
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

            this.latest[server.ssh.host].percentageDiskSpaceUsed[path] = value

            this.emitData({
              type:      'percentageDiskSpaceUsed',
              server,
              value,
              extra:     {
                path,
              },
              timestamp: Date.now()
            })

          }, this.opts.rate)
        }),
        ...processes.map((p: ProcessDefinition) => {
          return asyncInterval(async () => {
            const host               = server.ssh.host
            const value: ProcessInfo = await this._acquireAndReleaseClient(idx, client => process.info(client, p.grep))

            this.latest[host].processInfo[p.id] = value

            this.emitData({
              type:      'processInfo',
              server,
              value,
              extra:     {
                process: p
              },
              timestamp: Date.now()
            })
          }, this.opts.rate)
        })
      ]

      this.intervals[idx] = _intervals
    })

  }

  async terminate (): Promise<void> {
    this.removeAllListeners('data')
    _.flatten(_.values(this.intervals)).forEach((fn: Function) => fn())

    const pools = this.pools

    // Wait for all pools to drain
    await Promise.all(
      _.values(pools).map((pool: Pool) => {
        return pool.drain().then(() => {
          pool.clear()
        })
      })
    )
  }
}
