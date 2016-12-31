/* @flow */
import type {MonitorDatum, LoggerDatum, NEDBOptions} from '../types/index'
import DataStore from 'nedb'
import type {SSHDataStoreQueryLogsParams, SSHDataStoreQuerySystemStatsParams} from './DataStore'

export default class NEDBDataStore {
  db: DataStore

  constructor (opts?: NEDBOptions = {}) {
    this.db = new DataStore(opts)
  }

  init (indices: string[]): Promise<void> {
    return this._ensureIndices(['value', 'type', 'host']).catch(err => {
      console.log("error configuring indices", err)
    })
  }

  _ensureIndex (fieldName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.ensureIndex({fieldName}, err => {
        if (err) {
          console.log(`error creating index for ${fieldName}`)
          reject(err)
        }
        else {
          // TODO
          console.log(`Created index for ${fieldName}`)
          resolve()
        }
      })
    })
  }

  _ensureIndices (fieldNames: string[]): Promise<void[]> {
    return Promise.all(fieldNames.map((fieldName: string) => this._ensureIndex(fieldName)))
  }

  storeMonitorDatum (datum: MonitorDatum): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.insert(datum, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  storeLoggerDatum (datum: LoggerDatum): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.insert(datum, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  queryLogs (params?: SSHDataStoreQueryLogsParams = {}): Promise<LoggerDatum[]> {
    return new Promise((resolve, reject) => {
      const q = {
        logger: {
          $exists: true,
        }
      }

      this.db.find(q, function (err, docs: LoggerDatum[]) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  querySystemStats (params?: SSHDataStoreQuerySystemStatsParams = {}): Promise<MonitorDatum[]> {
    return new Promise((resolve, reject) => {
      const q: Object = {
        type:  {
          $exists: true,
        },
        value: {
          $exists: true,
        },
      }

      const timestamp = params.timestamp
      if (timestamp) {
        q.timestamp = {}
        if (timestamp.gt) {
          q.timestamp.$gt = timestamp.gt
        }
        if (timestamp.gte) {
          q.timestamp.$gte = timestamp.gte
        }
        if (timestamp.lt) {
          q.timestamp.$lt = timestamp.lt
        }
        if (timestamp.lte) {
          q.timestamp.$lte = timestamp.lte
        }
      }

      this.db.find(q, function (err, docs: MonitorDatum[]) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }
}