/* @flow */

import React, {Component, PropTypes} from 'react';
import Button from '../components/Button'

export default class Simple extends Component {
  render () {
    return (
      <div style={{backgroundColor: 'white'}}>
        sdfsdf!

        <Button
          title="Click Me!"
          visited={true}
          onClick={() => {
            console.log('yo!')
          }}
        />
      </div>
    )
  }
}