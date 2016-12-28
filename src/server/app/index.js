import React from 'react';
import {render} from 'react-dom';
import {install} from 'offline-plugin/runtime';
import './style.css';
import {Provider} from 'react-redux'
import routes from './routes'
import {getStore} from './redux/store'

const rootEl = document.getElementById('root');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const NODE_ENV = process.env.NODE_ENV
const IS_PROD  = NODE_ENV === 'production'

const PRELOADED_STATE = window.__PRELOADED_STATE__

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
    './reducers'
  ]

  reducerModules.forEach(path => module.hot.accept(path, replaceRootReducer))
}

install()