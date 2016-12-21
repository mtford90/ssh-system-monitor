/**
 * A monitor that inserts all data into an nedb instance
 */

import {monitor} from './monitor'
import DataStore from 'nedb'

/**
 * @param {object[]} servers - a list of server configurations
 * @param {object} [opts]
 * @param {object} [opts.nedb] - options passed to nedb
 * @returns {function(): *} - call to stop the monitor
 */
export default function (servers, opts = {}) {
  const m = monitor(servers, opts)

  const nedbOpts = {
    ...(opts.nedb || {})
  }

  const db = new DataStore(nedbOpts)

  const ensureIndex = function (fieldName) {
    return new Promise((resolve, reject) => {
      db.ensureIndex({fieldName}, err => {
        if (err) {
          console.log(`error creating index for ${fieldName}`)
          reject(err)
        }
        else {
          console.log(`Created index for ${fieldName}`)
          resolve()
        }
      })
    })
  }

  Promise.all([
    ensureIndex('value'),
    ensureIndex('type'),
    ensureIndex('host'),
  ]).then(() => {
    console.log('created all indices')
  }).catch(err => {
    console.log('error creating indices', err.stack)
  })

  m.on('data', data => {
    data = {...data}

    const server = data.server
    const ssh    = server.ssh

    if (ssh) {
      data.host = ssh.host
    }

    db.insert(data, (err, doc) => {
      if (err) {
        console.log('Error inserting into nedb', err.stack) // TODO
        m.emit('error', {type: 'nedb', err})
      }
      else {
        console.log('inserted into nedb', doc)
      }
    })
  })

  m.database = db

  return m
}