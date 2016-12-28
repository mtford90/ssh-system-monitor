import {applyMiddleware, createStore as _createStore} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import createLogger from 'redux-logger'

let _store = null

export function getStore (preloadedState = {}) {
  if (!_store) {
    _store = _createStore(
      reducers,
      preloadedState,
      composeWithDevTools(
        applyMiddleware(
          thunkMiddleware,
          createLogger()
        )
      )
    )
  }

  return _store
}