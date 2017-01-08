import {assert} from 'chai'
import Monitor from 'lib/monitors/monitor'
import {APIMethod} from './api'
import type {SystemStatFilter} from '../../lib/storage/typedefs'
import {servers} from '../../dev/config'
import server from '../../server/server.babel'
import type {SystemDatum} from '../../lib/typedefs/data'
import env from 'server/env'
import {APIResponse} from 'server/routers/api/typedefs'

describe('/api', function () {
  this.timeout(20000)

  let m: Monitor
  let app

  const operatorDev = servers[0]

  before(async () => {
    m = new Monitor([operatorDev], {rate: 1000})
    await m.start()
    app = server(m, {serveClient: false})
    // Wait for some stats
    await new Promise(resolve => {
      setTimeout(() => resolve(), 1500)
    })
  })

  after(async () => {
    await m.terminate()
    app.close()
  })

  it("success", async () => {
    const method:  APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/api/system/stats', `http://localhost:${env.PORT}`)

    const params: SystemStatFilter = {
      host: operatorDev.ssh.host
    }
    const res: APIResponse<SystemDatum[]> = await method.get(params)

    assert.equal(res.statusCode, 200)
  })

  it("404", async () => {
    const method:  APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/asfat3rf', `http://localhost:${env.PORT}`)

    const params: SystemStatFilter = {
      host: operatorDev.ssh.host
    }
    const res: APIResponse<SystemDatum[]> = await method.get(params)

    assert.equal(res.statusCode, 404)
  })

  it("totally invalid host", async () => {
    const method:  APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/asfat3rf')

    const params: SystemStatFilter = {
      host: operatorDev.ssh.host
    }
    const res: APIResponse<SystemDatum[]> = await method.get(params)

    console.log('detail', res.getDetail())
    console.log('error', res.error)

    assert(res.statusCode === null)
  })
});