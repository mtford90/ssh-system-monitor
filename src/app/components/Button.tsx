/* @flow */

import * as React from 'react';

type Props = {
  title: string,
  visited: boolean,
  onClick: () => void,
};

export default class Button extends React.Component<Props, {display: 'static' | 'hover' | 'active'}> {
  static defaultProps: {visited: boolean};

  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: () => void;

  constructor (props: Props) {
    super(props);
    this.state = {
      display: 'static',
    };

    const setDisplay = display => this.setState({display});

    this.onMouseEnter = () => setDisplay('hover');
    this.onMouseLeave = () => setDisplay('static');
    this.onMouseDown  = () => setDisplay('active');
  }

  render () {
    let className = 'button ' + this.state.display;
    if (this.props.visited) {
      className += ' visited';
    }

    return (
      <div
        className={className}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseDown={this.onMouseDown}
        onClick={this.props.onClick}
      >
        {this.props.title}
      </div>
    );
  }
}

Button.defaultProps = {visited: false};
