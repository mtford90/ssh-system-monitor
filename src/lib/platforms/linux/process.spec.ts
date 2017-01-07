import * as chai from 'chai'
import * as process from './process'
import {getClient} from '../../util/ssh'
import {Client} from "ssh2";
import {servers} from "../../../dev/config";

const assert = chai.assert

describe('process', function () {
  this.timeout(20000)

  let client: Client

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