/* @flow */

import type {Store as ReduxStore} from 'redux'
import type {Dispatch as ReduxDispatch} from 'redux-thunk'
import type {RootSubstate, RootAction} from 'app/redux/reducers/root'
import type {LogsSubstate, LogsAction} from 'app/redux/reducers/logs'

export type State = {
  root: RootSubstate,
  routing: {
    locationBeforeTransitions: string | null,
  },
  logs: LogsSubstate,
}

export type Action =  RootAction | LogsAction

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<State, Action>;
