/* @flow */

import NEDBDataStore from '../storage/NEDBDataStore'
import type {MonitorDatum, LoggerDatum} from '../types/index'

export async function insertMonitorData (data: MonitorDatum[], store?: NEDBDataStore): Promise<NEDBDataStore> {
  const _store = store || new NEDBDataStore() // Default to an in memory store

  await Promise.all(data.map(d => {
    return _store.storeMonitorDatum(d)
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