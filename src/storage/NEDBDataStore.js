/* @flow */
import type {SystemDatum, LoggerDatum, NEDBOptions} from '../../common/typedefs'
import DataStore from 'nedb'
import type {LogFilter, SystemStatFilter, TimestampQueryParams} from './DataStore'
import InternalLogging from '../internalLogging'
import _ from 'lodash'

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

const log = InternalLogging.storage.NEDBDataStore

export default class NEDBDataStore {
  db: DataStore

  constructor (opts?: NEDBOptions = {}) {
    this.db = new DataStore(opts)
  }

  init (): Promise<void> {
    return this._ensureIndices(INDICES).catch(err => {
      log.error("Error configuring indices", err.stack)
    })
  }

  _ensureIndex (fieldName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.ensureIndex({fieldName}, err => {
        if (err) {
          log.error(`error creating index for ${fieldName}`)
          reject(err)
        }
        else {
          log.trace(`Created index for ${fieldName}`)
          resolve()
        }
      })
    })
  }

  _ensureIndices (fieldNames: string[]): Promise<void[]> {
    return Promise.all(fieldNames.map((fieldName: string) => this._ensureIndex(fieldName)))
  }

  storeSystemDatum (datum: SystemDatum): Promise<void> {
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

  queryLogs (params?: LogFilter = {}): Promise<LoggerDatum[]> {
    return new Promise((resolve, reject) => {
      const q: Object = {
        logger: {
          $exists: true,
        }
      }

      const {name, source, timestamp, host, text} = params

      if (timestamp) {
        this._constructTimestampQuery(q, timestamp)
      }

      if (name) {
        q['logger.name'] = name
      }

      if (source) {
        q['source'] = source
      }

      if (host) {
        q['server.ssh.host'] = host
      }

      if (text) {
        if (_.isString(text)) {
          q.text = new RegExp(text)
        }
        else {
          q.text = text
        }
      }

      log.trace(`querying logs`, JSON.stringify(q))

      this.db.find(q, function (err, docs: LoggerDatum[]) {
        if (err) {
          log.debug(`Error querying logs`, JSON.stringify(q), err.stack)
          reject(err)
        }
        else {
          log.debug(`queried logs successfully`, JSON.stringify(docs))
          resolve(docs)
        }
      })
    })
  }

  querySystemStats (params?: SystemStatFilter = {}): Promise<SystemDatum[]> {
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
        this._constructTimestampQuery(q, timestamp)
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

      this.db.find(q, function (err, docs: SystemDatum[]) {
        if (err) reject(err)
        else resolve(docs)
      })
    })
  }

  _constructTimestampQuery (q: Object, timestamp: TimestampQueryParams) {
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
}