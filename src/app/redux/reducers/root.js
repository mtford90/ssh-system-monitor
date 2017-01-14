/* @flow */

import type {ServerDefinition, SystemDatum} from 'lib/typedefs/data'

export type RootAction =  {
  type: 'root/RECEIVE_MONITOR_DATUM',
  datum: SystemDatum<*>,
}

export type RootSubstate = {
  config: ServerDefinition[],
}

export const DefaultRootSubstate: RootSubstate = {
  config: [],
  stats: {},
}

export default function (state: RootSubstate = DefaultRootSubstate, action: RootAction): RootSubstate {
  switch (action.type) {
    case 'root/RECEIVE_STATS':
      return {
        ...state,
        id: action.id,
        data: action.data,
      }
    default:
      return state
  }
}
