/* @flow */

import chai from 'chai'
import Monitor, {waitForMonitorDatum, waitForLoggerDatum} from './monitor'
import _ from 'lodash'
import {servers} from '../../examples/config'
import {describe, it} from 'mocha'
import {Stats} from '../types'
import type {MonitorDatum, DataType, ServerDefinition, LoggerDatum} from '../types/index'
import NEDBDataStore from '../storage/NEDBDataStore'

const assert = chai.assert

describe('monitor', function () {
  this.timeout(20000)

  describe("basic stats", function () {
    it("emits data", async () => {
      const _servers = servers
      const m        = new Monitor(_servers, {rate: 250})
      await m.start()

      const data: MonitorDatum = await waitForMonitorDatum(m)

      console.log('data', data)
      console.log('m.latest', m.latest)

      assert(
        _.every(_.map(_servers, s => m.latest[s.ssh.host])),
        `latest values were not configured for every host`
      )

      const host               = data.server.ssh.host
      const dataType: DataType = data.type

      assert(
        m.latest[host][dataType] !== undefined,
        `Latest data wasn't stored for data type ${host}.${dataType}`
      )

      await m.terminate()
    })

    it("emits percentage disk space used", async () => {
      const m = new Monitor(servers, {rate: 250})
      await m.start()

      const dataType = Stats.percentageDiskSpaceUsed
      const path     = '/'

      const data: MonitorDatum = await waitForMonitorDatum(
        m,
        datum => datum.type === dataType
      )

      const latest = m.latest

      console.log('latest', latest)
      const host = data.server.ssh.host

      assert(
        _.every(_.map(servers, s => latest[s.ssh.host])),
        `latest values were not configured for every host`
      )

      assert(
        latest[host][dataType][path] !== undefined,
        `Latest data wasn't stored for data type ${host}.${dataType}`
      )

      assert(
        data.extra.path === path,
        `path variable on the datum doesnt match path`,
      )

      assert(
        latest[host][dataType][path] === data.value,
        `value for disk space used emitted doesnt match the latest!`,
      )

      await m.terminate()
    })
  })

  describe("processes", function () {

    it("process", async () => {
      const server: ServerDefinition = servers[0]

      const m = new Monitor([server], {rate: 250})
      await m.start()

      await waitForMonitorDatum(
        m,
        datum => datum.type === Stats.processInfo
      )

      await m.terminate()
    })
  })

  describe("logs", function () {
    it("receives logs", async () => {
      const m = new Monitor([servers[0]], {rate: 250})

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

      const monitorDatum: MonitorDatum = await waitForMonitorDatum(
        m,
      )

      console.log('loggerDatum', loggerDatum)
      console.log('monitorDatum', monitorDatum)

      await m.terminate()
    })


  })
})