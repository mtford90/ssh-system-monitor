import chai from 'chai'
import {constructPool} from './index'
import _ from 'lodash'
import {cpuUsage} from '../platforms/linux/system'
import {servers} from '../../examples/config'

const assert = chai.assert

describe('pool', function () {
  this.timeout(20000)

  let pool

  before(() => {
    pool = constructPool(servers[0])
  })

  after(async () => {
    await pool.terminate()
  })

  it("acquire a client", async () => {
    const client = await pool.acquire()

    const usage = await cpuUsage(client)

    await pool.release(client)

    console.log('usage', usage)

    assert(_.isNumber(usage) && !_.isNaN(usage))
  })
})