/* @flow */

import type {Store as ReduxStore, Dispatch as ReduxDispatch} from 'redux'
import type {RootSubstate, RootAction} from 'app/redux/reducers/root'
import type {LogsSubstate, LogsAction} from 'app/redux/reducers/logs'
import type {NotificationsSubstate, NotificationsAction} from '../../app/redux/reducers/notifications'

export type State = {
  root: RootSubstate,
  routing: {
    locationBeforeTransitions: string | null,
  },
  notifications: NotificationsSubstate,
  logs: LogsSubstate,
}

export type Action =  RootAction | LogsAction | NotificationsAction

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<State, Action>;
