/* @flow */
import type {Notification} from 'app/common/notifications/typedefs'
import uuid from '../../../lib/util/uuid'

export type NotificationsAction = {
  type: 'notifications/ADD_NOTIFICATION',
  notification: Notification,
} | {
  type: 'notifications/REMOVE_NOTIFICATION',
  id: string,
}

export function errorAction(message: string) {
  return {
    type:         'notifications/ADD_NOTIFICATION',
    notification: {
      id:       uuid(),
      message:  message,
      level:    'error',
      position: 'tr',
    }
  }
}

export function warningAction(message: string) {
  return {
    type:         'notifications/ADD_NOTIFICATION',
    notification: {
      id:       uuid(),
      message:  message,
      level:    'warning',
      position: 'tr',
    }
  }
}

export function successAction(message: string) {
  return {
    type:         'notifications/ADD_NOTIFICATION',
    notification: {
      id:       uuid(),
      message:  message,
      level:    'success',
      position: 'tr',
    }
  }
}

export function infoAction(message: string) {
  return {
    type:         'notifications/ADD_NOTIFICATION',
    notification: {
      id:       uuid(),
      message:  message,
      level:    'info',
      position: 'tr',
    }
  }
}

export type NotificationsSubstate = {
  notifications: Notification[]
}

const DEFAULT_STATE: NotificationsSubstate = {
  notifications: [],
};

export default function notifications (state: NotificationsSubstate = DEFAULT_STATE, action: NotificationsAction) {
  switch (action.type) {
    case 'notifications/ADD_NOTIFICATION': {
      const notifications = [action.notification, ...state.notifications]
      return {
        ...state,
        notifications,
      }
    }
    case 'notifications/REMOVE_NOTIFICATION': {
      const id            = action.id
      const notifications = state.notifications.filter((n: Notification) => n.id !== id)
      return {
        ...state,
        notifications,
      }
    }
    default:
      return state
  }
}