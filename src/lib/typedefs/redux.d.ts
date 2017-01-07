import {RootSubstate, RootAction} from '../../app/reducers/root'
import {LogsSubstate, LogsAction} from '../../app/reducers/logs'

export type State = {
  root: RootSubstate,
  routing: {
    locationBeforeTransitions: string | null,
  },
  logs: LogsSubstate,
}

export type Action =  RootAction | LogsAction

export type Dispatch = (action: Action | ((d: Dispatch) => any)) => Action