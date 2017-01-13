/* @flow */

import type {ServerDefinition, LatestHostStats, SystemDatum} from 'lib/typedefs/data'
import {receiveSystemDatum} from 'lib/util/data'

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

export const DefaultRootSubstate: RootSubstate = {
  latest: {},
  config: [],
  stats:  {},
}


export default function (state: RootSubstate = DefaultRootSubstate, action: RootAction): RootSubstate {
  switch (action.type) {
    case 'root/RECEIVE_LATEST':
      return {
        ...state,
        latest: action.latest
      }
    case 'root/RECEIVE_CONFIG':
      return {
        ...state,
        isFetchingConfig: false,
        config:           action.config
      }
    case 'root/RECEIVE_MONITOR_DATUM':
      return {
        ...state,
        latest: receiveSystemDatum(state.latest, action.datum)
      }
    case 'root/RECEIVE_STATS':
      return {
        ...state,
        id:   action.id,
        data: action.data,
      }
    default:
      return state
  }
}
