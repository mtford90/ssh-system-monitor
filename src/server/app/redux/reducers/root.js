import {latest} from '../../data/api/index'
import {getJSON} from '../../../../util/http'

//
// Action types
//

export const ACTION_TYPE_FETCH_LATEST   = 'Config/FETCH_LATEST'
export const ACTION_TYPE_RECEIVE_LATEST = 'Config/RECEIVE_LATEST'
export const ACTION_TYPE_FETCH_CONFIG   = 'Config/FETCH_CONFIG'
export const ACTION_TYPE_RECEIVE_CONFIG = 'Config/RECEIVE_CONFIG'

//
// Actions
//

export function fetchLatest () {
  return {
    type: ACTION_TYPE_FETCH_LATEST
  }
}

export function receiveLatest (latest) {
  return {
    type: ACTION_TYPE_RECEIVE_LATEST,
    latest
  }
}

export function fetchConfig () {
  return {
    type: ACTION_TYPE_FETCH_CONFIG
  }
}

export function receiveConfig (config) {
  return {
    type: ACTION_TYPE_RECEIVE_CONFIG,
    config
  }
}

//
// Thunks
//

export function $fetchLatest () {
  return dispatch => {
    dispatch(fetchLatest())
    latest().then(latest => dispatch(receiveLatest(latest))).catch(err => {
      // TODO
      console.error('error fetching config', err.stack)
    })
  }
}

export function $fetchConfig () {
  return dispatch => {
    dispatch(fetchConfig())
    getJSON('/api/config').then((res) => {
      const config = res.config
      dispatch(receiveConfig(config))
    }).catch(err => {
      // TODO
      console.error('error fetching config', err.stack)
    })
  }
}

//
// Reducer
//

const DEFAULT_STATE = {
  latest:           {},
  config:           [],
  isFetchingConfig: false,
}

export default function (state = DEFAULT_STATE, action) {
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
  else if (action.type === ACTION_TYPE_RECEIVE_LATEST) {
    return {
      ...state,
      latest: action.latest
    }
  }

  return state
}