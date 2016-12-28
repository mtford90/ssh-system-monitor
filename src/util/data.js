/* @flow */

import type {ServerDefinition, ProcessDefinition, HostStatsCollection} from '../types'

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

export function initLatestStats (servers: ServerDefinition[]): {[host:string]: HostStatsCollection} {
  const latest = {}

  servers.map((s: ServerDefinition) => {
    const host = s.ssh.host

    const paths: string[]                = s.paths || []
    const processes: ProcessDefinition[] = s.processes || []

    const percentageDiskSpaceUsed = {}
    const processInfo             = {}

    paths.forEach((p: string) => {
      percentageDiskSpaceUsed[p] = null
    })

    processes.forEach((p: ProcessDefinition) => {
      processInfo[p.id] = null
    })

    latest[host] = {
      cpuUsage:             null,
      swapUsedPercentage:   null,
      memoryUsedPercentage: null,
      averageLoad:          null,
      percentageDiskSpaceUsed,
      processInfo,
    }
  })
  return latest
}