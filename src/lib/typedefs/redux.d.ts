import {Dispatch as ReduxDispatch} from 'redux'
import {RootSubstate, RootAction} from 'app/redux/reducers/root'
import {LogsSubstate, LogsAction} from 'app/redux/reducers/logs'

export type State = {
  root: RootSubstate,
  routing: {
    locationBeforeTransitions: string | null,
  },
  logs: LogsSubstate,
}

export type Action =  RootAction | LogsAction

export type Dispatch = ReduxDispatch<Action>;