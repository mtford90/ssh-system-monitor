/* @flow */

import chai from 'chai'
import server from '../index'
import * as http from 'http.ts'
import {servers} from '../../dev/config'
import env from '../env'
import Monitor from 'monitor.ts'
import {after, it, before, describe, afterEach} from 'mocha'
import {SystemStatFilter, LogFilter} from 'DataStore.ts'
import {SystemDatum, LoggerDatum} from 'data.d.ts'
import EventEmitter from 'events'

const assert = chai.assert

function once (emitter: EventEmitter, event: string,): Promise<any> {
  return new Promise(resolve => {
    emitter.on(event, (x: any) => {
      resolve(x)
    })
  })
}

describe('/api', function () {
  this.timeout(20000)

  let m: Monitor
  let app

  const operatorDev = servers[0]

  describe("latest", function () {
    before(async () => {
      m = new Monitor([operatorDev], {rate: 1000})
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
  })

  describe("historical", function () {

    afterEach(function () {
      if (app) {
        app.close()
      }
    })

    it("system stats", async () => {
      m   = new Monitor([operatorDev], {rate: 1000})
      app = server(m, {serveClient: false})

      const params: SystemStatFilter = {
        extra: {
          path: '/xyz'
        }
      }

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
        return store.storeSystemDatum(d)
      }))

      const res = await http.getJSON(`http://localhost:${env.PORT}/api/system/stats`, params)

      console.log('res', res)

      const systemStats: SystemDatum[] = res.data
      assert.equal(systemStats.length, 1)


    })

    describe("logs", function () {
      it("timestamp", async () => {
        m   = new Monitor([operatorDev], {rate: 1000})
        app = server(m, {serveClient: false})

        const params: LogFilter = {
          timestamp: {
            gt: 100
          }
        }


        const mockData: LoggerDatum[] = [
          {
            source:    'stdout',
            text:      'yoyoyo',
            timestamp: 90,
            server:    operatorDev,
            logger:    {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },

          {
            source:    'stdout',
            text:      'yoyoyo',
            timestamp: 100,
            server:    operatorDev,
            logger:    {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
          {
            source:    'stdout',
            text:      'yoyoyo',
            timestamp: 120,
            server:    operatorDev,
            logger:    {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
        ]

        const store = m.opts.store

        await Promise.all(mockData.map(d => {
          return store.storeLoggerDatum(d)
        }))

        const res = await http.getJSON(`http://localhost:${env.PORT}/api/logs`, params)

        console.log('res', res)

        const logs: LoggerDatum[] = res.data
        assert.equal(logs.length, 1)
      })
      it("regexp", async () => {
        m   = new Monitor([operatorDev], {rate: 1000})
        app = server(m, {serveClient: false})

        const params: LogFilter = {
          text: '^yo'
        }

        const mockData: LoggerDatum[] = [
          {
            source:    'stdout',
            text:      'yoyoyo',
            timestamp: 90,
            server:    operatorDev,
            logger:    {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
          {
            source:    'stdout',
            text:      '23yoyo423',
            timestamp: 120,
            server:    operatorDev,
            logger:    {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
        ]

        const store = m.opts.store

        await Promise.all(mockData.map(d => {
          return store.storeLoggerDatum(d)
        }))

        const res = await http.getJSON(`http://localhost:${env.PORT}/api/logs`, params)

        console.log('res', res)

        const logs: LoggerDatum[] = res.data
        assert.equal(logs.length, 1)
      })
    })


  })
})