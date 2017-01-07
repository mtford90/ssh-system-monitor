import React from 'react';
import {render} from 'react-dom';
import './style.scss';
import {Provider} from 'react-redux'
import routes from './routes'
import {getStore} from './store'
import {State} from "../lib/typedefs/redux";

// Needed for onTouchTap
const injectTapEventPlugin = require('react-tap-event-plugin')
injectTapEventPlugin();

const rootEl = document.getElementById('root');

const processEnv: any = process.env;
const NODE_ENV = processEnv.NODE_ENV
const IS_PROD = NODE_ENV === 'production'

const PRELOADED_STATE: State = window['__PRELOADED_STATE__']

const store = getStore(PRELOADED_STATE)

render(
  <Provider store={store}>
    {routes(store)}
  </Provider>,
  rootEl
);

if (module.hot) {
  const replaceRootReducer = () => {
    const nextRootReducer = require('./redux/reducers').default
    store.replaceReducer(nextRootReducer);
  }

  const reducerModules = [
    './redux/reducers'
  ]

  reducerModules.forEach(path => module.hot.accept(path, replaceRootReducer))
}

