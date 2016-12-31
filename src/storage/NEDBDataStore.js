/* @flow */
import type {MonitorDatum, LoggerDatum, NEDBOptions} from '../types/index'
import DataStore from 'nedb'

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
      this.db.insert({...datum, type: 'MonitorDatum'}, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  storeLoggerDatum (datum: LoggerDatum): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.insert({...datum, type: 'LoggerDatum'}, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}