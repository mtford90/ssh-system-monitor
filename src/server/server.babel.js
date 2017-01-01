/* @flow */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Monitor from '../monitors/monitor'
import favicon from 'serve-favicon'
import path from 'path'
import env from './env'
import ws from 'socket.io'

import getApiRouter from './routers/api'
import getAppRouter from './routers/app'
import type {MonitorDatum, LoggerDatum} from '../types/index'
import {getLogger} from '../util/log'

export type ApiOptions = {
  cors?: boolean,
  serveClient?: boolean,
}

const log = getLogger('server')

export default function start (monitor: Monitor, opts?: ApiOptions = {}) {

  const _opts: ApiOptions = {
    cors:        true,
    serveClient: true,
    ...opts,
  }

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use('/static', express.static(__dirname + '/static'))
  app.use('/dist', express.static(__dirname + '/dist'))
  app.use(favicon(path.resolve(__dirname + '/static/favicon.ico')));

  if (_opts.cors) {
    app.use(cors())
  }

  const apiRouter = getApiRouter(monitor)

  if (_opts.serveClient) {
    const appRouter = getAppRouter(monitor)
    app.use('/', appRouter)
  }

  app.use('/api', apiRouter)

  const port = env.PORT

  const server = app.listen(port, () => {
    log.info(`App is running at http://localhost:${port}/`)
  })

  const io = ws(server)

  io.on('connection', socket => {
    monitor.on('data', (datum: MonitorDatum) => {
      socket.emit('data', datum);
    })
    monitor.on('log', (datum: LoggerDatum) => {
      socket.emit('log', datum);
    })
  })

  return server
}