/* @flow */

export type NotificationPosition = 'tr' | 'tl' | 'tc' | 'br' | 'bl' | 'bc'

export type NotificationLevel = 'success' | 'error' | 'warning' | 'info'

export type Notification = {
  id: string,
  message: string,
  level: NotificationLevel,
  position: NotificationPosition
}

