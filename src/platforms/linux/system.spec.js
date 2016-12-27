import chai from 'chai'
import * as commands from './system'
import _ from 'lodash'
import {servers} from '../../../examples/config'
import {getClient} from '../../util/ssh'

const assert = chai.assert

describe('system', function () {
  this.timeout(20000)

  let conn = null

  before(async () => {
    let server = servers[0].ssh
    conn       = await getClient(server)
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