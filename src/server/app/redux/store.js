import {applyMiddleware, createStore as _createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import createLogger from 'redux-logger'

let _store = null

export function getStore (preloadedState = {}) {
  if (!_store) {
    _store = _createStore(
      reducers,
      preloadedState,
      applyMiddleware(
        thunkMiddleware,
        createLogger()
      )
    )
  }

  return _store
}