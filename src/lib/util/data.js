/* @flow */

import type {
  ServerDefinition,
} from '../typedefs/data'

/**
 * Remove any properties from server config that should never be in the logs e.g. private key
 * @param server
 */
export function cleanServer (server: ServerDefinition): Object {
  server    = {...server}
  const ssh = {...server.ssh}
  if (ssh) delete ssh.privateKey
  server.ssh = ssh
  return server
}