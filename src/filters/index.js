/* @flow */
import type {LoggerDatum, SystemDatum} from '../../common/typedefs'
import type {SystemStatFilter, LogFilter} from '../storage/DataStore'
import _ from 'lodash'

export function filterLogs (logs: LoggerDatum[], filter?: LogFilter = {}): LoggerDatum[] {
  return logs.filter((loggerDatum: LoggerDatum) => {
    const timestamp = filter.timestamp

    if (timestamp) {
      const {gt, gte, lt, lte} = timestamp

      if (gt) {
        if (loggerDatum.timestamp <= gt) return false
      }

      if (gte) {
        if (loggerDatum.timestamp < gte) return false
      }

      if (lt) {
        if (loggerDatum.timestamp >= lt) return false
      }

      if (lte) {
        if (loggerDatum.timestamp > lte) return false
      }
    }

    const name = filter.name

    if (name) {
      if (loggerDatum.logger.name !== name) return false
    }

    const source = filter.source

    if (source) {
      if (loggerDatum.source !== source) return false
    }

    const host = filter.host

    if (host) {
      if (loggerDatum.server.ssh.host !== host) return false
    }

    let text = filter.text

    if (text) {
      let regex: RegExp
      if (text instanceof RegExp) {
        regex = text
      }
      else {
        regex = new RegExp(text)
      }

      if (!regex.test(loggerDatum.text)) return false
    }

    return true
  })
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