//noinspection ES6UnusedImports
import React from 'react';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import Layout from './Layout';
import About from './containers/About';
import Home from './containers/Home';
import {syncHistoryWithStore} from 'react-router-redux'
import Config from './containers/Config/index'

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
        <Route path="/" component={Layout} title="PWA">
          <IndexRoute
            component={Home}
          />
          <Route
            path="about"
            component={About}
          />
          <Route
            path="config"
            component={Config}
          />
        </Route>
      </Route>
    </Router>
  )
}