import chai from 'chai'
import * as process from './process'
import _ from 'lodash'
import {servers} from '../../../examples/config'
import {getClient} from '../../util/ssh'

const assert = chai.assert

describe('process', function () {
  this.timeout(10000)

  let client = null

  before(async () => {
    let server = servers[0].ssh
    client     = await getClient(server)
  })

  after(() => {
    client.end()
  })

  it('process info', async () => {
    const processes = await process.info(client, 'node')
    console.log('res', processes)
    assert(processes.length)
  })
})