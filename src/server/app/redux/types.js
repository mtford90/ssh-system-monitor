import type {Store as ReduxStore, Dispatch as ReduxDispatch} from 'redux'
import type {RootSubstate, RootAction} from './reducers/root'
import type {LogsSubstate, LogsAction} from './reducers/logs'

export type State = {
  root: RootSubstate,
  logs: LogsSubstate,
}

export type Action = RootAction | LogsAction

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<State, Action>;