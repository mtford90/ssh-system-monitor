/* @flow */

// import React from 'react';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import type {Connector} from 'react-redux'
import type {Dispatch} from 'lib/typedefs/redux'
import type {SystemDatum} from 'lib/typedefs/data'

type Props = {
  title: string,
  onClick: () => void,
  children?: any,
  dispatch: Dispatch,
};

@withRouter
class Layout extends Component {
  state: {
    open: boolean,
  };

  static defaultProps = {
    visited: false
  }

  constructor (props: Props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
  }

  componentDidMount () {
    const socket = window.io.connect();
    socket.on('data', (datum: SystemDatum) => {
      this.props.dispatch({type: 'root/RECEIVE_MONITOR_DATUM', datum})
    });
  }

  render () {
    return (
      <MuiThemeProvider>
        <div className="AppContainer">
          <header>
            <AppBar
              title={this.props.title}
              iconElementLeft={
              <RaisedButton
                label="Toggle Menu"
                onTouchTap={this.handleToggle}
              />
            }
            />
          </header>
          <Drawer title={this.props.title} open={this.state.open}>
            <MenuItem
              onClick={
                () => {
                  this.setState({open: !this.state.open});
                  this.props.router.push('/');
                }
              }
            >
              Home
            </MenuItem>
            <MenuItem
              onClick={
                () => {
                  this.setState({open: !this.state.open});
                  this.props.router.push('/system');
                }
              }
            >
              System
            </MenuItem>
            <MenuItem
              onClick={
                () => {
                  this.setState({open: !this.state.open});
                  this.props.router.push('/logs');
                }
              }
            >
              Logs
            </MenuItem>
            <MenuItem
              onClick={
                () => {
                  this.setState({open: !this.state.open});
                  this.props.router.push('/config');
                }
              }
            >
              Config
            </MenuItem>
          </Drawer>
          <div className="ContentContainer">
            {this.props.children}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

const connector: Connector<{}, Props> = connect()

export default connector(Layout)