/* @flow */

import React, {Component} from 'react';
import NotificationSystem from 'react-notification-system';
import cn from 'classnames';

import type {Notification} from '../../common/notifications/typedefs'

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

type NotificationsProps = {
  notifications: Notification[],
  removeNotification: (notificationId: string) => void,
}

export default class NotificationsComponent extends Component {
  props: NotificationsProps

  notificationSystem: any

  constructor (props: NotificationsProps) {
    super(props);
  }

  componentDidMount () {
    this.props.notifications.map((n: Notification) => this.addNotification(n));
  }

  componentWillReceiveProps (nextProps: NotificationsProps) {
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

    this.props.removeNotification(n.id)
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