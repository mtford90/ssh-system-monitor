/* @flow */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom'
import type {LoggerDatum} from 'lib/typedefs/data'
import moment from 'moment'

type LogViewerProps = {
  logs: LoggerDatum[],
}

export default class LogViewer extends Component {
  props: LogViewerProps

  scrollPane: any

  calculateOffset () {
    const node = ReactDOM.findDOMNode(this.scrollPane)
    return (node.scrollHeight - node.scrollTop) - node.offsetHeight
  }

  scrollToBottom () {
    const scrollPane = this.scrollPane

    if (scrollPane) {
      let node       = ReactDOM.findDOMNode(scrollPane)
      node.scrollTop = node.scrollHeight
    }
  }

  _isPrettyMuchScrolledToBottom (n: number = 150) {
    const offset = this.calculateOffset()
    return offset < n
  }

  scrollToBottomIfNotScrolled () {
    if (this._isPrettyMuchScrolledToBottom()) {
      this.scrollToBottom()
    }
  }

  render () {
    const logs = this.props.logs

    return (
      <div
        className="LogViewer"
        ref={e => this.scrollPane = e}
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