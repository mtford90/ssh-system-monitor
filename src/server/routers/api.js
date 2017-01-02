/* @flow */

import Router from 'express'
import Monitor from '../../monitors/monitor'
import {cleanServer} from '../../util/data'
import _ from 'lodash'
import {stringify} from '../../util/json'
import type {LatestHostStats, MonitorDatum, LoggerDatum} from '../../types/index'
import type {SSHDataStoreQuerySystemStatsParams, SSHDataStoreQueryLogsParams} from '../../storage/DataStore'
import InternalLogging from '../../internalLogging'

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
      const data = {}
      _.forEach(monitor.latest, (stats, host) => {
        data[host] = stats[stat]
      })
      res.status(200).send(stringify({ok: true, data}))
    }
  })

  router.get('/config', (req, res) => {
    const servers = monitor.servers
    res.status(200).send(stringify({ok: true, config: servers.map(s => cleanServer(s))}))
  })

  router.get('/system/stats', (req, res) => {
    const params: SSHDataStoreQuerySystemStatsParams = req.query

    log.info(`/system/stats`, params)

    const store = monitor.opts.store
    store.querySystemStats(params).then((data: MonitorDatum[]) => {
      res.status(200).send(stringify({ok: true, data}))
    }).catch(err => {
      log.error('error getting system stats', err.stack)
      res.status(500).send(stringify({ok: false, detail: err.message}))
    })
  })

  router.get('/logs', (req, res) => {
    const params: SSHDataStoreQueryLogsParams = req.body

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



