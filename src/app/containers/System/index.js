/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {ServerDefinition, HostStatsCollection, LatestHostStats} from 'data.d.ts'
import _ from 'lodash'
import SystemStatisticsPanel from '../../components/SystemStatisticsPanel'

type Props = {
  latest: LatestHostStats,
  config: {[host:string]: ServerDefinition},
}

class System extends Component {
  props: Props

  render () {
    const latestStats: LatestHostStats = this.props.latest

    return (
      <div style={{backgroundColor: 'white'}}>
        {_.map(latestStats, (serverStats: HostStatsCollection, host: string) => {
          const server: ? ServerDefinition = this.props.config[host]

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
  null,
  (stateProps, dispatchProps) => {
    return {
      ...stateProps,
      ...dispatchProps,
      config: _.keyBy(stateProps.config, (s: ServerDefinition) => s.ssh.host),
    }
  }
)(System)