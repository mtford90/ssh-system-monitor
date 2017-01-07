//noinspection ES6UnusedImports
import * as React from 'react';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import Layout from './Layout';
import Home from './containers/Home/index';
import {syncHistoryWithStore} from 'react-router-redux'
import Config from './containers/Config/index'
import System from './containers/System/index'
import Logs from './containers/Logs/index'
import {State} from "lib/typedefs/redux";
import {Store} from "redux";

export default function routes (store?: Store<State>) {
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
        </Route>
      </Route>
    </Router>
  )
}