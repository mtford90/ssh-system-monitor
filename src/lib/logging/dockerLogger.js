/* @flow */

import Logger from './logger'
import type {ServerDefinition, LogDefinition} from '../typedefs/data'

export type DockerLoggerOpts = {
  serverDefinition: ServerDefinition,
  logDefinition: LogDefinition,
  _tail?: number, // For testing purposes
}

export default class DockerLogger extends Logger {
  dockerOpts: DockerLoggerOpts

  constructor (
    dockerOpts: DockerLoggerOpts
  ) {
    const {serverDefinition, logDefinition, _tail = 100} = dockerOpts

    super({
      cmd: `docker logs --tail ${_tail} -f (docker ps | grep "${logDefinition.grep}" | awk \'{print $1}\')`,
      serverDefinition,
      logDefinition,
    })
    this.dockerOpts = dockerOpts
  }
}