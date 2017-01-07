/* @flow */

import React, {Component, PropTypes} from 'react';
import type {LoggerDatum} from '../../../../../common/typedefs'
import moment from 'moment'

type LogViewerProps = {
  logs: LoggerDatum[],
}

export default class LogViewer extends Component {
  props: LogViewerProps

  render () {
    const logs = this.props.logs

    return (
      <div
        className="LogViewer"
      >
        {
          logs.map(
            (log: LoggerDatum, idx: number) => {
              const TIMESTAMP_COLOR = '#7295d0'

              return (
                <div key={idx} style={{marginTop: 6}}>
                  <div style={{display: 'inline', marginRight: 4, color: TIMESTAMP_COLOR}}>
                    {moment(log.timestamp).format('DD/MM/YYYY HH:mm:ss.SSS')}
                  </div>
                  <div style={{display: 'inline', marginRight: 8, color: log.source === 'stderr' ? 'red' : 'green'}}>
                    {log.source}
                  </div>
                  <div style={{display: 'inline'}}>
                    {log.text}
                  </div>
                </div>
              )
            }
          )
        }
      </div>
    )
  }
}