import * as React from 'react';
import {LoggerDatum} from 'lib/typedefs/data'
import * as moment from 'moment'

type Props = {
  logs: LoggerDatum[],
}

export default class LogViewer extends React.Component<Props, {}> {
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