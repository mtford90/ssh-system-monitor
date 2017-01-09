/* @flow */

import {getStore} from '../../redux/store'
import type {Store} from 'lib/typedefs/redux'
import {warningAction, errorAction, successAction, infoAction} from '../../redux/reducers/notifications'

export function error (message: string) {
  const store: Store = getStore()
  store.dispatch(errorAction(message))
}

export function warning (message: string) {
  const store: Store = getStore()
  store.dispatch(warningAction(message))
}

export function success (message: string) {
  const store: Store = getStore()
  store.dispatch(successAction(message))
}

export function info (message: string) {
  const store: Store = getStore()
  store.dispatch(infoAction(message))
}