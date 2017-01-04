/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {LogDefinition, ServerDefinition, LoggerDatum} from '../../../../types/index'
import ServerDropdown from '../../components/dropdowns/ServerDropdown'
import LoggerDropdown from '../../components/dropdowns/LoggerDropdown'
import type {LogFilter} from '../../../../storage/DataStore'
import _ from 'lodash'
import moment from 'moment'
import {setSelectedLog, setSelectedServer, $fetchLogs, $listen} from './redux'
import LogViewer from './LogViewer'

type Props = {
  config: ServerDefinition[],
  logs: LoggerDatum[],
  $fetchLogs: (params: LogFilter) => void,
  $listen: (name: string) => () => void,
  selectedServer: ServerDefinition | null,
  selectedLog: LogDefinition | null,
  setSelectedLog: (log: LogDefinition | null) => void,
  setSelectedServer: (log: ServerDefinition | null) => void,
}

const mapStateToProps = state => {
  const LogsState = state['containers.Logs']
  return {
    config:         state.root.config,
    logs:           LogsState.logs,
    selectedServer: LogsState.selectedServer,
    selectedLog:    LogsState.selectedLog,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    $fetchLogs:        (params: LogFilter) => dispatch($fetchLogs(params)),
    $listen:           (name: string) => dispatch($listen(name)),
    setSelectedLog:    (log: LogDefinition) => dispatch(setSelectedLog(log)),
    setSelectedServer: (server: ServerDefinition) => dispatch(setSelectedServer(server)),
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Logs extends Component {
  props: Props

  stopListening: () => void = () => {}

  constructor (props: Props) {
    super(props)
  }

  componentDidMount () {
    const props = this.props
    if (!props.selectedServer) {
      const selectedServer = props.config.length ? props.config[0] : null
      const logs           = selectedServer ? selectedServer.logs || [] : []
      const selectedLog    = logs.length ? logs[0] : null

      if (selectedServer) {
        this.props.setSelectedServer(selectedServer)
      }

      if (selectedLog) {
        this.props.setSelectedLog(selectedLog)
        this.fetchLogs(selectedLog.name)
      }
    }
  }

  fetchLogs (name: string) {
    this.stopListening()
    this.props.$fetchLogs({name})
    this.stopListening = this.props.$listen(name)
  }

  componentWillReceiveProps (nextProps: Props) {
    const selectedServer: ServerDefinition | null     = this.props.selectedServer
    const nextSelectedServer: ServerDefinition | null = nextProps.selectedServer

    const currentHost = selectedServer ? selectedServer.ssh.host : null
    const nextHost    = nextSelectedServer ? nextSelectedServer.ssh.host : null

    if (currentHost !== nextHost) {
      this.setSelectedServerAndFirstLog(nextSelectedServer)
    }
  }

  setSelectedServerAndFirstLog (nextSelectedServer: ServerDefinition | null) {
    this.props.setSelectedServer(nextSelectedServer)

    // Select the first log
    if (nextSelectedServer) {
      const logs        = nextSelectedServer ? nextSelectedServer.logs || [] : []
      const selectedLog = logs.length ? logs[0] : null
      this.selectAndFetchLog(selectedLog)
    }
  }

  selectAndFetchLog (log: LogDefinition | null) {
    this.props.setSelectedLog(log)
    if (log) {
      this.fetchLogs(log.name)
    }
  }

  handleServerSelect = (selectedServer: ServerDefinition) => {
    this.setSelectedServerAndFirstLog(selectedServer)
  }

  handleLogSelect = (selectedLog: LogDefinition) => {
    this.selectAndFetchLog(selectedLog)
  }

  render () {
    const {selectedServer, selectedLog} = this.props

    const logs = _.sortBy(this.props.logs, l => {
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
          logs={logs}
        />
        <input className="SearchBar" placeholder="Search"/>
      </div>
    )
  }
}