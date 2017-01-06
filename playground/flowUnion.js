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

type CustomDispatch = (a: Action) => mixed

const dispatch: CustomDispatch = store.dispatch.bind(store)


// Type error as expected
const action: Action = {
  type:         'SET_SEARCH_STRING',
  searchString: 's',
}

// No type error
const f = dispatch({
  type: 'SET_SEARCH_STRING',
  searchString: '23'
})
