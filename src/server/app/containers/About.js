/* @flow */

import React, {Component, PropTypes} from 'react';
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import {connect} from 'react-redux'
import {withRouter} from 'react-router'

// @connect(
//   state => {
//     return {}
//   },
//   dispatch => {
//     return {}
//   },
// )
@withRouter
export default class About extends Component {
  render () {
    return (
      <Card style={{textAlign: 'center'}}>
        <CardTitle style={{margin: 'auto'}}>PWA</CardTitle>
        <CardText>
          About this Application
        </CardText>
        <CardActions>
          <RaisedButton onClick={() => this.props.router.push('/')}>OK</RaisedButton>
        </CardActions>
      </Card>
    )
  }
}