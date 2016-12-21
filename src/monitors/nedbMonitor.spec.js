
import chai from 'chai'
import monitor from './nedbMonitor'
import {servers} from '../../examples/config'

const assert = chai.assert

describe('nedbMonitor', function () {
  this.timeout(10000)

  it("monitor servers", done => {
    const m       = monitor(servers, {rate: 250})
    // All this really does is check that monitor doesn't crash.
    // TODO: Clever way of intercepting the logs & inspecting them?
    setTimeout(() => {
      m.terminate().then(() => done()).catch(done)
    }, 1000)
  })
})