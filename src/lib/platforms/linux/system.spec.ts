import * as chai from 'chai'
import * as commands from './system'
import * as _ from 'lodash'
import {getClient} from '../../util/ssh'
import {Client} from "ssh2";
import {servers} from "../../../dev/config";

const assert = chai.assert

describe('system', function () {
  this.timeout(20000)

  let client: Client

  before(async () => {
    let server = servers[0].ssh
    client       = await getClient(server)
  })

  after(() => {
    if (client) {
      client.end()
    }
  })

  it('cpuUsage', async () => {
    const usage = await commands.cpuUsage(client)

    console.log('cpuUsage', usage)

    assert(_.isNumber(usage))
    assert(!_.isNaN(usage))
    assert(usage > 0 && usage <= 1)
  })

  it('memoryInfo', async () => {
    const info = await commands.memoryInfo(client)

    console.log('info', info)

    assert(_.isObject(info))
  })

  it('swapUsedPercentage', async () => {
    const perc = await commands.swapUsedPercentage(client)

    console.log('perc', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })

  it('memoryUsedPercentage', async () => {
    const perc = await commands.memoryUsedPercentage(client)

    console.log('memoryUsed', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })

  it('averageLoad', async () => {
    const load = await commands.averageLoad(client)

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
    const perc = await commands.percentageDiskSpaceUsed(client, '/')

    console.log('perc', perc)

    assert(_.isNumber(perc))
    assert(!_.isNaN(perc))
  })
})