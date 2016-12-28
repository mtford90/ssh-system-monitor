/* @flow */

import Router from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Monitor from '../monitors/monitor'
import api from './api'

export type ApiOptions = {
  cors: boolean
}

export default function start (monitor: Monitor, opts: {cors: boolean}) {
  const _opts: ApiOptions = {
    cors: true,
    ...opts,
  }

  const app = Router();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  if (_opts.cors) {
    app.use(cors())
  }

  const apiRouter = api(monitor)

  app.use('/api', apiRouter)

  const port = process.env.PORT || 3000

  return app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/`)
  })
}