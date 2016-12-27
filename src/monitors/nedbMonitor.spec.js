/* @flow */

import chai from 'chai'
import Monitor from './nedbMonitor'
import {servers} from '../../examples/config'
import {describe, it} from 'mocha'

const assert = chai.assert

describe('NEDBMonitor', function () {
  this.timeout(20000)

  it("monitor servers", done => {
    const m = new Monitor(servers, {rate: 250})
    // All this really does is check that monitor doesn't crash.
    setTimeout(() => {
      m.terminate().then(() => done()).catch(done)
    }, 1000)
  })
})