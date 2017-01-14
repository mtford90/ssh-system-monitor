/* @flow */
import type {LoggerDatum, SystemDatum, DataType, DiskspaceUsedValue} from '../typedefs/data'
import type {SystemStatFilter, LogFilter} from 'lib/storage/typedefs'

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

export function filterSystemStats (stats: SystemDatum<mixed>[], filter?: SystemStatFilter = {}): SystemDatum<*>[] {
  const timestamp = filter.timestamp
  const filterType: ? DataType = filter.type

  return stats.filter((s: SystemDatum<mixed>) => {
    const datumType = s.type

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


    if (filterType) {
      if (datumType !== filterType) return false
    }

    const host = filter.host

    if (host) {
      if (s.server.ssh.host !== host) return false
    }

    const filterValue = filter.value

    if (filterValue) {
      const filterPath: ? string = filterValue.path

      if (filterPath) {
        if (typeof s.value === 'object' && s.value) {
          const {path, perc} = s.value
          if (typeof path === 'string' && typeof perc === 'number') {
            const diskSpaceVal: DiskspaceUsedValue = {
              perc,
              path,
            }
            if (diskSpaceVal.path !== filterPath) return false
          }
          else {
            return false
          }
        }
        else {
          return false
        }
      }

      const filterProcess = filterValue.process

      if (filterProcess) {
        const filterProcessId = filterProcess.id
        if (filterProcessId) {
          const datumValue = s.value

          if (datumValue && typeof datumValue === 'object') {
            const {processId} = datumValue
            if (typeof processId === 'string') {
              if (processId !== filterProcessId) {
                return false
              }
            }
          }
        }
      }
    }

    return true
  })
}
