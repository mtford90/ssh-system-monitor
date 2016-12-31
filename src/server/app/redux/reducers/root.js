/* @flow */
import type {ServerDefinition, LatestHostStats, MonitorDatum, LoggerDatum} from '../../../../types/index'
import {receiveMonitorDatum} from '../../../../util/data'

//
// Action types
//

export const ACTION_TYPE_RECEIVE_LATEST        = 'root/RECEIVE_LATEST'
export const ACTION_TYPE_RECEIVE_CONFIG        = 'root/RECEIVE_CONFIG'
export const ACTION_TYPE_RECEIVE_MONITOR_DATUM = 'root/RECEIVE_MONITOR_DATUM'
export const ACTION_TYPE_RECEIVE_LOGGER_DATUM  = 'root/RECEIVE_LOGGER_DATUM'

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

export function receiveDatum (datum: MonitorDatum) {
  return {
    type: ACTION_TYPE_RECEIVE_MONITOR_DATUM,
    datum
  }
}

export function receiveLoggerDatum (datum: LoggerDatum) {
  return {
    type: ACTION_TYPE_RECEIVE_LOGGER_DATUM,
    datum,
  }
}

export function $listen () {
  return (dispatch: (Object) => any) => {
    const socket = window.io.connect();
    socket.on('data', (datum: MonitorDatum) => {
      dispatch(receiveDatum(datum))
    });
    socket.on('log', (datum: LoggerDatum) => {
      dispatch(receiveLoggerDatum(datum))
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
  logs:   {},
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
      latest: receiveMonitorDatum(state.latest, action.datum)
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_LOGGER_DATUM) {
    return {
      ...state,
    }
  }

  return state
}