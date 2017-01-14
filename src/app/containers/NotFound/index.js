/* @flow */

import React, {Component} from 'react';

export default class NotFound extends Component {
  // Used to ensures that a 404 status is returned during a server-side render (see appRouter.js)
  static displayName = 'error-404'

  render () {
    return (
      <div>
        <h3>404 page not found</h3>
        <p>We are sorry but the page you are looking for does not exist.</p>
      </div>
    )
  }
}