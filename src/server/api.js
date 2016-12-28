/* @flow */

import Router from 'express'
import Monitor from '../monitors/monitor'
import {cleanServer} from '../util/data'
import _ from 'lodash'

export default function (monitor: Monitor) {
  const router = Router()

  router.get('/latest/:stat', (req, res) => {
    const host = req.query.host
    const stat = req.params.stat

    if (host) {
      const value = monitor.latest[host][stat]
      res.status(200).send(JSON.stringify({ok: true, value}))
    }
    else {
      const data = {}
      _.forEach(monitor.latest, (stats, host) => {
        data[host] = stats[stat]
      })
      res.status(200).send(JSON.stringify({ok: true, data}))
    }
  })

  router.get('/config', (req, res) => {
    const servers = monitor.servers
    res.status(200).send(JSON.stringify({ok: true, config: servers.map(s => cleanServer(s))}))
  })

  return router
}



