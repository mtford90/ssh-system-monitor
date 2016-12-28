/* @flow */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Monitor from '../monitors/monitor'
import favicon from 'serve-favicon'
import path from 'path'
import env from './env'

import getApiRouter from './routers/api'
import appRouter from './routers/app'

export type ApiOptions = {
  cors?: boolean
}

export default function start (monitor: Monitor, opts?: ApiOptions = {}) {
  const _opts: ApiOptions = {
    cors: true,
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

  app.use('/api', apiRouter)
  app.use('/', appRouter)

  const port = env.PORT

  return app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/`)
  })
}