/* @flow */

import {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import NotificationSystem from 'react-notification-system';
import cn from 'classnames';

import type {Connector} from 'react-redux'
import type {Notification} from 'app/common/notifications/typedefs'
import type {Dispatch} from 'lib/typedefs/redux'
import type {State} from '../../../lib/typedefs/redux'
import type {NotificationsSubstate} from '../../redux/reducers/notifications'

const styles = {
  Containers: {
    DefaultStyle: {
      width: 'auto',
    },
    tr:           {
      top: '44px',
    },
  },

  NotificationItem: {
    DefaultStyle: {
      padding:      '12px 30px 15px 45px',
      fontSize:     '15px',
      borderRadius: '0px',
      width:        'auto',

      isVisible: {
        opacity: 0.8,
      },
    },
  },

  Dismiss: {
    DefaultStyle: {
      backgroundColor: 'transparent',
      color:           '#777',
      top:             '4px',
    },
  },
};

type Props = {
  notifications: Notification[],
  dispatch: Dispatch,
}

class Notifications extends Component {
  props: Props

  notificationSystem: any

  constructor (props: Props) {
    super(props);
  }

  componentDidMount () {
    this.props.notifications.map((n: Notification) => this.addNotification(n));
  }

  componentWillReceiveProps (nextProps: Props) {
    nextProps.notifications.map((n: Notification) => this.addNotification(n));
  }

  addNotification (n: Notification) {
    let icon;

    switch (n.level) {
      case 'success':
        icon = 'fa-check';
        break;
      case 'warning':
      case 'error':
        icon = 'fa-exclamation';
        break;
      case 'info':
      default:
        icon = 'fa-info';
        break;
    }

    this.notificationSystem.addNotification({
      level:       n.level,
      position:    n.position,
      uid:         n.id,
      autoDismiss: 4,
      children:    (
                     <div>
                       <i className={cn('fa', icon)}/>
                       <span className="message">{ n.message }</span>
                     </div>
                   ),
    });

    this.props.dispatch({type: 'notifications/REMOVE_NOTIFICATION', id: n.id});
  }

  render () {
    return (
      <NotificationSystem
        ref={inst => this.notificationSystem = inst}
        style={styles}
      />
    );
  }
}

const connector: Connector<{}, Props> = connect((state: State) => {
  const notifications: NotificationsSubstate = state.notifications
  return {
    ...notifications
  }
})

export default connector(Notifications)
