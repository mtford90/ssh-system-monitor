import {assert} from 'chai'
import {every} from 'lodash'
import {servers} from '../../dev/config'
import {SystemDatum, LoggerDatum} from 'lib/typedefs/data'
import {filterSystemStats, filterLogs} from './index'

describe("filters", function () {
  const operatorDev = servers[0]
  const portalDev = servers[2]

  describe("system", function () {
    it("empty", () => {
      const mockData: SystemDatum[] = [{
        server: operatorDev,
        type: 'cpuUsage',
        value: 0.17,
        extra: {},
        timestamp: 90,
      }]

      const filtered: SystemDatum[] = filterSystemStats(mockData, {})

      assert.equal(filtered.length, 1)
    })

    it("name", () => {
      const mockData: SystemDatum[] = [
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 90,
        },
        {
          server: portalDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 100,
        },
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 120,
        }
      ]
      const portalDevName: string = portalDev.name

      const systemStats: SystemDatum[] = filterSystemStats(mockData, {name: portalDevName})

      assert.equal(systemStats.length, 1)
      assert(every(systemStats, s => s.server.name === portalDevName))
    })

    it("host", () => {
      let mockData: SystemDatum[] = [
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 90,
        },
        {
          server: portalDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 100,
        },
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 120,
        }
      ]

      const portalDevHost: string = portalDev.ssh.host

      const systemStats: SystemDatum[] = filterSystemStats(mockData, {host: portalDevHost})
      assert.equal(systemStats.length, 1)
      assert(every(systemStats, s => s.server.ssh.host === portalDevHost))
    })

    it("type", () => {
      let mockData: SystemDatum[]

      mockData = [
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 90,
        },
        {
          server: portalDev,
          type: 'memoryUsedPercentage',
          value: 0.17,
          extra: {},
          timestamp: 100,
        },
      ]

      const systemStats: SystemDatum[] = filterSystemStats(mockData, {type: 'cpuUsage'})
      assert.equal(systemStats.length, 1)
      assert(every(systemStats, s => s.type === 'cpuUsage'))
    })

    it("extra.path", () => {
      let mockData: SystemDatum[]

      mockData = [
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

      const systemStats: SystemDatum[] = filterSystemStats(mockData, {extra: {path: '/'}})
      assert.equal(systemStats.length, 1)
    })

    it("extra.process.id", () => {
      let mockData: SystemDatum[]

      mockData = [
        {
          server: operatorDev,
          type: 'processInfo',
          value: 0.17,
          extra: {
            process: {
              id: '2',
              grep: 'xyz',
            }
          },
          timestamp: 90,
        },
        {
          server: operatorDev,
          type: 'processInfo',
          value: 0.17,
          extra: {
            process: {
              id: '1',
              grep: 'xyz',
            }
          },
          timestamp: 100,
        },
      ]

      const systemStats: SystemDatum[] = filterSystemStats(mockData, {extra: {process: {id: '1'}}})
      assert.equal(systemStats.length, 1)
    })

    describe("timestamp", function () {
      let mockData: SystemDatum[] = [
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 90,
        },
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 100,
        },
        {
          server: operatorDev,
          type: 'cpuUsage',
          value: 0.17,
          extra: {},
          timestamp: 120,
        }
      ]

      it("gt", () => {
        const n = 100

        const results: SystemDatum[] = filterSystemStats(mockData, {
          timestamp: {
            gt: n,
          }
        })

        const expectedResults = mockData.filter(d => d.timestamp > n)

        assert.equal(
          results.length,
          expectedResults.length,
          'Should filter out timestamps <= 100'
        )
      })

      it("gte", () => {
        const n = 100

        const results: SystemDatum[] = filterSystemStats(mockData, {
          timestamp: {
            gte: n,
          }
        })

        const expectedStats = mockData.filter(d => d.timestamp >= n)

        assert.equal(
          results.length,
          expectedStats.length,
          'Should filter out timestamps < 100'
        )
      })

      it("lt", () => {
        const n = 100

        const stats: SystemDatum[] = filterSystemStats(mockData, {
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

      it("lte", () => {
        const n = 100

        const stats: SystemDatum[] = filterSystemStats(mockData, {
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

      it("gt, lt", () => {
        const lt = 120
        const gt = 90

        const stats: SystemDatum[] = filterSystemStats(mockData, {
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
  })

  describe("logs", function () {
    it("empty query", () => {
      const mockData: LoggerDatum[] = [{
        source: 'stdout',
        text: 'yoyoyo',
        timestamp: 100,
        server: operatorDev,
        logger: {
          name: 'xyz',
          grep: 'asdasd',
          type: 'command',
        }
      }]

      const logs: LoggerDatum[] = filterLogs(mockData, {})
      assert.equal(logs.length, 1)
      console.log('logs', JSON.stringify(logs))
    })

    it("name", () => {
      const mockData: LoggerDatum[] = [
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
          timestamp: 100,
          server: operatorDev,
          logger: {
            name: 'abc',
            grep: 'asdasd',
            type: 'command',
          }
        }
      ]

      const logs: LoggerDatum[] = filterLogs(mockData, {name: 'xyz'})
      console.log('logs', JSON.stringify(logs))
      assert.equal(logs.length, 1)
    })

    it("text", () => {
      const mockData: LoggerDatum[] = [
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
          text: '22yo22yo',
          timestamp: 100,
          server: operatorDev,
          logger: {
            name: 'abc',
            grep: 'asdasd',
            type: 'command',
          }
        }
      ]

      // Log text must start with "yo"
      const regExp = /^yo/

      const logs: LoggerDatum[] = filterLogs(mockData, {text: regExp})
      console.log('logs', JSON.stringify(logs))
      assert.equal(logs.length, 1)
    })

    it("source", () => {
      const mockData: LoggerDatum[] = [
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
          source: 'stderr',
          text: 'yoyoyo',
          timestamp: 100,
          server: operatorDev,
          logger: {
            name: 'abc',
            grep: 'asdasd',
            type: 'command',
          }
        }
      ]

      const logs: LoggerDatum[] = filterLogs(mockData, {source: 'stderr'})
      console.log('logs', JSON.stringify(logs))
      assert.equal(logs.length, 1)
    })

    describe("timestamp", () => {
      let mockData: LoggerDatum[] = [
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

      it("gt", () => {
        const n = 100

        const stats: LoggerDatum[] = filterLogs(mockData, {
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

      it("gte", () => {
        const n = 100

        const stats: LoggerDatum[] = filterLogs(mockData, {
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

      it("lt", () => {
        const n = 100

        const stats: LoggerDatum[] = filterLogs(mockData, {
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

      it("lte", () => {
        const n = 100

        const stats: LoggerDatum[] = filterLogs(mockData, {
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

      it("gt, lt", () => {
        const lt = 120
        const gt = 90

        const stats: LoggerDatum[] = filterLogs(mockData, {
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

    it("host", () => {
      const mockData: LoggerDatum[] = [
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
          timestamp: 100,
          server: portalDev,
          logger: {
            name: 'abc',
            grep: 'asdasd',
            type: 'command',
          }
        }
      ]


      const logs: LoggerDatum[] = filterLogs(mockData, {host: portalDev.ssh.host})
      console.log('logs', JSON.stringify(logs))
      assert.equal(logs.length, 1)
    })
  })
})