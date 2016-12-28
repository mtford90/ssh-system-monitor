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
import {$fetchConfig} from './redux/reducers/root'
import type {MonitorDatum} from '../../types/index'

type Props = {
  title: string,
  onClick: () => void,
  children?: any,
};

@connect(
  null,
  dispatch => {
    return {
      $fetchConfig: () => dispatch($fetchConfig())
    }
  }
)
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

  componentDidMount () {
    this.props.$fetchConfig()

    const socket = window.io.connect();
    socket.on('data', (data: MonitorDatum) => {
      console.log(data);
    });
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
  }

  render () {
    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={this.props.title}
            iconElementLeft={
              <RaisedButton
                label="Toggle Menu"
                onTouchTap={this.handleToggle}
              />
            }
          />
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
                  this.props.router.push('/config');
                }
              }
            >
              Config
            </MenuItem>
          </Drawer>
          <div>{this.props.children}</div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Layout;
