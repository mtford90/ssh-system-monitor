import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import _ from 'lodash'

export default function (monitor, opts = {}) {
  opts = {
    cors: true,
    ...opts,
  }

  const app = express();
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))

  if (opts.cors) {
    app.use(cors())
  }

  app.get('/api/latest/:stat', (req, res) => {
    const host = req.query.host
    const stat = req.params.stat

    let data = null

    if (host) {
      data = monitor.latest[host][stat]
    }
    else {
      data = {}
      _.forEach(monitor.latest, (stats, host) => {
        data[host] = stats[stat]
      })
    }

    res.status(200).send(JSON.stringify({ok: true, data}))
  })

  const port = process.env.PORT || 3000

  return app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/`)
  })
}