/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {ServerDefinition} from '../../../lib/typedefs/data'
import {pretty} from '../../../lib/util/json'

type Props = {
  config: ServerDefinition[],
}

@connect(
  state => {
    return {
      config: state.root.config,
    }
  }
)
export default class Config extends Component {
  props: Props

  render () {
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
