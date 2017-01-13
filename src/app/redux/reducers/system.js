/* @flow */

import moment from 'moment'
import type {SystemDatum} from '../../../lib/typedefs/data'

import type {SystemStatFilter} from 'lib/storage/typedefs'
import type {Dispatch} from 'lib/typedefs/redux'

import * as api from 'app/common/api'

import type {APIResponse} from 'server/routers/api/typedefs'
import uuid from '../../../lib/util/uuid'
import {filterSystemStats} from '../../../lib/filters/index'

export type SystemAction = {
  type: 'system/SET_TO_DATE',
  date: number,
} | {
  type: 'system/SET_FROM_DATE',
  date: number,
} | {
  type: 'system/SET_TO_TIME',
  date: number,
} | {
  type: 'system/SET_FROM_TIME',
  date: number,
} | {
  type: 'system/RECEIVE_STATS',
  data: SystemDatum[],
} | {
  type: 'system/RECEIVE_STAT',
  datum: SystemDatum,
} | {
  type: 'system/FETCH_STATS',
  filter: SystemStatFilter,
}

export type SystemSubstate = {
  toDate: number | null,
  fromDate: number | null,
  fromTime: number | null,
  toTime: number | null,
  systemStats: SystemDatum[],
  filter: SystemStatFilter,
}

export const DefaultSystemSubstate: SystemSubstate = {
  fromDate: moment().subtract({minutes: 30}).toDate().getTime(),
  toDate: null,
  fromTime: moment().subtract({minutes: 30}).toDate().getTime(),
  toTime: null,
  systemStats: [],
  filter: {},
}

export function $fetchSystemStats (filter: SystemStatFilter) {
  return async (dispatch: Dispatch) => {
    const res: APIResponse<SystemDatum[]> = await api.systemStats.get(filter)
    dispatch({type: 'system/FETCH_STATS', filter})
    if (res.isOk() && res.data) {
      dispatch({type: 'system/RECEIVE_STATS', data: res.data})
    }
    else {
      dispatch({
        type: 'notifications/ADD_NOTIFICATION', notification: {
          id: uuid(),
          level: 'error',
          position: 'tr',
          message: res.getReadableDetail()
        }
      })
    }
  }
}

export function $listen (filter: SystemStatFilter) {
  return (dispatch: Dispatch) => {
    const socket = window.io.connect();
    const listener = (datum: SystemDatum) => {
      const data = filterSystemStats([datum], filter)
      data.forEach((datum: SystemDatum) => {
        dispatch({type: 'system/RECEIVE_STAT', datum})
      })
    }
    socket.on('data', listener);
    return () => {
      socket.removeListener('log', listener)
    }
  }
}

export default function reducer (
  state: SystemSubstate = DefaultSystemSubstate,
  action: SystemAction,
): SystemSubstate {
  switch (action.type) {
    case 'system/SET_TO_DATE':
      return {
        ...state,
        toDate: action.date,
      }
    case 'system/SET_FROM_DATE':
      return {
        ...state,
        fromDate: action.date,
      }
    case 'system/SET_TO_TIME':
      return {
        ...state,
        toTime: action.date,
      }
    case 'system/SET_FROM_TIME':
      return {
        ...state,
        fromTime: action.date,
      }
    case 'system/RECEIVE_STATS':
      return {
        ...state,
        systemStats: action.data,
      }
    case 'system/RECEIVE_STAT':
      return {
        ...state,
        systemStats: [...state.systemStats, action.datum],
      }
    case 'system/FETCH_STATS':
      return {
        ...state,
        filter: action.filter,
      }
    default:
      return state
  }
}