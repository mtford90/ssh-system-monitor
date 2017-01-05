/* @flow */

import type {Dispatch as ReduxDispatch} from 'redux'
import {createStore} from 'redux'

type Action = {
  type: 'SET_SEARCH_STRING',
  searchString: string,
} | {
  type: 'CLEAR_SEARCH_STRING',
}

type Dispatch = ReduxDispatch<Action>

const store              = createStore()
const dispatch: Dispatch = store.dispatch.bind(store)

// Type error as expected
const action: Action = {
  type:         'SET_SEARCH_STRING',
  searchString: 4,
}

// No type error
dispatch(action)

