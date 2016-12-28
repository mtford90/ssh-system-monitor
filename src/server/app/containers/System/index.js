/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import {$fetchLatest} from '../../redux/reducers/root'
import type {LatestStats, HostStatsCollection} from '../../../../monitors/monitor'
import type {ServerDefinition} from '../../../../types/index'
import _ from 'lodash'
import SystemStatisticsPanel from '../../components/SystemStatisticsPanel'

type Props = {
  latest: LatestStats,
  config: {[host:string]: ServerDefinition},
  $fetchLatest: Function
}

class Home extends Component {
  props: Props

  componentDidMount () {
    this.props.$fetchLatest()
  }

  render () {
    const latestStats: LatestStats = this.props.latest

    return (
      <div style={{backgroundColor: 'white'}}>
        {_.map(latestStats, (serverStats: HostStatsCollection, host: string) => {
          const server: ? ServerDefinition = this.props.config[host]

          console.log('host', host)
          console.log('serverStats', serverStats)

          if (server && serverStats) {
            return (
              <SystemStatisticsPanel
                key={host}
                server={server}
                stats={serverStats}
              />
            )
          }

          return (
            <div key={host}>
              Loading...
            </div>
          )
        })}
      </div>
    )
  }
}

export default connect(
  state => {
    return {
      latest: state.root.latest,
      config: state.root.config,
    }
  },
  dispatch => {
    return {
      $fetchLatest: () => dispatch($fetchLatest())
    }
  },
  (stateProps, dispatchProps) => {
    return {
      ...stateProps,
      ...dispatchProps,
      config: _.keyBy(stateProps.config, (s: ServerDefinition) => s.ssh.host),
    }
  }
)(Home)