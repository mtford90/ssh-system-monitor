import {Provider} from 'react-redux'
import Router from 'express'
import {getStore} from '../../app/redux/store'
import _routes from 'app/routes'
import {match, RouterContext} from 'react-router'
import ReactDOMServer from 'react-dom/server'
import env, {NodeEnv} from '../env'
import webpack from 'webpack'
import {Dispatch} from 'lib/typedefs/redux'
import Monitor from 'lib/monitors/monitor'

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const NODE_ENV: NodeEnv = env.NODE_ENV

export default function (monitor: Monitor) {
  // Seed the SSR app with latest data from the monitor!
  const store = getStore({}, {logger: false})
  const dispatch: Dispatch = store.dispatch.bind(store)

  dispatch({type: 'root/RECEIVE_CONFIG', config: monitor.servers})
  dispatch({type: 'root/RECEIVE_LATEST', latest: monitor.latest})

  monitor.on('data', () => dispatch({type: 'root/RECEIVE_LATEST', latest: monitor.latest}))

  const router = Router()

  if (NODE_ENV === 'development') {
    console.log('NOT IN PRODUCTION SO USING WEBPACK HOT RELOAD')

    const config = require('dev/webpack/webpack.config.js')
    const compiler = webpack(config);

    const devMiddleware = require('webpack-dev-middleware')(compiler, {
      publicPath: config.output.publicPath,
      // Silence at last
      stats: {
        hash: false,
        version: false,
        timings: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: false,
        errorDetails: false,
        warnings: false,
        publicPath: false,
      }
    })

    const webpackHotMiddleware = require('webpack-hot-middleware')(compiler)

    router.use(devMiddleware);
    router.use(webpackHotMiddleware);
  }


  router.get('*', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const location = req.url
    const routes = _routes()

    match({routes, location}, (err, redirectLocation, renderProps) => {
      if (err) return next(err)

      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      }

      if (!renderProps) {
        return next(new Error(`No render props when attempting to render ${req.url}`))
      }

      const components = renderProps.components

      // If the component being shown is our 404 component, then set appropriate status
      if (components.some((c) => c && c.displayName === 'error-404')) {
        res.status(404)
      }

      const Comp = components[components.length - 1].WrappedComponent

      const fetchData = (Comp && Comp.fetchData) || (() => Promise.resolve())

      const {location, params, history} = renderProps

      fetchData({store, location, params, history})
        .then(() => {
          const appBody = ReactDOMServer.renderToString(
            <Provider store={store}>
              <RouterContext {...renderProps} />
            </Provider>
          )

          const state = store.getState()
          const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React PWA</title>
  <link rel="manifest" href="/static/manifest.json">

  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="PWA">
  <script src="/socket.io/socket.io.js"></script>
</head>
<body>
  <div id="root"><div>${appBody}</div></div>
  <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify(state)}
  </script>
  <script src="/dist/bundle.js"></script>
  ${NODE_ENV === 'development' ? '<script src="http://localhost:8097"></script>' : ''}
</body>
</html>`
          res.send(html)
        })
        .catch((err) => next())
    })
  })

  return router
}
