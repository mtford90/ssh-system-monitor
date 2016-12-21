import chai from 'chai'
import * as config from '../../app/config'
import {monitor} from './monitor'
import _ from 'lodash'

const assert = chai.assert

describe('monitor', function () {
  this.timeout(10000)

  it("monitor servers", done => {
    const m = monitor(config.servers, {rate: 250})

    m.on('data', data => {
      console.log('data', data)
      console.log('m.latest', m.latest)

      if (!_.every(_.map(config.servers, s => m.latest[s.ssh.host]))) {
        done(new Error(`latest values were not configured for every host`))
      }

      const host     = data.server.ssh.host
      const dataType = data.type

      if (m.latest[host][dataType] === undefined) {
        done(new Error(`Latest data wasn't stored for data type ${host}.${dataType}`))
      }

      m.terminate().then(() => done()).catch(done)
    })
  })
})