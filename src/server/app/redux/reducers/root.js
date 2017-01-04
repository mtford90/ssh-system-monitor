/* @flow */
import type {ServerDefinition, LatestHostStats, SystemDatum, LoggerDatum} from '../../../../types/index'
import {receiveSystemDatum} from '../../../../util/data'

//
// Action types
//

export const ACTION_TYPE_RECEIVE_LATEST        = 'root/RECEIVE_LATEST'
export const ACTION_TYPE_RECEIVE_CONFIG        = 'root/RECEIVE_CONFIG'
export const ACTION_TYPE_RECEIVE_MONITOR_DATUM = 'root/RECEIVE_MONITOR_DATUM'

//
// Actions
//

export function receiveLatest (latest: LatestHostStats) {
  return {
    type: ACTION_TYPE_RECEIVE_LATEST,
    latest
  }
}

export function receiveConfig (config: ServerDefinition[]) {
  return {
    type: ACTION_TYPE_RECEIVE_CONFIG,
    config
  }
}

export function receiveDatum (datum: SystemDatum) {
  return {
    type: ACTION_TYPE_RECEIVE_MONITOR_DATUM,
    datum
  }
}


export function $listen () {
  return (dispatch: (Object) => any) => {
    const socket = window.io.connect();
    socket.on('data', (datum: SystemDatum) => {
      dispatch(receiveDatum(datum))
    });
  }
}

type RootReduxState = {
  latest: LatestHostStats,
  config: ServerDefinition[],
}

const DEFAULT_STATE: RootReduxState = {
  latest: {},
  config: [],
}

export default function (state: RootReduxState = DEFAULT_STATE, action: Object) {
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