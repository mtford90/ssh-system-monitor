/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {LogDefinition, ServerDefinition, LoggerDatum} from '../../../../types/index'
import ServerDropdown from '../../components/dropdowns/ServerDropdown'
import LoggerDropdown from '../../components/dropdowns/LoggerDropdown'
import type {LogFilter} from '../../../../storage/DataStore'
import _ from 'lodash'
import moment from 'moment'
import {setSelectedLog, setSelectedServer, $fetchLogs, $listen, setSearchString} from './redux'
import LogViewer from './LogViewer'

type Props = {
  config: ServerDefinition[],
  logs: LoggerDatum[],
  $fetchLogs: (params: LogFilter) => void,
  $listen: (filter: LogFilter) => () => void,
  selectedServer: ServerDefinition | null,
  selectedLog: LogDefinition | null,
  setSelectedLog: (log: LogDefinition | null) => void,
  setSelectedServer: (log: ServerDefinition | null) => void,
  setSearchString: (searchString: string) => void,
  searchString: string,
}

const mapStateToProps = state => {
  return {
    config: state.root.config,
    ...state['containers.Logs'],
  }
}

const mapDispatchToProps = dispatch => {
  return {
    $fetchLogs:        (filter: LogFilter) => dispatch($fetchLogs(filter)),
    $listen:           (filter: LogFilter) => dispatch($listen(filter)),
    setSelectedLog:    (log: LogDefinition) => dispatch(setSelectedLog(log)),
    setSelectedServer: (server: ServerDefinition) => dispatch(setSelectedServer(server)),
    setSearchString:   (searchString: string) => dispatch(setSearchString(searchString)),
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
        this.fetchLogs({name: selectedLog.name})
      }
    }
  }

  fetchLogs (filter: LogFilter) {
    this.stopListening()
    this.props.$fetchLogs(filter)
    this.stopListening = this.props.$listen(filter)
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
      this.fetchLogs({name: log.name})
    }
  }

  handleServerSelect = (selectedServer: ServerDefinition) => {
    this.setSelectedServerAndFirstLog(selectedServer)
  }

  handleLogSelect = (selectedLog: LogDefinition) => {
    this.selectAndFetchLog(selectedLog)
  }


  handleInputKeyDown = (event: Object) => {
    const enterPressed = event.keyCode === 13
    if (enterPressed) {
      const selectedLog = this.props.selectedLog
      if (selectedLog) {
        const filter: LogFilter = {
          name: selectedLog.name,
        }

        const searchString = this.props.searchString

        if (searchString) {
          filter.text = searchString
        }
        this.fetchLogs(filter)
      }
    }
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
        <input
          className="SearchBar"
          placeholder="Search"
          value={this.props.searchString}
          onChange={e => this.props.setSearchString(e.target.value)}
          onKeyDown={this.handleInputKeyDown}
          disabled={!this.props.selectedLog}
        />
      </div>
    )
  }
}