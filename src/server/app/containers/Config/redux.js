/* @flow */

import type {ServerDefinition} from '../../../../types'
import {getJSON} from '../../../../util/http'

export const ACTION_TYPE_FETCH_CONFIG   = 'Config/FETCH_CONFIG'
export const ACTION_TYPE_RECEIVE_CONFIG = 'Config/RECEIVE_CONFIG'

export function fetchConfig (): Object {
  return {
    type: ACTION_TYPE_FETCH_CONFIG
  }
}

export function receiveConfig (config: ServerDefinition[]): Object {
  return {
    type: ACTION_TYPE_RECEIVE_CONFIG,
    config
  }
}

export function $fetchConfig (): (Function) => any {
  return dispatch => {
    dispatch(fetchConfig())
    getJSON('/api/config').then((res: Object) => {
      const config = res.config
      dispatch(receiveConfig(config))
    }).catch(err => {
      // TODO
      console.error('error fetching config', err.stack)
    })
  }
}

type ConfigReduxState = {
  config: ServerDefinition[],
  isFetchingConfig: boolean,
}

const DEFAULT_STATE: ConfigReduxState = {
  config:           [],
  isFetchingConfig: false,
}

export default function (state: ConfigReduxState = DEFAULT_STATE, action: Object): ConfigReduxState {
  if (action.type === ACTION_TYPE_FETCH_CONFIG) {
    return {
      ...state,
      isFetchingConfig: true,
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_CONFIG) {
    return {
      ...state,
      isFetchingConfig: false,
      config:           action.config
    }
  }
  return state
}
