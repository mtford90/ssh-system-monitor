import _ from 'lodash'
import {constructPool} from '../pool'
import * as commands from '../commands/index'
import EventEmitter from 'events'

import {
  CpuUsage,
  SwapUsed,
  MemoryUsed,
  AverageLoad,
  DiskSpaceUsed
} from '../commands/constants'
import {cleanServer} from '../util/data'

export const ERROR_POOL_FACTORY_CREATE  = 'factoryCreateError'
export const ERROR_POOL_FACTORY_DESTROY = 'factoryDestroyError'


/**
 * Wraps setInterval ensuring that the function doesn't trigger if
 * the previous iteration hasn't finished executing (async)
 *
 * @param {function} fn
 * @param {number} [n] - rate in ms. Defaults to 10000ms (10s)
 * @returns {function(): *}
 */
function asyncInterval (fn, n = 10000) {
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
 * @param {object[]} servers
 * @param {object} [opts]
 * @param {number} [opts.rate] - rate in ms. Defaults to 10000ms (10s)
 */
export function monitor (servers, opts = {}) {
  const pools     = {}
  const intervals = {}
  const emitter   = new EventEmitter()

  emitter.latest = {}

  servers.forEach(s => {
    if (s.ssh && s.ssh.host) {
      const paths         = s.paths || []
      const latest        = {}
      const diskSpaceUsed = {}

      paths.forEach(path => {
        diskSpaceUsed[path] = null
      })

      latest[DiskSpaceUsed] = diskSpaceUsed
      emitter.latest[s.ssh.host]                 = latest
    }
  })

  opts = {
    rate: 10000,
    ...opts,
  }

  _.forEach(servers, (server, idx) => {
    const pool = constructPool(server)

    pool.on(ERROR_POOL_FACTORY_CREATE, err => {
      const type = `pool:${ERROR_POOL_FACTORY_CREATE}`
      console.log(`Error ${type}`, err.stack)
      emitter.emit('error', {type, err})
    })

    pool.on(ERROR_POOL_FACTORY_DESTROY, err => {
      const type = `pool:${ERROR_POOL_FACTORY_DESTROY}`
      console.log(`Error ${type}`, err.stack)
      emitter.emit('error', {type, err})
    })

    pools[idx] = pool

    const acquireAndReleaseClient = async (fn) => {
      const client = await pool.acquire()
      const res    = await fn(client)
      pool.release(client)
      return res
    }

    const simpleCommandInterval = function (type) {
      return asyncInterval(async () => {
        const cmd   = commands[type]
        const value = await acquireAndReleaseClient(client => cmd(client))
        // Store the latest values
        if (server.ssh && server.ssh.host) emitter.latest[server.ssh.host][type] = value

        emitter.emit('data', {type, server: cleanServer(server), value})
      }, opts.rate)
    }

    const paths = (server.paths || [])

    const _intervals = [
      simpleCommandInterval(CpuUsage),
      simpleCommandInterval(SwapUsed),
      simpleCommandInterval(MemoryUsed),
      simpleCommandInterval(AverageLoad),
      ...paths.map(path => {
        return asyncInterval(async () => {
          const type = DiskSpaceUsed

          const value = await acquireAndReleaseClient(client => commands.percentageDiskSpaceUsed(client, path))

          if (server.ssh && server.ssh.host) {
            emitter.latest[server.ssh.host][type][path] = value
          }

          emitter.emit('data', {
            type,
            server: cleanServer(server),
            value,
            path,
          })
        }, opts.rate)
      })
    ]

    intervals[idx] = _intervals
  })

  emitter.terminate = async () => {
    emitter.removeAllListeners('data')
    _.flatten(_.values(intervals)).forEach(fn => fn())

    // Wait for all pools to drain
    await Promise.all(
      _.values(pools).map(pool => {
        return pool.drain().then(() => {
          pool.clear()
        })
      })
    )
  }

  emitter.servers = servers

  return emitter
}

