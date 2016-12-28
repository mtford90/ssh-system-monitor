/** @flow **/

/**
 * A monitor that inserts all data into an nedb instance
 */

import Monitor from './monitor'
import DataStore from 'nedb'
import type {MonitorOptions} from './monitor'
import type {ServerDefinition} from '../types'

// https://github.com/louischatriot/nedb
type NEDBOptions = {
  filename?: string,
  inMemoryOnly?: boolean,
  timestampData?: boolean,
  autoload?: boolean,
  afterSerialization?: (data: string) => string,
  beforeDeserialization?: (data: string) => string,
  corruptAlertThreshold?: number,
  compareStrings?: (a: string, b: string) => -1 | 0 | 1,
}


export default class NEDBMonitor extends Monitor {
  db: DataStore

  constructor (servers: ServerDefinition[], monitorOptions?: MonitorOptions, nedbOptions?: NEDBOptions) {
    super(servers, monitorOptions)
    this.db = new DataStore(nedbOptions)
    this.ensureIndices(['value', 'type', 'host']).catch(err => {
      console.log("error configuring indices", err)
    })

    this.on('data', data => {
      data = {...data}

      const server = data.server
      const ssh    = server.ssh

      if (ssh) {
        data.host = ssh.host
      }

      this.db.insert(data, (err, doc) => {
        if (err) {
          console.log('Error inserting into nedb', err.stack) // TODO
          this.emit('error', {type: 'nedb', err})
        }
        else {
          // TODO
          // console.log('inserted into nedb', doc)
        }
      })
    })
  }

  ensureIndex (fieldName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.ensureIndex({fieldName}, err => {
        if (err) {
          console.log(`error creating index for ${fieldName}`)
          reject(err)
        }
        else {
          // TODO
          // console.log(`Created index for ${fieldName}`)
          resolve()
        }
      })
    })
  }

  ensureIndices (fieldNames: string[]): Promise<void[]> {
    return Promise.all(fieldNames.map((fieldName: string) => this.ensureIndex(fieldName)))
  }
}

