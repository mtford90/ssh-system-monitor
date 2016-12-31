/* @flow */
import type {MonitorDatum, LoggerDatum} from '../types/index'

export interface SSHDataStore {
  init(indices: string[]) : Promise<void>;
  storeMonitorDatum(datum: MonitorDatum) : Promise<void>;
  storeLoggerDatum(datum: LoggerDatum) : Promise<void>;
}