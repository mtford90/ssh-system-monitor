/* @flow */
import type {Notification} from 'app/common/notifications/typedefs'
import uuid from '../../../lib/util/uuid'
import type {NotificationPosition} from '../../common/notifications/typedefs'

export type NotificationsAction = {
  type: 'notifications/ADD_NOTIFICATION',
  notification: Notification,
} | {
  type: 'notifications/REMOVE_NOTIFICATION',
  id: string,
}

export function createErrorAction (message: string, position?: NotificationPosition = 'tr') {
  return {
    type: 'notifications/ADD_NOTIFICATION',
    notification: {
      id: uuid(),
      message: message,
      level: 'error',
      position,
    }
  }
}

export function createWarningAction (message: string, position?: NotificationPosition = 'tr') {
  return {
    type: 'notifications/ADD_NOTIFICATION',
    notification: {
      id: uuid(),
      message: message,
      level: 'warning',
      position,
    }
  }
}

export function createSuccessAction (message: string, position?: NotificationPosition = 'tr') {
  return {
    type: 'notifications/ADD_NOTIFICATION',
    notification: {
      id: uuid(),
      message: message,
      level: 'success',
      position,
    }
  }
}

export function createInfoAction (message: string, position?: NotificationPosition = 'tr') {
  return {
    type: 'notifications/ADD_NOTIFICATION',
    notification: {
      id: uuid(),
      message: message,
      level: 'info',
      position,
    }
  }
}

export type NotificationsSubstate = {
  notifications: Notification[]
}

export const DefaultNotificationsSubstate: NotificationsSubstate = {
  notifications: [],
};

export default function notifications (state: NotificationsSubstate = DefaultNotificationsSubstate, action: NotificationsAction) {
  switch (action.type) {
    case 'notifications/ADD_NOTIFICATION': {
      const notifications = [action.notification, ...state.notifications]
      return {
        ...state,
        notifications,
      }
    }
    case 'notifications/REMOVE_NOTIFICATION': {
      const id = action.id
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