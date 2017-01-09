/* @flow */

import type {ServerDefinition, LatestHostStats, SystemDatum} from 'lib/typedefs/data'
import {receiveSystemDatum} from 'lib/util/data'
import type {SystemStatFilter} from 'lib/storage/typedefs'
import type {Dispatch} from 'lib/typedefs/redux'

import * as api from 'app/common/api'

import type {APIResponse} from 'server/routers/api/typedefs'
import uuid from '../../../lib/util/uuid'

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
  stats:  {},
}

export function $getSystemStats (id: string, filter: SystemStatFilter) {
  return async (dispatch: Dispatch) => {
    const res: APIResponse<SystemDatum[]> = await api.systemStats.get(filter)
    if (res.isOk() && res.data) {
      dispatch({type: 'root/RECEIVE_STATS', id, data: res.data})
    }
    else {
      dispatch({type: 'notifications/ADD_NOTIFICATION', notification: {
        id:       uuid(),
        level:    'error',
        position: 'tr',
        message:  res.getReadableDetail()
      }})
    }
  }
}

export default function (state: RootSubstate = DEFAULT_STATE, action: RootAction): RootSubstate {
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
