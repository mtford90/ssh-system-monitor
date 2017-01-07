/* @flow */

import * as React from 'react';
import {connect} from 'react-redux'
import {ServerDefinition} from '../../../lib/typedefs/data'
import {pretty} from '../../../lib/util/json'

type Props = {
  config: ServerDefinition[],
}

class Config extends React.Component<Props, {}> {
  render() {
    return (
      <div>
        Config!
        <pre>
          <code>
            {pretty(this.props.config)}
          </code>
        </pre>
      </div>
    )
  }
}

export default connect(
  state => {
    return {
      config: state.root.config,
    }
  }
)(Config)