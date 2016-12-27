import chai from 'chai'
import LogMonitor from './logMonitor'
import {servers} from '../../examples/config'

const assert = chai.assert

describe('LogMonitor', function () {
  this.timeout(20000)

  it("monitor servers", done => {
    const m = new LogMonitor(servers, {rate: 250})
    // All this really does is check that monitor doesn't crash.
    // TODO: Clever way of intercepting the logs & inspecting them?
    setTimeout(() => {
      m.terminate().then(() => done()).catch(done)
    }, 1000)
  })
})