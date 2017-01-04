/* @flow */
import type {ServerDefinition, LogDefinition, LoggerDatum} from '../../../../types/index'
import type {LogFilter} from '../../../../storage/DataStore'
import * as http from '../../../../util/http'
import {filterLogs} from '../../../../filters/index'

//
// Action Types
//

export const ACTION_SET_SELECTED_SERVER    = 'containers/Logs/SET_SELECTED_SERVER'
export const ACTION_SET_SELECTED_LOG       = 'containers/Logs/SET_SELECTED_LOG'
export const ACTION_TYPE_RECEIVE_LOGS      = 'containers/logs/RECEIVE_LOGS'
export const ACTION_TYPE_RECEIVE_LOG       = 'containers/logs/RECEIVE_LOG'
export const ACTION_TYPE_SET_SEARCH_STRING = 'containers/logs/SET_SEARCH_STRING'

//
// Actions
//

type SetSelectedServerAction = {
  type: 'containers/Logs/SET_SELECTED_SERVER',
  server: ServerDefinition | null,
}

type SetSelectedLogAction = {
  type: 'containers/Logs/SET_SELECTED_LOG',
  log: LogDefinition | null,
}

type ReceiveLogsAction = {
  type: 'containers/logs/RECEIVE_LOGS',
  params: LogFilter,
  logs: LoggerDatum[]
}

type ReceiveLogAction = {
  type: 'containers/logs/RECEIVE_LOG',
  params: LogFilter,
  log: LoggerDatum
}

type SetSearchStringAction = {
  type: 'containers/logs/SET_SEARCH_STRING',
  searchString: string,
}

export function setSelectedServer (server: ServerDefinition | null): SetSelectedServerAction {
  return {
    type: ACTION_SET_SELECTED_SERVER,
    server,
  }
}

export function setSelectedLog (log: LogDefinition | null): SetSelectedLogAction {
  return {
    type: ACTION_SET_SELECTED_LOG,
    log,
  }
}

export function receiveLogs (params: LogFilter, logs: LoggerDatum[]): ReceiveLogsAction {
  return {
    type: ACTION_TYPE_RECEIVE_LOGS,
    params,
    logs,
  }
}

export function receiveLog (params: LogFilter, log: LoggerDatum): ReceiveLogAction {
  return {
    type: ACTION_TYPE_RECEIVE_LOG,
    params,
    log,
  }
}

export function setSearchString (searchString: string): SetSearchStringAction {
  return {
    type: ACTION_TYPE_SET_SEARCH_STRING,
    searchString,
  }
}

//
// Thunks
//

export function $fetchLogs (params: LogFilter) {
  return (dispatch: Function) => {
    http.getJSON('/api/logs', params).then(res => {
      const logs: LoggerDatum[] = res.data
      dispatch(receiveLogs(params, logs))
    })
  }
}

export function $listen (filter: LogFilter) {
  return (dispatch: (Object) => any) => {
    const socket   = window.io.connect();
    const listener = (datum: LoggerDatum) => {
      const logs = filterLogs([datum], filter)
      logs.forEach((l: LoggerDatum) => {
        dispatch(receiveLog(filter, l))
      })
    }
    socket.on('log', listener);
    return () => {
      socket.removeListener('log', listener)
    }
  }
}


//
// Reducer
//

type LogsReduxState = {
  selectedServer: ServerDefinition | null,
  selectedLog: LogDefinition | null,
  logs: LoggerDatum[],
  params: LogFilter,
  searchString: string,
}

const DEFAULT_STATE: LogsReduxState = {
  selectedServer: null,
  selectedLog:    null,
  logs:           [],
  params:         {},
  searchString:   '',
}

export default function reducer (state: LogsReduxState = DEFAULT_STATE, action: *) {
  if (action.type === ACTION_SET_SELECTED_SERVER) {
    const _action: SetSelectedServerAction = action
    return {
      ...state,
      selectedServer: _action.server,
    }
  }
  else if (action.type === ACTION_SET_SELECTED_LOG) {
    const _action: SetSelectedLogAction = action
    return {
      ...state,
      selectedLog: _action.log,
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_LOGS) {
    return {
      ...state,
      params: action.params,
      logs:   action.logs,
    }
  }
  else if (action.type === ACTION_TYPE_RECEIVE_LOG) {
    return {
      ...state,
      params: action.params,
      logs:   [action.log, ...state.logs],
    }
  }
  else if (action.type === ACTION_TYPE_SET_SEARCH_STRING) {
    return {
      ...state,
      searchString: action.searchString,
    }
  }
  return state
}