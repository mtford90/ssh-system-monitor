//noinspection ES6UnusedImports
import React from 'react';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import Layout from './Layout';
import Home from './containers/Home/index';
import {syncHistoryWithStore} from 'react-router-redux'
import Config from './containers/Config/index'
import System from './containers/System/index'
import Logs from './containers/Logs/index'
import NotFound from './containers/NotFound/index'

export default function routes (store) {
  let history = browserHistory

  if (store) {
    history = syncHistoryWithStore(
      browserHistory,
      store,
    )
  }

  return (
    <Router history={history}>
      <Route>
        <Route
          path="/"
          component={Layout}
          title="SSH Monitor"
        >
          <IndexRoute
            component={Home}
          />
          <Route
            path="system"
            component={System}
          />
          <Route
            path="logs"
            component={Logs}
          />
          <Route
            path="config"
            component={Config}
          />
          <Route
            path="*"
            component={NotFound}
          />
        </Route>
      </Route>
    </Router>
  )
}