/* @flow */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux'

class Home extends Component {
  render () {
    return (
      <div style={{backgroundColor: 'white'}}>
        Yo!
      </div>
    )
  }
}

export default connect(
)(Home)