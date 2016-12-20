import chai from 'chai'
import * as config from './config'
import {constructPool} from './pool'
import _ from 'lodash'
import {cpuUsage} from './commands'

const assert = chai.assert

describe('pool', function () {
  this.timeout(5000)

  let pool

  before(() => {
    pool = constructPool(config.servers[0])
  })

  after(async () => {
    await pool.drain()
    pool.clear()
  })

  it("acquire a client", async () => {
    const client = await pool.acquire()

    const usage = await cpuUsage(client)

    await pool.release(client)

    console.log('usage', usage)

    assert(_.isNumber(usage) && !_.isNaN(usage))
  })
})