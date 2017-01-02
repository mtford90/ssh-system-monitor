/* @flow */

import chai from 'chai'
import server from '../server.babel'
import * as http from '../../util/http'
import {servers} from '../../../examples/config'
import env from '../env'
import Monitor from '../../monitors/monitor'
import {after, it, before, describe} from 'mocha'
import type {SSHDataStoreQuerySystemStatsParams} from '../../storage/DataStore'
import {insertMonitorData} from '../../util/storage'
import type {MonitorDatum} from '../../types/index'
import EventEmitter from 'events'

const assert = chai.assert

function once (emitter: EventEmitter, event: string,): Promise<*> {
  return new Promise(resolve => {
    emitter.on(event, (x: *) => {
      resolve(x)
    })
  })
}

describe('/api', function () {
  this.timeout(20000)

  let m: Monitor
  let app

  before(async () => {
    const operatorDev = servers[0]
    m                 = new Monitor([operatorDev], {rate: 1000})
    await m.start()
    app = server(m, {serveClient: false})
  })

  after(async () => {
    await m.terminate()
    app.close()
  })

  it("latest stat for all hosts", async () => {
    const data          = await once(m, 'data')
    const stat          = data.type
    const body          = await http.getJSON(`http://localhost:${env.PORT}/api/latest/${stat}`)
    const host          = data.server.ssh.host
    const monitorValue  = m.latest[host][stat]
    const returnedValue = body.data[host]
    assert.equal(monitorValue['1'], returnedValue['1'])
    assert.equal(monitorValue['5'], returnedValue['5'])
    assert.equal(monitorValue['15'], returnedValue['15'])
  })

  it("latest stat for a host", async () => {
    const data = await once(m, 'data')
    const stat = data.type
    const host = data.server.ssh.host
    const body = await http.getJSON(`http://localhost:${env.PORT}/api/latest/${stat}`, {host})

    const latest = m.latest

    const monitorValue  = latest[host][stat]
    const returnedValue = body.value

    assert(monitorValue !== undefined && monitorValue !== null)
    assert(returnedValue !== undefined && returnedValue !== null)
    assert.equal(monitorValue['1'], returnedValue['1'])
    assert.equal(monitorValue['5'], returnedValue['5'])
    assert.equal(monitorValue['15'], returnedValue['15'])
  })

  it("config", async () => {
    const body = await http.getJSON(`http://localhost:${env.PORT}/api/config`)
  })

  it("system stats", async () => {
    const params: SSHDataStoreQuerySystemStatsParams = {
      extra: {
        path: '/xyz'
      }
    }

    const operatorDev = servers[0]

    const mockData = [
      {
        server:    operatorDev,
        type:      'percentageDiskSpaceUsed',
        value:     0.17,
        extra:     {
          path: '/'
        },
        timestamp: 90,
      },
      {
        server:    operatorDev,
        type:      'percentageDiskSpaceUsed',
        value:     0.17,
        extra:     {
          path: '/xyz'
        },
        timestamp: 100,
      },
    ]

    const store = m.opts.store

    await Promise.all(mockData.map(d => {
      return store.storeMonitorDatum(d)
    }))

    const res = await http.getJSON(`http://localhost:${env.PORT}/api/system/stats`, params)

    console.log('res', res)

    const systemStats: MonitorDatum[] = res.data
    assert.equal(systemStats.length, 1)
  })
})