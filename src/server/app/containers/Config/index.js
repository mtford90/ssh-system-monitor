/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'
import type {ServerDefinition} from '../../../../types'
import {pretty} from '../../../../util/json'

type Props = {
  config: ServerDefinition[],
  $fetchConfig: Function
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
    console.log('rendering Home')
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