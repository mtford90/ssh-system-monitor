import chai from 'chai'
import * as config from '../config'
import {constructPool} from '../pool'
import _ from 'lodash'
import {cpuUsage} from '../commands'
import {monitor} from './logMonitor'

const assert = chai.assert

describe('pool', () => {

  before(() => {
  })

  it("monitor servers", done => {
    // All this really does is check that monitor doesn't crash.
    // TODO: Clever way of intercepting the logs & inspecting them?
    const terminate = monitor(config.servers, {rate: 250})
    setTimeout(() => {
      terminate()
      done()
    }, 1000)
  })
})