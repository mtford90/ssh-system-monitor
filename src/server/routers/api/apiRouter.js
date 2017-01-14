/* @flow */

import Router from 'express'
import Monitor from '../../../lib/monitors/monitor'
import {cleanServer} from '../../../lib/util/data'
import type {SystemDatum, LoggerDatum, DataType} from '../../../lib/typedefs/data'
import type {SystemStatFilter, LogFilter} from '../../../lib/storage/typedefs'
import InternalLogging from '../../../lib/internalLogging'
import {sendAPIResponse} from './typedefs'

const log = InternalLogging.routers.api

export default function (monitor: Monitor) {
  const router: express$Router = Router()


  router.get('/config', (req: express$Request, res: express$Response) => {
    const servers = monitor.servers
    sendAPIResponse(res, {data: servers.map(s => cleanServer(s))})
  })

  /**
   * Ensure data types (in the query string, everything is a string)
   */
  function getQuerySystemStatsParams (query: Object): SystemStatFilter {
    let params: SystemStatFilter = {}

    const timestamp = query.timestamp

    if (query.name) params.name = query.name.toString()
    if (query.host) params.host = query.host.toString()
    if (query.name) params.name = query.name.toString()
    if (query.type) {
      const type: DataType = query.type.toString()
      params.type = type
    }
    if (query.extra) {
      const extra = {}
      params.extra = extra
      if (query.extra.path) {
        extra.path = query.extra.path.toString()
      }
      if (query.extra.process) {
        const process = {}
        params.extra.process = process
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
  function getQueryLogsParams (query: Object): LogFilter {
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

  router.get('/system/stats', (req: express$Request, res: express$Response) => {
    const params: SystemStatFilter = getQuerySystemStatsParams(req.query)

    log.info(`GET /system/stats`, params)

    const store = monitor.opts.store
    store.querySystemStats(params).then((data: SystemDatum[]) => {
      sendAPIResponse(res, {data})
    }).catch(err => {
      log.error('error getting system stats', err.stack)
      sendAPIResponse(res, {statusCode: 500, detail: err.message})
    })
  })

  router.get('/logs', (req: express$Request, res: express$Response) => {
    const params: LogFilter = getQueryLogsParams(req.query)

    log.info(`GET /logs`, params)

    const store = monitor.opts.store
    store.queryLogs(params).then((data: LoggerDatum[]) => {
      sendAPIResponse(res, {data})
    }).catch(err => {
      log.error('error getting log stats', err.stack)
      sendAPIResponse(res, {statusCode: 500, detail: err.message})
    })
  })

  return router
}
