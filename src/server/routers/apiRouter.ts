import Monitor from 'lib/monitors/monitor'
import {cleanServer} from 'lib/util/data'
import * as _ from 'lodash'
import {stringify} from 'lib/util/json'
import {LatestHostStats, SystemDatum, LoggerDatum, DataType, HostStatsCollection} from 'lib/typedefs/data'
import {SystemStatFilter, LogFilter} from 'lib/storage/DataStore'
import InternalLogging from 'lib/internalLogging'

const Router = require('express')

const log = InternalLogging.routers.api

export default function (monitor: Monitor) {
  const router = Router()

  router.get('/latest', (req, res) => {
    const latest: LatestHostStats = monitor.latest

    res.status(200).send(stringify({ok: true, latest}))
  })

  router.get('/latest/:stat', (req, res) => {
    const query = req.query 
    const host  = query.host
    const stat  = req.params.stat

    log.info(`/latest/${stat}`, query)

    if (host) {
      const value = monitor.latest[host][stat]
      res.status(200).send(stringify({ok: true, value}))
    }
    else {
      const data: {[host:string]: HostStatsCollection} = {}

      _.forEach(monitor.latest, (stats: HostStatsCollection, host: string) => {
        data[host] = stats[stat]
      })

      res.status(200).send(stringify({ok: true, data}))
    }
  })

  router.get('/config', (req, res) => {
    const servers = monitor.servers
    res.status(200).send(stringify({ok: true, config: servers.map(s => cleanServer(s))}))
  })

  /**
   * Ensure data types (in the query string, everything is a string)
   */
  function getQuerySystemStatsParams (query: any): SystemStatFilter {
    let params: SystemStatFilter = {}

    const timestamp = query.timestamp

    if (query.name) params.name = query.name.toString()
    if (query.host) params.host = query.host.toString()
    if (query.name) params.name = query.name.toString()
    if (query.type) {
      const type: DataType = query.type.toString()
      params.type          = type
    }
    if (query.extra) {
      const extra: any  = {}

      if (query.extra.path) {
        extra.path = query.extra.path.toString()
      }
      if (query.extra.process) {
        const process: any        = {}
        params.extra = {
          ...extra,
          process,
        }
        if (query.extra.process.id) {
          process.id = query.extra.process.id.toString()
        }
      }
    }

    if (timestamp) {
      if (timestamp.gt) {
        timestamp.gt = parseInt(timestamp.gt, 10)
      }
      if (timestamp.lt) {
        timestamp.lt = parseInt(timestamp.lt, 10)

        if (timestamp.gte) {
          timestamp.gte = parseInt(timestamp.gte, 10)
        }
        if (timestamp.lte) {
          timestamp.lte = parseInt(timestamp.lte, 10)
        }
      }
    }
    return params
  }

  /**
   * Ensure data types (in the query string, everything is a string)
   */
  function getQueryLogsParams (query: any): LogFilter {
    let params: LogFilter = {}

    if (query.source) params.source = query.source.toString()
    if (query.name) params.name = query.name.toString()
    if (query.host) params.host = query.host.toString()
    if (query.text) params.text = new RegExp(query.text.toString())

    const timestamp = query.timestamp
    if (timestamp) {
      if (timestamp.gt) {
        timestamp.gt = parseInt(timestamp.gt, 10)
      }
      if (timestamp.lt) {
        timestamp.lt = parseInt(timestamp.lt, 10)

        if (timestamp.gte) {
          timestamp.gte = parseInt(timestamp.gte, 10)
        }
        if (timestamp.lte) {
          timestamp.lte = parseInt(timestamp.lte, 10)
        }
      }
      params.timestamp = query.timestamp
    }

    return params
  }


  router.get('/system/stats', (req, res) => {
    const params: SystemStatFilter = getQuerySystemStatsParams(req.query)

    log.info(`/system/stats`, params)

    const store = monitor.opts.store
    store.querySystemStats(params).then((data: SystemDatum[]) => {
      res.status(200).send(stringify({ok: true, data}))
    }).catch(err => {
      log.error('error getting system stats', err.stack)
      res.status(500).send(stringify({ok: false, detail: err.message}))
    })
  })

  router.get('/logs', (req, res) => {
    const params: LogFilter = getQueryLogsParams(req.query)

    const store = monitor.opts.store
    store.queryLogs(params).then((data: LoggerDatum[]) => {
      res.status(200).send(stringify({ok: true, data}))
    }).catch(err => {
      log.error('error getting log stats', err.stack)
      res.status(500).send(stringify({ok: false, detail: err.message}))
    })
  })

  return router
}
