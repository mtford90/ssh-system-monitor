/* @flow */

import type {ServerDefinition, LatestHostStats, SystemDatum} from 'lib/typedefs/data'
import {receiveSystemDatum} from 'lib/util/data'
import * as http from 'lib/util/http'
import type {SystemStatFilter} from 'lib/storage/typedefs'
import type {Dispatch} from 'lib/typedefs/redux'

import * as api from 'app/common/api'

export type RootAction = {
  type: 'root/RECEIVE_LATEST',
  latest: LatestHostStats,
} | {
  type: 'root/RECEIVE_CONFIG',
  config: ServerDefinition[],
} | {
  type: 'root/RECEIVE_MONITOR_DATUM',
  datum: SystemDatum,
} | {
  type: 'root/RECEIVE_STATS',
  id: string,
  data: SystemDatum[],
}

export type RootSubstate = {
  latest: LatestHostStats,
  config: ServerDefinition[],
}

const DEFAULT_STATE: RootSubstate = {
  latest: {},
  config: [],
  stats: {},
}

export function $getSystemStats(id: string, filter: SystemStatFilter) {
  return (dispatch: Dispatch) => {
    return api.systemStats.get(filter).then(data => {
      dispatch({type: 'root/RECEIVE_STATS', id, data})
    }).catch(err => {
      // TODO: Show an error modal
    })
  }
}

export default function (state: RootSubstate = DEFAULT_STATE, action: RootAction): RootSubstate {
  switch(action.type) {
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
        id: action.id,
        data: action.data,
      }
    default:
      return state
  }
}
