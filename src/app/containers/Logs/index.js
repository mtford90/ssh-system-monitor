/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {LogDefinition, ServerDefinition, LoggerDatum} from 'lib/typedefs/data'
import ServerDropdown from '../../components/dropdowns/ServerDropdown'
import LoggerDropdown from '../../components/dropdowns/LoggerDropdown'
import type {LogFilter} from 'lib/storage/typedefs'
import _ from 'lodash'
import LogViewer from './LogViewer'

import type {Connector} from 'react-redux'
import type {State, Dispatch} from '../../../lib/typedefs/redux'
import {filterLogs} from 'lib/filters/index'
import type {LogsSubstate} from '../../redux/reducers/logs'
import {logs} from '../../common/api'
import {createErrorAction, createWarningAction, createSuccessAction} from '../../redux/reducers/notifications'

type Props = {
  config: ServerDefinition[],
  dispatch: Dispatch,
  // Ugly way of handling this until object spread types become available in flow 9https://github.com/facebook/flow/issues/1326)
  rState: LogsSubstate,
}

export function $fetchLogs (params: LogFilter) {
  return (dispatch: Dispatch) => {
    dispatch({type: 'logs/FETCH_LOGS', params})
    logs.get(params).then(res => {
      if (res.isOk() && res.data && res.data.length) {
        dispatch({type: 'logs/RECEIVE_LOGS', params, logs: res.data})
        const host = params.host
        const name = params.name
        if (host && name) {
          dispatch(createSuccessAction(`Fetched logs for "${name}" (${host}) successfully`))
        }
        else if (name) {
          dispatch(createSuccessAction(`Fetched logs for "${name}" successfully`))
        }
        else {
          dispatch(createSuccessAction(`Fetched logs successfully`))
        }
      }
      else if (res.isOk()) {
        dispatch(createWarningAction('No logs were returned'))
      }
      else {
        dispatch(createErrorAction('There was an error fetching the logs'))
      }
    })
  }
}

export function $listen (filter: LogFilter) {
  return (dispatch: Dispatch) => {
    const socket = window.io.connect();
    const listener = (datum: LoggerDatum) => {
      const logs = filterLogs([datum], filter)
      logs.forEach((log: LoggerDatum) => {
        dispatch({type: 'logs/RECEIVE_LOG', log, params: filter})
      })
    }
    socket.on('log', listener);
    return () => {
      socket.removeListener('log', listener)
    }
  }
}

class Logs extends Component {
  props: Props
  logViewer: LogViewer

  stopListening: () => void = () => {}

  constructor (props: Props) {
    super(props)
  }

  componentDidMount () {
    const props: Props = this.props
    if (!props.selectedServer) {
      const selectedServer = props.config.length ? props.config[0] : null

      if (selectedServer) {
        this.props.dispatch({type: 'logs/SET_SELECTED_SERVER', server: selectedServer})
      }
    }
  }

  fetchLogs (filter: LogFilter) {
    this.stopListening()
    this.props.dispatch($fetchLogs(filter))

    const stopListening: mixed = this.props.dispatch($listen(filter))
    if (stopListening instanceof Function) {
      this.stopListening = stopListening
    }
    else {
      throw new Error('Was expecting a stop listening function when dispatching the $listen thunk...')
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const selectedServer: ServerDefinition | null = this.props.rState.selectedServer
    const nextSelectedServer: ServerDefinition | null = nextProps.rState.selectedServer

    const currentHost = selectedServer ? selectedServer.ssh.host : null
    const nextHost = nextSelectedServer ? nextSelectedServer.ssh.host : null

    const hostChanged = currentHost !== nextHost

    if (hostChanged) {
      this.setSelectedServerAndFirstLog(nextSelectedServer)
    }

    const currentNumLogs = this.props.rState.logs.length
    const nextNumLogs = nextProps.rState.logs.length
  }

  setSelectedServer (server: ServerDefinition | null) {
    this.props.dispatch({type: 'logs/SET_SELECTED_SERVER', server})
  }

  setSelectedLog (log: LogDefinition | null) {
    this.props.dispatch({type: 'logs/SET_SELECTED_LOG', log})
  }

  setSelectedServerAndFirstLog (nextSelectedServer: ServerDefinition | null) {
    console.log('setSelectedServerAndFirstLog', nextSelectedServer)
    this.setSelectedServer(nextSelectedServer)

    // Select the first log
    if (nextSelectedServer) {
      const logs = nextSelectedServer ? nextSelectedServer.logs || [] : []
      const selectedLog = logs.length ? logs[0] : null
      this.selectAndFetchLog(nextSelectedServer, selectedLog)
    }
  }

  selectAndFetchLog (server: ServerDefinition, log: LogDefinition | null) {
    console.log('selectAndFetchLog', log)

    this.setSelectedLog(log)
    if (log) {
      this.fetchLogs({
        name: log.name,
        host: server.ssh.host,
      })
    }
  }

  handleServerSelect = (selectedServer: ServerDefinition) => {
    this.setSelectedServerAndFirstLog(selectedServer)
  }

  handleLogSelect = (selectedLog: LogDefinition) => {
    const server = this.props.rState.selectedServer
    if (server) {
      this.selectAndFetchLog(server, selectedLog)
    }
  }

  handleInputKeyDown = (event: Object) => {
    const enterPressed = event.keyCode === 13
    if (enterPressed) {
      const selectedLog = this.props.rState.selectedLog
      const selectedServer = this.props.rState.selectedServer
      if (selectedServer && selectedLog) {
        const filter: LogFilter = {
          name: selectedLog.name,
          host: selectedServer.ssh.host,
        }
        const searchString = this.props.rState.searchString

        if (searchString) {
          filter.text = searchString
        }
        this.fetchLogs(filter)
      }
    }
  }

  render () {
    const {selectedServer, selectedLog, searchString, logs,} = this.props.rState

    const sortedLogs: LoggerDatum[] = _.sortBy(logs, l => {
      return l.timestamp
    }).reverse()

    return (
      <div className="Logs">
        <div className="Menu">
          <ServerDropdown
            servers={this.props.config}
            selected={selectedServer}
            onSelect={this.handleServerSelect}
          />
          <LoggerDropdown
            logs={selectedServer ? selectedServer.logs || []: []}
            selected={selectedLog}
            onSelect={this.handleLogSelect}
          />
        </div>
        <LogViewer
          ref={e => this.logViewer = e}
          logs={sortedLogs}
        />
        <input
          className="SearchBar"
          placeholder="Search"
          value={searchString}
          onChange={e => {
            const searchString = e.target.value
            this.props.dispatch({type: 'logs/SET_SEARCH_STRING', searchString})
          }}
          onKeyDown={this.handleInputKeyDown}
          disabled={!selectedLog}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: State) => {
  return {
    config: state.root.config,
    rState: state.logs,
  }
}

const connector: Connector<{}, Props> = connect(mapStateToProps)

export default connector(Logs)
