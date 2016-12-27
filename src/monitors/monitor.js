/* @flow */

import _ from 'lodash'
import {constructPool} from '../pool'
import * as system from '../platforms/linux/system'
import EventEmitter from 'events'
import {Pool} from 'generic-pool'
import Client from 'ssh2'
import type {Server, Stat} from '../types'
import {cleanServer} from '../util/data'
import type {AverageLoad} from '../platforms/linux/system'

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
  servers: Server[]
  pools: {[id:number]: Pool}           = {}
  latest: {
    [host:string]: {
      cpuUsage?: number,
      swapUsedPercentage?: number,
      memoryUsedPercentage?: number,
      averageLoad?: AverageLoad,
      percentageDiskSpaceUsed?: {
        [path:string]: number
      },
    }
  }                                    = {}
  intervals: {[id:number]: Function[]} = {}

  constructor (servers: Server[], opts?: MonitorOptions = {}) {
    super()
    this.servers = servers
    this.opts    = {
      rate: 10000,
      ...opts,
    }

    this._start()
  }

  async _acquireAndReleaseClient (id: number, fn: (client: Client) => Promise<any>): any {
    const pool   = this.pools[id]
    const client = await pool.acquire()
    const res    = await fn(client)
    pool.release(client)
    return res
  }

  simpleCommandInterval (id: number, type: Stat): Function {
    return asyncInterval(async () => {
      const cmd: Function  = system[type]
      const server: Server = this.servers[id]
      const value          = await this._acquireAndReleaseClient(id, client => cmd(client))

      this.latest[server.ssh.host][type] = value

      this.emit('data', {type, server: cleanServer(server), value})
    }, this.opts.rate)
  }

  _start () {
    const servers = this.servers
    servers.map((s: Server) => {
      const paths         = s.paths || []
      const latest        = {}
      const diskSpaceUsed = {}

      paths.forEach(path => {
        diskSpaceUsed[path] = null
      })

      latest.percentageDiskSpaceUsed = diskSpaceUsed
      this.latest[s.ssh.host]        = latest
    })

    _.forEach(servers, (server: Server, idx: number) => {
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

      const paths = (server.paths || [])

      const _intervals = [
        this.simpleCommandInterval(idx, 'cpuUsage'),
        this.simpleCommandInterval(idx, 'swapUsedPercentage'),
        this.simpleCommandInterval(idx, 'memoryUsedPercentage'),
        this.simpleCommandInterval(idx, 'averageLoad'),
        ...paths.map(path => {
          return asyncInterval(async () => {
            const type = 'percentageDiskSpaceUsed'

            const value = await this._acquireAndReleaseClient(idx, client => system.percentageDiskSpaceUsed(client, path))

            if (server.ssh && server.ssh.host) {
              this.latest[server.ssh.host][type][path] = value
            }

            this.emit('data', {
              type,
              server: cleanServer(server),
              value,
              path,
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
