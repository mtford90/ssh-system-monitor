/* @flow */

// import React from 'react';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {withRouter} from 'react-router'

type Props = {
  title: string,
  onClick: () => void,
  children?: any,
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

  render () {
    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            title={this.props.title}
            iconElementLeft={
              <RaisedButton
                label="Toggle Drawer"
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
                  this.props.router.push('/about');
                }
              }
            >
              About
            </MenuItem>
          </Drawer>
          <div>{this.props.children}</div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Layout;
