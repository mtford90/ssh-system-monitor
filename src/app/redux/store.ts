import {applyMiddleware, createStore, Store} from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import createLogger from 'redux-logger'
import {State} from "lib/typedefs/redux";

let _store: Store<State>

type StoreOptions = {
  logger: boolean,
}

export function getStore(preloadedState: State, opts: StoreOptions = {logger: true}): Store<State> {
  const middleware = [thunkMiddleware]

  if (opts.logger) middleware.push(createLogger())

  if (!_store) {
    _store = <Store<State>> createStore(
      reducers,
      preloadedState,
      applyMiddleware.apply(applyMiddleware, middleware)
    )
  }

  return _store
}