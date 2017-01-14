import {assert} from 'chai'
import Monitor from 'lib/monitors/monitor'
import {APIMethod} from './api'
import type {SystemStatFilter, LogFilter} from '../../lib/storage/typedefs'
import {servers} from '../../dev/config'
import server from '../../server/server.babel'
import type {SystemDatum, LoggerDatum, ServerDefinition} from '../../lib/typedefs/data'
import env from 'server/env'
import {APIResponse} from 'server/routers/api/typedefs'

describe('/api', function () {
  this.timeout(20000)

  let m: Monitor
  let app

  const operatorDev = servers[0]

  beforeEach(async () => {
    m = new Monitor([operatorDev], {rate: 1000})
    app = server(m, {serveClient: false})
  })

  afterEach(async () => {
    app.close()
  })

  describe("success", function () {
    describe("logs", function () {
      it("timestamp filter", async () => {
        const method: APIMethod<LoggerDatum[],LogFilter> = new APIMethod('/api/logs', `http://localhost:${env.PORT}`)

        const params: LogFilter = {
          timestamp: {
            gt: 100
          }
        }

        const mockData: LoggerDatum[] = [
          {
            source: 'stdout',
            text: 'yoyoyo',
            timestamp: 90,
            server: operatorDev,
            logger: {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },

          {
            source: 'stdout',
            text: 'yoyoyo',
            timestamp: 100,
            server: operatorDev,
            logger: {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
          {
            source: 'stdout',
            text: 'yoyoyo',
            timestamp: 120,
            server: operatorDev,
            logger: {
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

        const res: APIResponse<LoggerDatum[]> = await method.get(params)

        const logs: LoggerDatum[] = res.data
        console.log('logs', logs)
        assert.equal(logs.length, 1)
        assert.equal(res.statusCode, 200)
      })

      it("regexp", async () => {
        const method: APIMethod<LoggerDatum[],LogFilter> = new APIMethod('/api/logs', `http://localhost:${env.PORT}`)

        const params: LogFilter = {
          text: '^yo'
        }

        const mockData: LoggerDatum[] = [
          {
            source: 'stdout',
            text: 'yoyoyo',
            timestamp: 90,
            server: operatorDev,
            logger: {
              name: 'xyz',
              grep: 'asdasd',
              type: 'command',
            }
          },
          {
            source: 'stdout',
            text: '23yoyo423',
            timestamp: 120,
            server: operatorDev,
            logger: {
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

        const res: APIResponse<LoggerDatum[]> = await method.get(params)

        const logs: LoggerDatum[] = res.data
        console.log('logs', logs)
        assert.equal(logs.length, 1)
        assert.equal(res.statusCode, 200)
      })
    })

    describe("system", function () {
      it("system stats", async () => {
        const method: APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/api/system/stats', `http://localhost:${env.PORT}`)

        const params: SystemStatFilter = {
          extra: {
            path: '/xyz'
          }
        }

        const mockData = [
          {
            server: operatorDev,
            type: 'percentageDiskSpaceUsed',
            value: 0.17,
            extra: {
              path: '/'
            },
            timestamp: 90,
          },
          {
            server: operatorDev,
            type: 'percentageDiskSpaceUsed',
            value: 0.17,
            extra: {
              path: '/xyz'
            },
            timestamp: 100,
          },
        ]

        const store = m.opts.store

        await Promise.all(mockData.map(d => {
          return store.storeSystemDatum(d)
        }))

        const res: APIResponse<SystemDatum[]> = await method.get(params)

        const systemStats: SystemDatum[] = res.data

        console.log('systemStats', systemStats)

        assert.equal(systemStats.length, 1)
        assert.equal(res.statusCode, 200)
      })
    })

    describe("config", function () {
      it("config", async () => {
        const method: APIMethod<ServerDefinition[],{}> = new APIMethod('/api/config', `http://localhost:${env.PORT}`)
        const res: APIResponse<SystemDatum[]> = await method.get()

        console.log('res', res)
        assert.equal(res.statusCode, 200)
      })

    })
  })

  describe('errors', function () {
    it("404", async () => {
      const method: APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/asfat3rf', `http://localhost:${env.PORT}`)

      const params: SystemStatFilter = {
        host: operatorDev.ssh.host
      }
      const res: APIResponse<SystemDatum[]> = await method.get(params)

      assert.equal(res.statusCode, 404)
    })

    it("totally invalid host", async () => {
      const method: APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/asfat3rf')

      const params: SystemStatFilter = {
        host: operatorDev.ssh.host
      }
      const res: APIResponse<SystemDatum[]> = await method.get(params)

      console.log('detail', res.getDetail())

      assert(res.statusCode === null)
    })
  })
});