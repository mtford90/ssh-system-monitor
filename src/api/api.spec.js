import chai from 'chai'
import * as config from '../config'
import nedbMonitor from '../monitors/nedbMonitor'
import api from './index'
import * as http from '../util/http'

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
    m   = nedbMonitor(config.servers, {rate: 250})
    app = api(m)
  })

  after(async () => {
    app.close()
    await m.terminate()
  })

  it("monitor servers", async () => {
    const data = await once(m, 'data')
    const stat = 'swapUsedPercentage'
    const body = await http.get(`http://localhost:3000/api/latest/${stat}`)
    console.log('responseBody', body)
    console.log('m.latest', m.latest)
    const host = data.server.ssh.host
    const value = m.latest[host][stat]
    assert.equal(value, body.data[host])
  })


})