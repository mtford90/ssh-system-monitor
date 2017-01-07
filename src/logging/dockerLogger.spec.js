/* @flow */

import chai from 'chai'
import DockerLogger from './dockerLogger'
import {servers} from '../../examples/config'
import {describe, it} from 'mocha'
import {waitForLog} from './logger';
import type {LoggerDatum} from '../../common/typedefs'

const assert = chai.assert

describe('DockerLogger', function () {
  this.timeout(20000)

  it("docker", async () => {
    const logger = new DockerLogger({
      serverDefinition: servers[0],
      logDefinition:    {
        grep: 'services.push.1',
        name: 'services.push',
        type: 'docker',
      },
      _tail:            1, // so we don't have to wait forever...
    })

    await logger.start()
    const datum: LoggerDatum = await waitForLog(logger)
    console.log('datum', datum)
    assert.equal(datum.source, 'stdout')
    await logger.terminate()
  })
})