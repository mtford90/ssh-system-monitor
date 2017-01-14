/* @flow */

import chai from 'chai'
import Monitor, {waitForSystemDatum, waitForLoggerDatum} from './monitor'
import {servers} from '../../dev/config'
import {describe, it} from 'mocha'
import {Stats} from '../typedefs/data'
import type {SystemDatum, DiskspaceUsedValue, ServerDefinition, LoggerDatum} from '../typedefs/data'
import NEDBDataStore from '../storage/NEDBDataStore'

const assert = chai.assert

describe('monitor', function () {
  this.timeout(20000)

  describe("basic stats", function () {
    it("emits data", async () => {
      const _servers = servers
      const m        = new Monitor(_servers, {rate: 1000})
      await m.start()

      const data: SystemDatum<*> = await waitForSystemDatum(m)

      assert(data)

      await m.terminate()
    })

    it("emits percentage disk space used", async () => {
      const m = new Monitor(servers, {rate: 1000})
      await m.start()

      const dataType = Stats.percentageDiskSpaceUsed
      const path     = '/'

      const datum: SystemDatum<DiskspaceUsedValue> = await waitForSystemDatum(
        m,
        datum => datum.type === dataType
      )

      assert(
        datum.value.path === path,
        `path variable on the datum doesnt match path`,
      )

      await m.terminate()
    })
  })

  describe("processes", function () {

    it("process", async () => {
      const server: ServerDefinition = servers[0]

      const m = new Monitor([server], {rate: 1000})
      await m.start()

      await waitForSystemDatum(
        m,
        datum => datum.type === Stats.processInfo
      )

      await m.terminate()
    })
  })

  describe("logs", function () {
    it("receives logs", async () => {
      const m = new Monitor([servers[0]], {rate: 1000})

      await m.start()

      const datum: LoggerDatum = await waitForLoggerDatum(
        m,
      )

      assert(datum.text)

      console.log('datum', datum)

      await m.terminate()
    })
  })

  describe("storage", function () {
    it("stores in nedb", async () => {
      const m = new Monitor(
        [servers[0]],
        {
          rate:  250,
          store: new NEDBDataStore()
        }
      )

      await m.start()

      const loggerDatum: LoggerDatum = await waitForLoggerDatum(
        m,
      )

      const systemDatum: SystemDatum<*> = await waitForSystemDatum(
        m,
      )

      console.log('loggerDatum', loggerDatum)
      console.log('systemDatum', systemDatum)

      await m.terminate()
    })


  })
})