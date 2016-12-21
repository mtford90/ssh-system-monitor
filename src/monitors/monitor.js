import _ from 'lodash'
import {constructPool} from '../pool'
import * as commands from '../commands'
import EventEmitter from 'events'

const ERROR_POOL_FACTORY_CREATE  = 'factoryCreateError'
const ERROR_POOL_FACTORY_DESTROY = 'factoryDestroyError'

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
 * Remove any properties from server config that should never be in the logs e.g. private key
 * @param server
 */
function cleanServer (server) {
  server    = {...server}
  const ssh = {...server.ssh}
  if (ssh) delete ssh.privateKey
  server.ssh = ssh
  return server
}


/**
 * @param {object[]} servers
 * @param {object} [opts]
 */
export function monitor (servers, opts = {}) {
  const pools     = {}
  const intervals = {}
  const emitter   = new EventEmitter()

  emitter.latest = {}

  servers.forEach(s => {
    if (s.ssh && s.ssh.host) {
      emitter.latest[s.ssh.host] = {}
    }
  })

  opts = {
    rate: 1000,
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

    const applyOnInterval = function (type, ...args) {
      return asyncInterval(async () => {
        const client = await pool.acquire()
        const fn     = commands[type]
        const value  = await fn.apply(fn, [client, ...args])
        pool.release(client)

        // Store the latest values
        if (server.ssh && server.ssh.host) emitter.latest[server.ssh.host][type] = value

        emitter.emit('data', {type, server: cleanServer(server), value})
      }, opts.rate)
    }

    const _intervals = [
      applyOnInterval('cpuUsage'),
      applyOnInterval('swapUsedPercentage'),
      applyOnInterval('memoryUsedPercentage'),
      applyOnInterval('averageLoad'),
      applyOnInterval('percentageDiskSpaceUsed', '/'),
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

  return emitter
}

