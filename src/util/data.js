/* @flow */

import type {
  ServerDefinition,
  ProcessDefinition,
  HostStatsCollection,
  LatestHostStats,
  MonitorDatum,
  DataType,
} from '../types'

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

/**
 * Incorporates a monitor datum into the latest host stats, ensuring immutability (useful for e.g. redux)
 * TODO: Use immutablejs instead? This is fugly. Or just use some kinda deep clone
 *
 * @param latest
 * @param datum
 * @returns {LatestHostStats}
 */
export function receiveMonitorDatum (latest: LatestHostStats, datum: MonitorDatum): LatestHostStats {
  latest = {...latest}

  const dataType: DataType = datum.type
  const host               = datum.server.ssh.host
  const value              = datum.value

  const latestStatsForHost: HostStatsCollection = {...latest[host]}
  latest[host]                                  = latestStatsForHost

  if (dataType === 'percentageDiskSpaceUsed') {
    const path = datum.extra.path
    if (path) {
      const percentageDiskSpaceUsed              = {...latestStatsForHost.percentageDiskSpaceUsed}
      latestStatsForHost.percentageDiskSpaceUsed = percentageDiskSpaceUsed
      percentageDiskSpaceUsed[path]              = value
    }
  }
  else if (dataType === 'processInfo') {
    const p = datum.extra.process
    if (p) {
      const processInfo              = {...latestStatsForHost.processInfo}
      latestStatsForHost.processInfo = processInfo
      processInfo[p.id]              = value
    }
  }
  else {
    latestStatsForHost[dataType] = value
  }

  return latest
}