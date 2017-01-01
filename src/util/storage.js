/* @flow */

import NEDBDataStore from '../storage/NEDBDataStore'
import type {MonitorDatum, LoggerDatum} from '../types/index'

export async function insertMonitorData (data: MonitorDatum[], store: NEDBDataStore): Promise<NEDBDataStore> {
  await Promise.all(data.map(d => {
    return store.storeMonitorDatum(d)
  }))

  return store
}

export async function insertLogData (data: LoggerDatum[], store: NEDBDataStore): Promise<NEDBDataStore> {
  await Promise.all(data.map(d => {
    return store.storeLoggerDatum(d)
  }))

  return store
}