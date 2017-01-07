/* @flow */

import * as React from 'react';
import {connect} from 'react-redux'
import {ServerDefinition, HostStatsCollection, LatestHostStats} from 'lib/typedefs/data'
import * as _ from 'lodash'
import SystemStatisticsPanel from '../../components/SystemStatisticsPanel'

type Props = {
  latest: LatestHostStats,
  config: {[host:string]: ServerDefinition},
}

class System extends React.Component<Props, {}> {
  render () {
    const latestStats: LatestHostStats = this.props.latest

    return (
      <div style={{backgroundColor: 'white'}}>
        {_.map(latestStats, (serverStats: HostStatsCollection, host: string) => {
          const server = this.props.config[host]

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
  undefined,
  (stateProps: any, dispatchProps: any) => {
    return {
      ...stateProps,
      ...dispatchProps,
      config: _.keyBy(stateProps.config, (s: ServerDefinition) => s.ssh.host),
    }
  }
)(System)