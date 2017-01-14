/* @flow */

import {getStore} from '../../redux/store'
import type {Store} from 'lib/typedefs/redux'
import {createWarningAction, createErrorAction, createSuccessAction, createInfoAction} from '../../redux/reducers/notifications'

export function error (message: string) {
  const store: Store = getStore()
  store.dispatch(createErrorAction(message))
}

export function warning (message: string) {
  const store: Store = getStore()
  store.dispatch(createWarningAction(message))
}

export function success (message: string) {
  const store: Store = getStore()
  store.dispatch(createSuccessAction(message))
}

export function info (message: string) {
  const store: Store = getStore()
  store.dispatch(createInfoAction(message))
}