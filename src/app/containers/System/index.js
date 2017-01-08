/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {ServerDefinition, HostStatsCollection, LatestHostStats} from 'lib/typedefs/data'
import _ from 'lodash'
import SystemStatisticsPanel from '../../components/SystemStatisticsPanel'
import {Line} from 'react-chartjs-2';

type Props = {
  latest: LatestHostStats,
  config: {[host:string]: ServerDefinition},
}

function randomScalingFactor () {
  return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

const chartColors = {
  red:    'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green:  'rgb(75, 192, 192)',
  blue:   'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey:   'rgb(231,233,237)'
};

class System extends Component {
  props: Props

  render () {
    const latestStats: LatestHostStats = this.props.latest

    const data = {
      labels:   ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [{
        label:           "My First dataset",
        backgroundColor: chartColors.red,
        borderColor:     chartColors.red,
        data:            [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ],
        fill:            false,
      },
        {
          label:           "My Second dataset",
          fill:            false,
          backgroundColor: chartColors.blue,
          borderColor:     chartColors.blue,
          data:            [
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor(),
            randomScalingFactor()
          ],
        }]
    }

    const options = {
      responsive: true,
      title:{
        display:true,
        text:'Chart.js Line Chart'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Month'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }]
      }
    }

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
        <Line data={data} options={options}/>
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
