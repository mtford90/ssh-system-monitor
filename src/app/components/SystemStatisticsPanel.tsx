import * as React from 'react';
import {ServerDefinition, HostStatsCollection} from 'lib/typedefs/data'

type Props = {
  stats: HostStatsCollection,
  server: ServerDefinition,
};

function toPercentage (n: number) {
  return (n * 100).toFixed(0) + '%'
}

export default class SystemStatisticsPanel extends React.Component<Props, {}> {
  render () {
    const {cpuUsage, swapUsedPercentage, memoryUsedPercentage} = this.props.stats

    return (
      <div>
        <div>
          <strong>
            {this.props.server.name} ({this.props.server.ssh.host})
          </strong>
        </div>
        <div>
          CPU Usage: {toPercentage(cpuUsage || 0)}
        </div>
        <div>
          Swap Used: {toPercentage(swapUsedPercentage || 0)}
        </div>
        <div>
          Memory Used: {toPercentage(memoryUsedPercentage || 0)}
        </div>
      </div>
    )
  }
}

