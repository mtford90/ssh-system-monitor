/* @flow */

import Logger from './logger'
import type {ServerDefinition, LogDefinition} from '../types/index'

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
    const {serverDefinition, logDefinition, _tail = 0} = dockerOpts

    super({
      cmd: `docker logs --tail ${_tail} -f (docker ps | grep "${logDefinition.grep}" | awk \'{print $1}\')`,
      serverDefinition,
      logDefinition,
    })
    this.dockerOpts = dockerOpts
  }
}