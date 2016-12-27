import Client from 'ssh2'
import retry from 'retry'

/**
 * Wraps ssh2 connection in a promise
 *
 * @param {object} server - ssh2 server definition
 * @returns {Promise}
 */
export function getClient (server) {
  return new Promise((resolve, reject) => {
    const client = new Client()
    let listener = () => {
      client.removeListener('ready', listener)
      resolve(client)
    }
    client.on('ready', listener)
    client.connect(server)
  })
}

/**
 * @param {Client} client
 * @param {string} cmd
 * @returns {Promise}
 */
export function execute (client, cmd) {
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

/**
 * @param {Client} client
 * @param {string} cmd
 * @param {number} timeout - timeout on command execution before retry in ms
 * @returns {Promise}
 */
export function faultTolerantExecute (client, cmd, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({retries: 5, minTimeout: timeout, maxTimeout: timeout});
    // TODO: Log retry attempts
    operation.attempt(() => {
      execute(client, cmd).then(resolve).catch(err => {
        if (operation.retry(err)) {
          return
        }

        reject(operation.mainError())
      })
    })
  })
}