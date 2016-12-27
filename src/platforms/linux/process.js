/* @flow */

import Client from 'ssh2'
import {faultTolerantExecute} from '../../util/ssh'
import _ from 'lodash'
import moment from 'moment'

const FIELDS = [
  'pid',
  'pcpu',
  'size',
  'etime',
  'user',
  'vsize',
]

// args must always go last
FIELDS.push('args')

export type Process = {
  pid: number,
  pcpu: number,
  size: number,
  etime: number,
  user: string,
  vsize: number,
  started: number,
}

function parse (process: Object) : Process | null {
  const zipped = _.zipObject(FIELDS, process)

  if (zipped.pid) {
    zipped.pid   = parseInt(zipped.pid)
    zipped.size  = parseInt(zipped.size)
    zipped.vsize = parseInt(zipped.vsize)
    zipped.pcpu  = parseFloat(zipped.pcpu)

    const yo = zipped.etime.split('-')
    let days = 0

    if (yo.length === 2) {
      days = yo[0]
    }

    const durationString = _.last(yo)

    const ms = moment.duration(durationString).add({days}).asMilliseconds()

    zipped.etime   = ms
    zipped.started = Date.now() - ms

    return zipped
  }

  return null
}

export async function info (client: Client, grep: string): Promise<Process[]> {
  const cmd = `ps --no-headers -Ao "${FIELDS.join(',')}" | grep ${grep}`

  const data = await faultTolerantExecute(
    client,
    cmd
  )

  const results = data.split('\n').map(line => {
    const arr   = _.compact(line.split(' '))
    const other = arr.slice(0, FIELDS.length - 1)
    const args  = arr.slice(FIELDS.length - 1, arr.length)
    return [...other, args.join(' ')]
  })

  return _.chain(results).map(parse).compact().value()
}

