/* @flow */

import type {Server} from '../types'

/**
 * Remove any properties from server config that should never be in the logs e.g. private key
 * @param server
 */
export function cleanServer (server: Server): Object {
  server    = {...server}
  const ssh = {...server.ssh}
  if (ssh) delete ssh.privateKey
  server.ssh = ssh
  return server
}
