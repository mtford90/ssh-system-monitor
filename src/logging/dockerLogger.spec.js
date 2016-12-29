/* @flow */

import chai from 'chai'
import DockerLogger from './dockerLogger'
import {servers} from '../../examples/config'
import {describe, it} from 'mocha'
import type {LoggerDatum} from './logger';
import {waitForLog} from './logger';

const assert = chai.assert

describe('DockerLogger', function () {
  this.timeout(20000)

  it("docker", async () => {
    const logger = new DockerLogger({
      name: 'services.push.1',
      server: servers[0],
      _tail: 1, // so we don't have to wait forever...
    })

    await logger.start()
    const datum: LoggerDatum = await waitForLog(logger)
    console.log('datum', datum)
    assert.equal(datum.source, 'stdin')
    await logger.terminate()
  })
})