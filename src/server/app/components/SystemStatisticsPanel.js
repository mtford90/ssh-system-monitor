/* @flow */

import React, {Component, PropTypes, Element} from 'react';
import type {ServerDefinition} from '../../../types/index'
import type {ServerStats} from '../../../monitors/monitor'

type SystemStatisticsPanelProps = {
  stats: ServerStats,
  server: ServerDefinition,
};

function toPercentage (n: number) {
  return (n * 100).toFixed(0) + '%'
}

export default class SystemStatisticsPanel extends Component {
  props: SystemStatisticsPanelProps;

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

