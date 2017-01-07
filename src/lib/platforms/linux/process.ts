import {Client} from 'ssh2'
import {faultTolerantExecute} from '../../util/ssh'
import _ from 'lodash'
import moment from 'moment'
import {ProcessInfo} from '../../typedefs/data'

const FIELDS = [
  'pid',
  'pcpu',
  'size', // Measure of how many pages have been modified
  'rss', // Portion of process that happens to be using real memory at the moment
  'vsize', // Main measure of process size
  'etime',
  'user',
]

// args must always go last
FIELDS.push('args')


function parse (process: Object[]): ProcessInfo | null {
  const zipped = _.zipObject(FIELDS, process)

  if (zipped.pid) {
    zipped.pid   = parseInt(zipped.pid)
    zipped.size  = parseInt(zipped.size)
    zipped.vsize = parseInt(zipped.vsize)
    zipped.pcpu  = parseFloat(zipped.pcpu)
    zipped.rss   = parseFloat(zipped.rss)

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

export async function info (client: Client, grep: string): Promise<ProcessInfo[]> {
  const cmd = `ps --no-headers -Ao "${FIELDS.join(',')}" | grep "${grep}" | grep -v grep`

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
