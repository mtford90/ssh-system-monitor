import chai from 'chai'
import nedbMonitor from '../monitors/nedbMonitor'
import api from './index'
import * as http from '../util/http'
import {servers} from '../../examples/config'

const assert = chai.assert

function once (emitter, event) {
  return new Promise(resolve => {
    emitter.on(event, (x, y, z) => {
      resolve(x, y, z)
    })
  })
}

describe('/api', function () {
  this.timeout(5000)

  let m   = null
  let app = null

  before(() => {
    m   = nedbMonitor(servers, {rate: 250})
    app = api(m)
  })

  after(async () => {
    app.close()
    await m.terminate()
  })

  it("latest stat for all hosts", async () => {
    const data = await once(m, 'data')
    const stat = data.type
    const body = await http.get(`http://localhost:3000/api/latest/${stat}`)
    console.log('responseBody', body)
    console.log('m.latest', m.latest)
    const host          = data.server.ssh.host
    const monitorValue  = m.latest[host][stat]
    const returnedValue = body.data[host]
    assert.equal(monitorValue, returnedValue)
  })

  it("latest stat for a host", async () => {
    const data   = await once(m, 'data')
    const stat   = data.type
    const host   = data.server.ssh.host
    const body   = await http.get(`http://localhost:3000/api/latest/${stat}`, {host: host})
    const latest = m.latest

    const monitorValue  = latest[host][stat]
    const returnedValue = body.value

    console.log('responseBody', body)
    console.log('m.latest', m.latest)

    console.log('monitorValue', monitorValue)
    console.log('returnedValue', returnedValue)

    assert(monitorValue)
    assert(returnedValue)
    assert.equal(monitorValue, returnedValue)
  })

  it("config", async () => {
    const body = await http.get(`http://localhost:3000/api/config`)
    console.log('responseBody', body)
  })
})