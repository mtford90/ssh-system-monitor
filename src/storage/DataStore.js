/* @flow */
import type {SystemDatum, LoggerDatum, LogSource, DataType} from '../types/index'

export type TimestampQueryParams = {
  gt?: number,
  lt?: number,
  lte?: number,
  gte?: number,
}

export type SSHDataStoreQueryLogsParams = {
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
  init() : Promise<void>;
  storeSystemDatum(datum: SystemDatum) : Promise<void>;
  storeLoggerDatum(datum: LoggerDatum) : Promise<void>;
  queryLogs(params?: SSHDataStoreQueryLogsParams) : Promise<LoggerDatum[]>;
  querySystemStats(params?: SSHDataStoreQuerySystemStatsParams) : Promise<SystemDatum[]>;
}