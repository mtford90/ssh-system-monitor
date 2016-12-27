/* @flow */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import _ from 'lodash'
import {cleanServer} from '../util/data'
import Monitor from '../monitors/monitor'

export type ApiOptions = {
  cors: boolean
}

export default function start (monitor: Monitor, opts: {cors: boolean}) {
  const _opts: ApiOptions = {
    cors: true,
    ...opts,
  }

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  if (_opts.cors) {
    app.use(cors())
  }

  app.get('/api/latest/:stat', (req, res) => {
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

  app.get('/api/config', (req, res) => {
    const servers = monitor.servers
    res.status(200).send(JSON.stringify({ok: true, config: servers.map(s => cleanServer(s))}))
  })

  const port = process.env.PORT || 3000

  return app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/`)
  })
}