/* @flow */

import NEDBDataStore from '../storage/NEDBDataStore'
import type {SystemDatum, LoggerDatum} from '../typedefs/data'

export async function insertMonitorData (data: SystemDatum<any>[], store?: NEDBDataStore): Promise<NEDBDataStore> {
  const _store = store || new NEDBDataStore() // Default to an in memory store

  await Promise.all(data.map(d => {
    return _store.storeSystemDatum(d)
  }))

  return _store
}

export async function insertLogData (data: LoggerDatum[], store?: NEDBDataStore): Promise<NEDBDataStore> {
  const _store = store || new NEDBDataStore() // Default to an in memory store

  await Promise.all(data.map(d => {
    return _store.storeLoggerDatum(d)
  }))

  return _store
}