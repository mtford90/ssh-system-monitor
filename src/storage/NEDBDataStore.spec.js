/* @flow */

import chai from 'chai'
import _ from 'lodash'
import {servers} from '../../examples/config'
import {describe, it, before} from 'mocha'
import type {SystemDatum, ServerDefinition, LoggerDatum} from '../types/index'
import NEDBDataStore from '../storage/NEDBDataStore'
import {insertMonitorData, insertLogData} from '../util/storage'

const assert = chai.assert

describe('NEDBDataStore', function () {
  this.timeout(20000)

  let store: NEDBDataStore


  describe("queries", function () {
    describe("system", function () {
      it("empty query", async () => {
        const operatorDev           = servers[0]
        const mockData              = [{
          server:    operatorDev,
          type:      'cpuUsage',
          value:     0.17,
          extra:     {},
          timestamp: 90,
        }]
        store                       = await insertMonitorData(mockData)
        const stats: SystemDatum[] = await store.querySystemStats()
        assert.equal(stats.length, mockData.length)
        console.log('stats', JSON.stringify(stats))
      })

      describe("timestamp", function () {
        let mockData: SystemDatum[]

        before(async () => {
          const operatorDev = servers[0]

          mockData = [
            {
              server:    operatorDev,
              type:      'cpuUsage',
              value:     0.17,
              extra:     {},
              timestamp: 90,
            },
            {
              server:    operatorDev,
              type:      'cpuUsage',
              value:     0.17,
              extra:     {},
              timestamp: 100,
            },
            {
              server:    operatorDev,
              type:      'cpuUsage',
              value:     0.17,
              extra:     {},
              timestamp: 120,
            }
          ]

          store = await insertMonitorData(mockData)
        })

        it("gt", async () => {
          const n = 100

          const stats: SystemDatum[] = await store.querySystemStats({
            timestamp: {
              gt: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp > n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps <= 100'
          )
        })

        it("gte", async () => {
          const n = 100

          const stats: SystemDatum[] = await store.querySystemStats({
            timestamp: {
              gte: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp >= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps < 100'
          )
        })

        it("lt", async () => {
          const n = 100

          const stats: SystemDatum[] = await store.querySystemStats({
            timestamp: {
              lt: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp < n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps >= 100'
          )
        })

        it("lte", async () => {
          const n = 100

          const stats: SystemDatum[] = await store.querySystemStats({
            timestamp: {
              lte: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp <= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })

        it("gt, lt", async () => {
          const lt = 120
          const gt = 90

          const stats: SystemDatum[] = await store.querySystemStats({
            timestamp: {
              lt,
              gt
            }
          })

          const expectedStats = mockData.filter(d => {
            return d.timestamp < lt && d.timestamp > gt
          })

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })
      })

      it("name", async () => {
        let mockData: SystemDatum[]
        let operatorDev: ServerDefinition = servers[0]
        let portalDev: ServerDefinition   = servers[2]

        mockData = [
          {
            server:    operatorDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 90,
          },
          {
            server:    portalDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 100,
          },
          {
            server:    operatorDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 120,
          }
        ]

        store = await insertMonitorData(mockData)

        const portalDevName: string = portalDev.name

        console.log('mockData', mockData)

        const systemStats: SystemDatum[]  = await store.querySystemStats({name: portalDevName})
        assert.equal(systemStats.length, 1)
        assert(_.every(systemStats, s => s.server.name === portalDevName))
      })

      it("host", async () => {
        let mockData: SystemDatum[]
        let operatorDev: ServerDefinition = servers[0]
        let portalDev: ServerDefinition   = servers[2]

        mockData = [
          {
            server:    operatorDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 90,
          },
          {
            server:    portalDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 100,
          },
          {
            server:    operatorDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 120,
          }
        ]

        store = await insertMonitorData(mockData)

        const portalDevHost: string = portalDev.ssh.host

        const systemStats: SystemDatum[]  = await store.querySystemStats({host: portalDevHost})
        assert.equal(systemStats.length, 1)
        assert(_.every(systemStats, s => s.server.ssh.host === portalDevHost))
      })

      it("type", async () => {
        let mockData: SystemDatum[]
        let operatorDev: ServerDefinition = servers[0]
        let portalDev: ServerDefinition   = servers[2]

        mockData = [
          {
            server:    operatorDev,
            type:      'cpuUsage',
            value:     0.17,
            extra:     {},
            timestamp: 90,
          },
          {
            server:    portalDev,
            type:      'memoryUsedPercentage',
            value:     0.17,
            extra:     {},
            timestamp: 100,
          },
        ]

        store = await insertMonitorData(mockData)

        const systemStats: SystemDatum[]  = await store.querySystemStats({type: 'cpuUsage'})
        assert.equal(systemStats.length, 1)
        assert(_.every(systemStats, s => s.type === 'cpuUsage'))
      })

      it("extra.path", async () => {
        let mockData: SystemDatum[]
        let operatorDev: ServerDefinition = servers[0]

        mockData = [
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

        store = await insertMonitorData(mockData)

        const systemStats: SystemDatum[]  = await store.querySystemStats({extra: {path: '/'}})
        assert.equal(systemStats.length, 1)
      })

      it("extra.process.id", async () => {
        let mockData: SystemDatum[]
        let operatorDev: ServerDefinition = servers[0]

        mockData = [
          {
            server:    operatorDev,
            type:      'processInfo',
            value:     0.17,
            extra:     {
              process: {
                id:   '2',
                grep: 'xyz',
              }
            },
            timestamp: 90,
          },
          {
            server:    operatorDev,
            type:      'processInfo',
            value:     0.17,
            extra:     {
              process: {
                id:   '1',
                grep: 'xyz',
              }
            },
            timestamp: 100,
          },
        ]

        store = await insertMonitorData(mockData)

        const systemStats: SystemDatum[]  = await store.querySystemStats({extra: {process: {id: '1'}}})
        assert.equal(systemStats.length, 1)
      })
    })

    describe("logs", function () {
      const operatorDev = servers[0]
      const portalDev   = servers[2]

      it("empty query", async () => {
        const mockData: LoggerDatum[] = [{
          source:    'stdout',
          text:      'yoyoyo',
          timestamp: 100,
          server:    operatorDev,
          logger:    {
            name: 'xyz',
            grep: 'asdasd',
            type: 'command',
          }
        }]

        store = await insertLogData(mockData)

        const logs: LoggerDatum[] = await store.queryLogs()
        assert.equal(logs.length, 1)
        console.log('logs', JSON.stringify(logs))
      })

      it("name", async () => {
        const mockData: LoggerDatum[] = [
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
            timestamp: 100,
            server:    operatorDev,
            logger:    {
              name: 'abc',
              grep: 'asdasd',
              type: 'command',
            }
          }
        ]

        store                     = await insertLogData(mockData)
        const logs: LoggerDatum[] = await store.queryLogs({name: 'xyz'})
        console.log('logs', JSON.stringify(logs))
        assert.equal(logs.length, 1)
      })

      it("source", async () => {
        const mockData: LoggerDatum[] = [
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
            source:    'stderr',
            text:      'yoyoyo',
            timestamp: 100,
            server:    operatorDev,
            logger:    {
              name: 'abc',
              grep: 'asdasd',
              type: 'command',
            }
          }
        ]

        store                     = await insertLogData(mockData)
        const logs: LoggerDatum[] = await store.queryLogs({source: 'stderr'})
        console.log('logs', JSON.stringify(logs))
        assert.equal(logs.length, 1)
      })

      describe("timestamp", () => {
        let mockData: LoggerDatum[]

        before(async () => {
          const operatorDev = servers[0]

          mockData = [
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

          store = await insertLogData(mockData)
        })

        it("gt", async () => {
          const n = 100

          const stats: LoggerDatum[] = await store.queryLogs({
            timestamp: {
              gt: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp > n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps <= 100'
          )
        })

        it("gte", async () => {
          const n = 100

          const stats: LoggerDatum[] = await store.queryLogs({
            timestamp: {
              gte: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp >= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps < 100'
          )
        })

        it("lt", async () => {
          const n = 100

          const stats: LoggerDatum[] = await store.queryLogs({
            timestamp: {
              lt: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp < n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps >= 100'
          )
        })

        it("lte", async () => {
          const n = 100

          const stats: LoggerDatum[] = await store.queryLogs({
            timestamp: {
              lte: n,
            }
          })

          const expectedStats = mockData.filter(d => d.timestamp <= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })

        it("gt, lt", async () => {
          const lt = 120
          const gt = 90

          const stats: LoggerDatum[] = await store.queryLogs({
            timestamp: {
              lt,
              gt
            }
          })

          const expectedStats = mockData.filter(d => {
            return d.timestamp < lt && d.timestamp > gt
          })

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })
      })

      it("host", async () => {
        const mockData: LoggerDatum[] = [
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
            timestamp: 100,
            server:    portalDev,
            logger:    {
              name: 'abc',
              grep: 'asdasd',
              type: 'command',
            }
          }
        ]

        store = await insertLogData(mockData)

        const logs: LoggerDatum[] = await store.queryLogs({host: portalDev.ssh.host})
        console.log('logs', JSON.stringify(logs))
        assert.equal(logs.length, 1)
      })

    })
  })

})