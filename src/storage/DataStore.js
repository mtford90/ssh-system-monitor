/* @flow */
import type {SystemDatum, LoggerDatum, LogSource, DataType} from '../types/index'

export type TimestampQueryParams = {
  gt?: number,
  lt?: number,
  lte?: number,
  gte?: number,
}

export type LogFilter = {
  source?: LogSource,
  timestamp?: TimestampQueryParams,
  host?: string,
  name?: string,
  text?: RegExp | string,
}

export type SystemStatFilter = {
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
  queryLogs(params?: LogFilter) : Promise<LoggerDatum[]>;
  querySystemStats(params?: SystemStatFilter) : Promise<SystemDatum[]>;
}