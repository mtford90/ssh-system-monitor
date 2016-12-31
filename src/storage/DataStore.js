/* @flow */
import type {MonitorDatum, LoggerDatum, LogSource, DataType} from '../types/index'

type TimestampQueryParams = {
  gt?: number,
  lt?: number,
  lte?: number,
  gte?: number,
}

export type SSHDataStoreQueryLogsParams = {
  name?: string,
  source?: LogSource,
  timestamp?: TimestampQueryParams,
  host?: string,
  name?: string,
}

export type SSHDataStoreQuerySystemStatsParams = {
  name?: string,
  host?: string,
  type?: DataType,
  extra?: {
    path?: string,
    process?: {
      id?: string,
    }
  },
  timestamp?: TimestampQueryParams
}

export interface SSHDataStore {
  init(indices: string[]) : Promise<void>;
  storeMonitorDatum(datum: MonitorDatum) : Promise<void>;
  storeLoggerDatum(datum: LoggerDatum) : Promise<void>;
  queryLogs(params?: SSHDataStoreQueryLogsParams) : Promise<LoggerDatum[]>;
  querySystemStats(params?: SSHDataStoreQuerySystemStatsParams) : Promise<MonitorDatum[]>;
}