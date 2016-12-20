import chai from 'chai'
import * as config from '../config'
import nedbMonitor from '../monitors/nedbMonitor'

const assert = chai.assert

describe('nedbMonitor', function () {
  this.timeout(10000)

  it("monitor servers", done => {
    const m = nedbMonitor(config.servers, {rate: 250})
    // All this really does is check that monitor doesn't crash.
    // TODO: Clever way of intercepting the logs & inspecting them?
    setTimeout(() => {
      m.terminate().then(() => done()).catch(done)
    }, 1000)
  })
})