/* @flow */

import chai from 'chai'
import _ from 'lodash'
import {servers} from '../../examples/config'
import {describe, it, before} from 'mocha'
import {Stats} from '../types'
import type {MonitorDatum, DataType, ServerDefinition, LoggerDatum} from '../types/index'
import NEDBDataStore from '../storage/NEDBDataStore'
import Monitor from '../monitors/monitor'

const assert = chai.assert

describe('NEDBDataStore', function () {
  this.timeout(20000)

  describe("queries", function () {

    let store: NEDBDataStore = new NEDBDataStore()
    let fakeSystemData: MonitorDatum[]

    before(async () => {
      const operatorDev = servers[0]

      fakeSystemData = [
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
        },
      ]

      await Promise.all(fakeSystemData.map(d => {
        return store.storeMonitorDatum(d)
      }))
    })

    describe("system", function () {
      it("empty query", async () => {
        const stats: MonitorDatum[] = await store.querySystemStats()
        assert.equal(stats.length, fakeSystemData.length)
        console.log('stats', JSON.stringify(stats))
      })

      describe("timestamp", function () {
        it("gt", async () => {
          const n = 100

          const stats: MonitorDatum[] = await store.querySystemStats({
            timestamp: {
              gt: n,
            }
          })

          const expectedStats = fakeSystemData.filter(d => d.timestamp > n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps <= 100'
          )
        })

        it("gte", async () => {
          const n = 100

          const stats: MonitorDatum[] = await store.querySystemStats({
            timestamp: {
              gte: n,
            }
          })

          const expectedStats = fakeSystemData.filter(d => d.timestamp >= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps < 100'
          )
        })

        it("lt", async () => {
          const n = 100

          const stats: MonitorDatum[] = await store.querySystemStats({
            timestamp: {
              lt: n,
            }
          })

          const expectedStats = fakeSystemData.filter(d => d.timestamp < n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps >= 100'
          )
        })

        it("lte", async () => {
          const n = 100

          const stats: MonitorDatum[] = await store.querySystemStats({
            timestamp: {
              lte: n,
            }
          })

          const expectedStats = fakeSystemData.filter(d => d.timestamp <= n)

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })

        it("gt, lt", async () => {
          const lt = 120
          const gt = 90

          const stats: MonitorDatum[] = await store.querySystemStats({
            timestamp: {
              lt,
              gt
            }
          })

          const expectedStats = fakeSystemData.filter(d => {
            return d.timestamp < lt && d.timestamp > gt
          })

          assert.equal(
            stats.length,
            expectedStats.length,
            'Should filter out timestamps > 100'
          )
        })
      })
    })

    describe("logs", function () {
      it("empty query", async () => {
        const logs: LoggerDatum[] = await store.queryLogs()
        console.log('logs', JSON.stringify(logs))
      })
    })
  })

})