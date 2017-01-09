/* @flow */
import type {Notification} from 'app/common/notifications/typedefs'

export type NotificationsAction = {
  type: 'notifications/ADD_NOTIFICATION',
  notification: Notification,
} | {
  type: 'notifications/REMOVE_NOTIFICATION',
  id: string,
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