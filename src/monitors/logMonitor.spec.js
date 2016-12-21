import chai from 'chai'
import * as config from '../../app/config'
import logMonitor from './logMonitor'

const assert = chai.assert

describe('logMonitor', function () {
  this.timeout(10000)

  it("monitor servers", done => {
    const m = logMonitor(config.servers, {rate: 250})
    // All this really does is check that monitor doesn't crash.
    // TODO: Clever way of intercepting the logs & inspecting them?
    setTimeout(() => {
      m.terminate().then(() => done()).catch(done)
    }, 1000)
  })
})