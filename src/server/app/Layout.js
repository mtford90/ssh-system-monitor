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
import {$listen} from './redux/reducers/root'

type Props = {
  title: string,
  onClick: () => void,
  children?: any,
  $listen: Function,
};

@connect(
  null,
  dispatch => {
    return {
      $listen: () => dispatch($listen())
    }
  },
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

  handleToggle = () => {
    this.setState({open: !this.state.open});
  }

  componentDidMount () {
    this.props.$listen()
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

export default Layout;
