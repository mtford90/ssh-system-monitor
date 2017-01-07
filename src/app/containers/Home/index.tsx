/* @flow */

import * as React from 'react';
import {connect} from 'react-redux'

class Home extends React.Component<{}, {}> {
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