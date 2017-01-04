/* @flow */
import type {LoggerDatum, SystemDatum} from '../types/index'
import type {SystemStatFilter, LogFilter} from '../storage/DataStore'
import _ from 'lodash'

export function filterLogs (logs: LoggerDatum[], filter?: LogFilter = {}): LoggerDatum[] {
  return logs
}

export function filterSystemStats (stats: SystemDatum[], filter?: SystemStatFilter = {}): SystemDatum[] {
  const timestamp = filter.timestamp

  return stats.filter((s: SystemDatum) => {
    if (timestamp) {
      const {gt, gte, lt, lte} = timestamp

      if (gt) {
        if (s.timestamp <= gt) return false
      }

      if (gte) {
        if (s.timestamp < gte) return false
      }

      if (lt) {
        if (s.timestamp >= lt) return false
      }

      if (lte) {
        if (s.timestamp > lte) return false
      }
    }

    const name = filter.name

    if (name) {
      if (s.server.name !== name) return false
    }

    const type = filter.type

    if (type) {
      if (s.type !== type) return false
    }

    const host = filter.host

    if (host) {
      if (s.server.ssh.host !== host) return false
    }

    const extra = filter.extra

    if (extra) {
      const path = extra.path

      if (path) {
        if (s.extra.path !== path) return false
      }
      
      const process = extra.process
      
      if (process) {
        const processId = process.id
        if (processId) {
          if (s.extra.process) {
            if (s.extra.process.id !== processId) {
              return false
            }
          }
          else {
            return false
          }
        }
      }
    }

    return true
  })
}