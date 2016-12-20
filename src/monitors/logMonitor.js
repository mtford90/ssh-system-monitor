import _ from 'lodash'
import {constructPool} from '../pool'
import * as commands from '../commands'

/**
 * Wraps setInterval ensuring that the function doesn't trigger if
 * the previous iteration hasn't finished executing (async)
 *
 * @param {function} fn
 * @param {number} [n]
 * @returns {function(): *}
 */
function asyncInterval (fn, n = 1000) {
  let working = false

  const interval = setInterval(() => {
    if (!working) {
      working = true
      fn().then(() => {
        working = false
      }).catch(err => {
        working = false
        // TODO: Log error properly
        console.log(`Error in asyncInterval:\n`, err.stack)
      })
    }
  }, n)

  return () => clearInterval(interval)
}

/**
 * @param {object[]} servers
 * @param {object} [opts]
 * @returns {function(): *} - call to stop the monitor
 */
export function monitor (servers, opts = {}) {
  const pools     = {}
  const intervals = {}

  opts = {
    rate: 1000,
    ...opts,
  }

  _.forEach(servers, (server, idx) => {
    const name = server.name
    const pool = constructPool(server)
    pools[idx] = pool

    const _intervals = [
      asyncInterval(async () => {
        const client = await pool.acquire()
        const val    = await commands.cpuUsage(client)
        pool.release(client)
        console.log(`{${name}} CPU Usage: ${val}`)
      }, opts.rate),

      asyncInterval(async () => {
        const client = await pool.acquire()
        const val    = await commands.swapUsedPercentage(client)
        pool.release(client)
        console.log(`{${name}} Swap Usage: ${val}`)
      }, opts.rate),

      asyncInterval(async () => {
        const client = await pool.acquire()
        const val    = await commands.memoryUsedPercentage(client)
        pool.release(client)
        console.log(`{${name}} Memory Usage: ${val}`)
      }, opts.rate),

      asyncInterval(async () => {
        const client = await pool.acquire()
        const val    = await commands.averageLoad(client)
        pool.release(client)
        console.log(`{${name}} Average CPU Load: 1m: ${val["1"]}, 5m: ${val["5"]}, 15m: ${val["15"]}`)
      }, opts.rate),

      asyncInterval(async () => {
        const client = await pool.acquire()
        const val    = await commands.percentageDiskSpaceUsed(client, '/')
        pool.release(client)
        console.log(`{${name}} Disk space used for '/': ${val}`)
      }, opts.rate),
    ]

    intervals[idx] = _intervals
  })

  // Terminate the monitor
  return () => {
    _.flatten(_.values(intervals)).forEach(fn => fn())
    _.values(pools).forEach(pool => {
      pool.drain().then(() => {
        pool.clear()
      })
    })
  }
}