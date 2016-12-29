/* @flow */

import chai from 'chai'
import Logger, {waitForLog} from './logger'
import {servers} from '../../examples/config'
import {describe, it} from 'mocha'
import type {LoggerDatum} from './logger';

const assert = chai.assert

describe('logger', function () {
  this.timeout(20000)

  it("docker", async () => {
    const logger = new Logger({
      cmd: 'docker logs --tail 1 -f (docker ps | grep "services.push.1" | awk \'{print $1}\')',
      server: servers[0],
    })

    await logger.start()
    const datum: LoggerDatum = await waitForLog(logger)
    console.log('datum', datum)
    assert.equal(datum.source, 'stdin')
    await logger.terminate()
  })
})