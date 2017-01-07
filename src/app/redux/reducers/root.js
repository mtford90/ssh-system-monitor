/* @flow */

import type {ServerDefinition, LatestHostStats, SystemDatum} from 'lib/typedefs/data'
import {receiveSystemDatum} from 'lib/util/data'

export const ACTION_TYPE_RECEIVE_LATEST        = 'root/RECEIVE_LATEST'
export const ACTION_TYPE_RECEIVE_CONFIG        = 'root/RECEIVE_CONFIG'
export const ACTION_TYPE_RECEIVE_MONITOR_DATUM = 'root/RECEIVE_MONITOR_DATUM'

export type RootAction = {
  type: 'root/RECEIVE_LATEST',
  latest: LatestHostStats,
} | {
  type: 'root/RECEIVE_CONFIG',
  config: ServerDefinition[],
} | {
  type: 'root/RECEIVE_MONITOR_DATUM',
  datum: SystemDatum,
}

export type RootSubstate = {
  latest: LatestHostStats,
  config: ServerDefinition[],
}

const DEFAULT_STATE: RootSubstate = {
  latest: {},
  config: [],
}

export default function (state: RootSubstate = DEFAULT_STATE, action: RootAction): RootSubstate {
  if (action.type === ACTION_TYPE_RECEIVE_CONFIG) {
    return {
      ...state,
      isFetchingConfig: false,
      config:           action.config
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_LATEST) {
    return {
      ...state,
      latest: action.latest
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_MONITOR_DATUM) {
    return {
      ...state,
      latest: receiveSystemDatum(state.latest, action.datum)
    }
  }
  return state
}
