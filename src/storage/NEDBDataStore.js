/* @flow */
import type {MonitorDatum, LoggerDatum, NEDBOptions} from '../types/index'
import DataStore from 'nedb'
import type {SSHDataStoreQueryLogsParams, SSHDataStoreQuerySystemStatsParams} from './DataStore'

const INDICES = [
  'type',
  'value',
  'timestamp',
  'server.name',
  'server.ssh.host',
  'type',
  'extra.path',
  'extra.process.id',
]

export default class NEDBDataStore {
  db: DataStore

  constructor (opts?: NEDBOptions = {}) {
    this.db = new DataStore(opts)
  }

  init (): Promise<void> {
    return this._ensureIndices(INDICES).catch(err => {
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

      const {timestamp, name, host, type, extra} = params

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

      if (name) {
        q['server.name'] = name
      }

      if (host) {
        q['server.ssh.host'] = host
      }

      if (type) {
        q['type'] = type
      }

      if (extra) {
        if (extra.path) {
          q['extra.path'] = extra.path
        }

        if (extra.process) {
          if (extra.process.id) {
            q['extra.process.id'] = extra.process.id
          }
        }
      }

      console.log('q', q)

      this.db.find(q, function (err, docs: MonitorDatum[]) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }
}