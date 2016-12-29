/* @flow */

import Logger from './logger'
import type {ServerDefinition} from '../types/index'

export type DockerLoggerOpts = {
  name: string,
  server: ServerDefinition,
  _tail?: number, // For testing purposes
}

export default class DockerLogger extends Logger {
  dockerOpts: DockerLoggerOpts

  constructor (
    dockerOpts: DockerLoggerOpts
  ) {
    const {name, server, _tail = 0} = dockerOpts

    super({
      cmd: `docker logs --tail ${_tail} -f (docker ps | grep "${name}" | awk \'{print $1}\')`,
      server,
    })
    this.dockerOpts = dockerOpts
  }
}