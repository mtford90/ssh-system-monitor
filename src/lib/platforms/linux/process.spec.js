/* @flow */

import chai from 'chai'
import * as process from './process'
import _ from 'lodash'
import {servers} from 'dev/config'
import {getClient} from '../../util/ssh'
import {after, before, describe, it} from 'mocha'

const assert = chai.assert

describe('process', function () {
  this.timeout(20000)

  let client = null

  before(async () => {
    let server = servers[0].ssh
    client     = await getClient(server)
  })

  after(() => {
    if (client) {
      client.end()
    }
  })

  it('process info', async () => {
    const processes = await process.info(client, 'node')
    console.log('res', processes)
    assert(processes.length)
  })
})