import chai from 'chai'
import * as config from './config'
import {constructPool} from './pool'
import _ from 'lodash'
import {cpuUsage} from './commands'

const assert = chai.assert

describe('pool', () => {
  let pool

  before(() => {
    pool = constructPool(config.servers[0])
  })

  it("acquire a client", async () => {
    const client = await pool.acquire()

    const usage = await cpuUsage(client)

    console.log('usage', usage)

    assert(_.isNumber(usage) && !_.isNaN(usage))
  })
})