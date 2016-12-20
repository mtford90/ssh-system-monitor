import chai from 'chai'
import * as config from './config'
import Client from 'ssh2'
import * as commands from './commands'
import _ from 'lodash'

const assert = chai.assert

function getConnection (server) {
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

describe('commands', function () {
  this.timeout(10000)

  let conn = null

  before(async () => {
    let server = config.servers[0].ssh
    conn       = await getConnection(server)
  })

  after(() => {
    conn.end()
  })

  it('cpuUsage', async () => {
    const usage = await commands.cpuUsage(conn)

    console.log('cpuUsage', usage)

    assert(_.isNumber(usage))
    assert(!_.isNaN(usage))
    assert(usage > 0 && usage <= 1)
  })

  it('memoryInfo', async () => {
    const info = await commands.memoryInfo(conn)

    console.log('info', info)

    assert(_.isObject(info))
  })

  it('swapUsedPercentage', async () => {
    const perc = await commands.swapUsedPercentage(conn)

    console.log('perc', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })

  it('memoryUsedPercentage', async () => {
    const perc = await commands.memoryUsedPercentage(conn)

    console.log('memoryUsed', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })

  it('averageLoad', async () => {
    const load = await commands.averageLoad(conn)

    console.log('load', load)

    assert(_.isObject(load))
    assert(_.isNumber(load['1']))
    assert(_.isNumber(load['5']))
    assert(_.isNumber(load['15']))
    assert(!_.isNaN(load['1']))
    assert(!_.isNaN(load['5']))
    assert(!_.isNaN(load['15']))
  })

  it('percentage used', async () => {
    const perc = await commands.percentageDiskSpaceUsed(conn, '/')

    console.log('perc', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })
})