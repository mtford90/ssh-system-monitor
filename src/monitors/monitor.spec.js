import chai from 'chai'
import * as config from '../config'
import {monitor} from './monitor'

const assert = chai.assert

describe('monitor', () => {
  it("monitor servers", done => {
    const m = monitor(config.servers, {rate: 250})

    m.on('data', data => {
      console.log('data', data)
      m.terminate().then(() => done()).catch(done)
    })
  })
})