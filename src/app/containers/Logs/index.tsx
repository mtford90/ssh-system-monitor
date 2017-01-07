/* @flow */

import * as React from 'react';
import {connect} from 'react-redux'
import {LogDefinition, ServerDefinition, LoggerDatum} from 'lib/typedefs/data'
import ServerDropdown from '../../components/dropdowns/ServerDropdown'
import LoggerDropdown from '../../components/dropdowns/LoggerDropdown'
import {LogFilter} from 'lib/storage/DataStore'
import * as _ from 'lodash'
import LogViewer from './LogViewer'
import * as http from 'lib/util/http'

import  {State, Dispatch} from '../../../lib/typedefs/redux'
import  {LogsSubstate} from '../../reducers/logs'
import {filterLogs} from "../../../lib/filters/index";
import {FormEvent} from "~react-dom~react";

type Props = {
  config: ServerDefinition[],
  dispatch: Dispatch,
  // Ugly way of handling this until object spread types become available in flow 9https://github.com/facebook/flow/issues/1326)
  rState: LogsSubstate,
}

export function $fetchLogs(params: LogFilter): (d: Dispatch) => any {
  return (d: Dispatch) => {
    http.getJSON('/api/logs', params).then((res: any) => {
      const logs: LoggerDatum[] = res.data
      d({type: 'logs/RECEIVE_LOGS', params, logs})
    })
  }
}

export function $listen(filter: LogFilter) {
  return (dispatch: Dispatch) => {
    const io = window['io'];
    if (io) {
      const socket = io.connect();
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
    else {
      throw new Error(`socket.io was not setup correctly`)
    }
  }
}

class Logs extends React.Component<Props, {}> {
  stopListening: () => void = () => {
  }

  constructor(props: Props) {
    super(props)
  }

  componentDidMount() {
    const props: Props = this.props
    if (!props.rState.selectedServer) {
      const selectedServer = props.config.length ? props.config[0] : null
      const logs = selectedServer ? selectedServer.logs || [] : []
      const selectedLog = logs.length ? logs[0] : null

      if (selectedServer) {
        this.props.dispatch({type: 'logs/SET_SELECTED_SERVER', server: selectedServer})
      }

      if (selectedLog) {
        this.props.dispatch({type: 'logs/SET_SELECTED_LOG', log: selectedLog})
        this.fetchLogs({name: selectedLog.name})
      }
    }
  }

  fetchLogs(filter: LogFilter) {
    this.stopListening()
    this.props.dispatch($fetchLogs(filter))

    const stopListening: any = this.props.dispatch($listen(filter))
    if (stopListening && stopListening instanceof Function) {
      this.stopListening = stopListening
    }
    else {
      throw new Error('Was expecting a stop listening function when dispatching the $listen thunk...')
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const selectedServer: ServerDefinition | null = this.props.rState.selectedServer
    const nextSelectedServer: ServerDefinition | null = nextProps.rState.selectedServer

    const currentHost = selectedServer ? selectedServer.ssh.host : null
    const nextHost = nextSelectedServer ? nextSelectedServer.ssh.host : null

    if (currentHost !== nextHost) {
      this.setSelectedServerAndFirstLog(nextSelectedServer)
    }
  }

  setSelectedServer(server: ServerDefinition | null) {
    this.props.dispatch({type: 'logs/SET_SELECTED_SERVER', server})
  }

  setSelectedLog(log: LogDefinition | null) {
    this.props.dispatch({type: 'logs/SET_SELECTED_LOG', log})
  }

  setSelectedServerAndFirstLog(nextSelectedServer: ServerDefinition | null) {
    this.setSelectedServer(nextSelectedServer)

    // Select the first log
    if (nextSelectedServer) {
      const logs = nextSelectedServer ? nextSelectedServer.logs || [] : []
      const selectedLog = logs.length ? logs[0] : null
      this.selectAndFetchLog(selectedLog)
    }
  }

  selectAndFetchLog(log: LogDefinition | null) {
    this.setSelectedLog(log)
    if (log) {
      this.fetchLogs({name: log.name})
    }
  }

  handleServerSelect = (selectedServer: ServerDefinition) => {
    this.setSelectedServerAndFirstLog(selectedServer)
  }

  handleLogSelect = (selectedLog: LogDefinition) => {
    this.selectAndFetchLog(selectedLog)
  }

  handleInputKeyDown (event: React.KeyboardEvent) : void {
    const enterPressed = event.keyCode === 13
    if (enterPressed) {
      const selectedLog = this.props.rState.selectedLog
      if (selectedLog) {
        const filter: LogFilter = {
          name: selectedLog.name,
        }

        const searchString = this.props.rState.searchString

        if (searchString) {
          filter.text = searchString
        }
        this.fetchLogs(filter)
      }
    }
  }

  render() {
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
          logs={sortedLogs}
        />
        <input
          className="SearchBar"
          placeholder="Search"
          value={searchString}
          onChange={(e: FormEvent) => {
            const searchString: string = e.target['value']
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

export default connect(mapStateToProps)(Logs)
