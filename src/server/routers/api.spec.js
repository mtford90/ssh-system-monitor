import chai from 'chai'
import NEDBMonitor from '../../monitors/nedbMonitor'
import api from '../server.babel'
import * as http from '../../util/http'
import {servers} from '../../../examples/config'
import env from '../env'

const assert = chai.assert

function once (emitter, event) {
  return new Promise(resolve => {
    emitter.on(event, (x, y, z) => {
      resolve(x, y, z)
    })
  })
}

describe('/api', function () {
  this.timeout(20000)

  let m   = null
  let app = null

  before(() => {
    m   = new NEDBMonitor(servers, {rate: 250})
    app = api(m)
  })

  after(async () => {
    app.close()
    await m.terminate()
  })

  it("latest stat for all hosts", async () => {
    const data = await once(m, 'data')
    const stat = data.type
    const body = await http.getJSON(`http://localhost:${env.PORT}/api/latest/${stat}`)
    console.log('responseBody', body)
    console.log('m.latest', m.latest)
    const host          = data.server.ssh.host
    const monitorValue  = m.latest[host][stat]
    const returnedValue = body.data[host]
    assert.equal(monitorValue['1'], returnedValue['1'])
    assert.equal(monitorValue['5'], returnedValue['5'])
    assert.equal(monitorValue['15'], returnedValue['15'])
  })

  it("latest stat for a host", async () => {
    const data   = await once(m, 'data')
    const stat   = data.type
    const host   = data.server.ssh.host
    const body   = await http.getJSON(`http://localhost:${env.PORT}/api/latest/${stat}`, {host: host})
    const latest = m.latest

    const monitorValue  = latest[host][stat]
    const returnedValue = body.value

    console.log('responseBody', body)
    console.log('m.latest', m.latest)

    console.log('monitorValue', monitorValue)
    console.log('returnedValue', returnedValue)

    assert(monitorValue !== undefined && monitorValue !== null)
    assert(returnedValue !== undefined && returnedValue !== null)
    assert.equal(monitorValue, returnedValue)
  })

  it("config", async () => {
    const body = await http.getJSON(`http://localhost:${env.PORT}/api/config`)
    console.log('responseBody', body)
  })
})