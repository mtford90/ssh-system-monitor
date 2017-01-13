/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {ServerDefinition, HostStatsCollection, LatestHostStats} from 'lib/typedefs/data'
import _ from 'lodash'
import SystemStatisticsPanel from '../../components/SystemStatisticsPanel'
import {Line} from 'react-chartjs-2';
import type {SystemSubstate} from '../../redux/reducers/system'
import {$listen} from '../../redux/reducers/system'
import {$fetchSystemStats} from '../../redux/reducers/system'
import type {Dispatch} from 'lib/typedefs/redux'
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import moment from 'moment'

type Props = {
  latest: LatestHostStats,
  config: {[host:string]: ServerDefinition},
  system: SystemSubstate,
  dispatch: Dispatch
}

type Timestamp = number | null

function randomScalingFactor (): number {
  return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function rgba (r: number, g: number, b: number, alpha: number = 1.0) {
  return `rgba(${r},${g},${b},${alpha})`
}

const chartColors = {
  red: rgba(255, 99, 132),
  orange: rgba(255, 159, 64),
  yellow: rgba(255, 205, 86),
  green: rgba(75, 192, 192),
  blue: rgba(54, 162, 235),
  purple: rgba(153, 102, 255),
  grey: rgba(231, 233, 237),
};

class System extends Component {
  props: Props

  state: {
    data:  number[],
    data2:  number[],
  }

  _stopListener: Function

  constructor (props: Props) {
    super(props)
    this.state = {
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ],
      data2: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ]
    }
  }

  onFromDateChange = (e: null, date: Date) => {
    this.props.dispatch({type: 'system/SET_FROM_DATE', date: date.getTime()})
  }

  onToDateChange = (e: null, date: Date) => {
    this.props.dispatch({type: 'system/SET_TO_DATE', date: date.getTime()})
  }

  onFromTimeChange = (e: null, date: Date) => {
    this.props.dispatch({type: 'system/SET_FROM_TIME', date: date.getTime()})
  }

  onToTimeChange = (e: null, date: Date) => {
    console.log('date', date)
    this.props.dispatch({type: 'system/SET_TO_TIME', date: date.getTime()})
  }

  componentDidMount () {
    const fromDateTime = this._getFromDateTime()
    const toDateTime = this._getToDateTime()

    const timestampFilter = {}

    if (fromDateTime) {
      timestampFilter.gte = fromDateTime
    }

    if (toDateTime) {
      timestampFilter.lte = toDateTime
    }

    const filter = {
      timestamp: timestampFilter
    }

    this.props.dispatch($fetchSystemStats(filter))


    const stopListener = this.props.dispatch($listen(filter))

    if (stopListener instanceof Function) {
      this._stopListener = stopListener
    }
    else {
      throw new TypeError(`$listen should return a function to stop listening`)
    }
  }

  _getDateTime (date: Timestamp, time: Timestamp): Timestamp {
    if (time && date) {
      const momentTime = moment(time)
      const momentDate = moment(date)

      const datetime = moment({
        year: momentDate.year(),
        month: momentDate.month(),
        day: momentDate.date(),
        hour: momentTime.hours(),
        minute: momentTime.minutes()
      });

      return datetime.toDate().getTime()
    }
    else if (date) {
      const momentDate = moment(date)

      const datetime = moment({
        year: momentDate.year(),
        month: momentDate.month(),
        day: momentDate.date(),
      });

      return datetime.toDate().getTime()
    }
    else if (time) {
      const momentTime = moment(time)

      const datetime = moment({
        year: momentTime.year(),
        month: momentTime.month(),
        day: momentTime.date(),
        hour: momentTime.hours(),
        minute: momentTime.minutes()
      });

      return datetime.toDate().getTime()
    }
    else {
      return null
    }
  }

  _getFromDateTime (): Timestamp {
    const {fromDate, fromTime} = this.props.system

    return this._getDateTime(
      fromDate,
      fromTime,
    )
  }

  _getToDateTime (): Timestamp {
    const {toDate, toTime} = this.props.system

    return this._getDateTime(
      toDate,
      toTime,
    )
  }

  render () {
    const latestStats: LatestHostStats = this.props.latest

    const data = {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
      ],
      datasets: [
        {
          label: "My First Dataset",
          backgroundColor: chartColors.red,
          borderColor: chartColors.red,
          data: this.state.data,
          fill: false,
        },
        {
          label: "My Second Dataset",
          fill: false,
          backgroundColor: chartColors.blue,
          borderColor: chartColors.blue,
          data: this.state.data2,
        },
      ]
    }

    const options = {
      responsive: true,
      title: {
        display: true,
        text: 'Chart.js Line Chart'
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

    const {fromDate, fromTime, toDate, toTime} = this.props.system

    return (
      <div style={{backgroundColor: 'white'}}>
        <div>
          <DatePicker
            hintText="From Date"
            value={fromDate ? new Date(fromDate) : null}
            onChange={this.onFromDateChange}
            autoOk={true}
          />
          <TimePicker
            hintText="From Time"
            autoOk={true}
            value={fromTime ? new Date(fromTime) : null}
            onChange={this.onFromTimeChange}
          />
          <DatePicker
            hintText="To Date"
            value={toDate ? new Date(toDate) : null}
            onChange={this.onToDateChange}
            autoOk={true}
          />
          <TimePicker
            hintText="To Time"
            autoOk={true}
            value={toTime ? new Date(toTime) : null}
            onChange={this.onToTimeChange}
          />
        </div>

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
        <Line
          data={data}
          options={options}
        />
      </div>
    )
  }
}

export default connect(
  state => {
    return {
      latest: state.root.latest,
      config: state.root.config,
      system: state.system,
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
