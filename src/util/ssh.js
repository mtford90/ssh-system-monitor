/* @flow */

import Client from 'ssh2'
import retry from 'retry'
import type {SSH2Options} from '../types/index'
import InternalLogging from '../internalLogging'

const log = InternalLogging.platforms.linux.system

export function getClient (opts: SSH2Options): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client()

    let removeListeners = function () {
      client.removeListener('ready', listener)
      client.removeListener('error', errorListener)
    }

    let listener = () => {
      removeListeners()
      resolve(client)
    }

    let errorListener = err => {
      removeListeners()
      reject(err)
    }

    client.on('ready', listener)
    client.on('error', errorListener)
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
    const host = client.config.host

    log.trace(`Executing \`${cmd}\` on ${host}`)

    client.exec(cmd, (err, stream) => {
      if (err) reject(err)
      else {
        let _data = ''

        stream = stream.on('close', function (code) {
          if (code === 0) {
            log.trace(`Executed \`${cmd}\` on host ${host}: ${_data}`)
            resolve(_data)
          }
          else {
            log.warn(`Failed to execute \`${cmd}\` on host ${host} - exited with code ${code}`)
          }
        })

        stream = stream.on('data', function (data) {
          const str = data.toString()
          _data += str
        })

        stream = stream.stderr.on('data', function (data) {
          const errString = JSON.stringify(data.toString())
          reject(new Error(`error executing ${cmd}: ${errString}`))
        })
      }
    })
  })
}

export function faultTolerantExecute (client: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const operation = retry.operation();
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