/* @flow */

import Client from 'ssh2'
import retry from 'retry'
import type {SSH2Options} from '../types/index'

export function getClient (opts: SSH2Options): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client()
    let listener = () => {
      client.removeListener('ready', listener)
      resolve(client)
    }
    client.on('ready', listener)
    client.connect(opts)
  })
}

/**
 * @param {Client} client
 * @param {string} cmd
 * @returns {Promise}
 */
export function execute (client: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.exec(cmd, (err, stream) => {
      if (err) reject(err)
      else {
        stream.on('data', function (data) {
          resolve(data.toString())
        }).stderr.on('data', function (data) {
          const errString = JSON.stringify(data.toString())
          reject(new Error(`error executing ${cmd}: ${errString}`))
        })
      }
    })
  })
}

export function faultTolerantExecute (client: Client, cmd: string, timeout: number = 5000): Promise<string> {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({retries: 5, minTimeout: timeout, maxTimeout: timeout});
    // TODO: Log retry attempts
    operation.attempt(() => {
      execute(client, cmd).then((str: string) => {
        resolve(str)
      }).catch(err => {
        if (operation.retry(err)) {
          return
        }

        reject(operation.mainError())
      })
    })
  })
}