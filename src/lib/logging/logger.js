/* @flow */

import type {ServerDefinition, LoggerDatum, LogDefinition, LogSource, SSH2Error} from '../typedefs/data'
import {getClient} from '../util/ssh'
import Client from 'ssh2'
import EventEmitter from 'events'
import InternalLogging from '../internalLogging'
import _ from 'lodash'

const log = InternalLogging.logging.Logger

export function waitForLog (logger: Logger): Promise<LoggerDatum> {
  return new Promise(resolve => {
    logger.once('data', (datum: LoggerDatum) => resolve(datum))
  })
}

export type LoggerOpts = {
  cmd: string,
  serverDefinition: ServerDefinition,
  logDefinition: LogDefinition,
}

export default class Logger extends EventEmitter {
  opts: LoggerOpts
  client: Client
  _stream: any // TODO: Type ss2 (ClientChannel - can use the typescript version as a start)

  constructor (opts: LoggerOpts) {
    super()
    this.opts = opts
  }

  emitDatum (source: LogSource, text: string): LoggerDatum {
    const datum: LoggerDatum = {
      source,
      text,
      timestamp: Date.now(),
      server:    this.opts.serverDefinition,
      logger:    this.opts.logDefinition,
    }
    this.emit('data', datum)
    return datum
  }

  async _initClient (): Promise<Client> {
    const loggerName = this.opts.logDefinition.name

    log.trace(`Acquiring SSH connection for use in logger ${loggerName}`)
    this.client = await getClient(this.opts.serverDefinition.ssh)
    log.trace(`Acquired SSH connection for use in logger ${loggerName}`)

    this.client.on('error', (err: SSH2Error) => {
      log.error(`Logger ${loggerName} suffered an SSH error`, err)
    })

    this.client.on('close', (hadError: boolean) => {
      if (hadError) {
        log.error(`The ssh connection for logger ${loggerName} has now closed due to an error`)
      }
      else {
        log.debug(`The ssh connection for logger ${loggerName} has now closed`)
      }
    })

    this.client.on('end', () => {
      log.debug(`The ssh connection for logger ${loggerName} has now disconnected.`)
    })

    return this.client
  }


  async start (): Promise<void> {
    const loggerName = this.opts.logDefinition.name

    log.debug(`Starting logger "${loggerName}"`)

    await this._initClient()

    const cmd = this.opts.cmd

    log.trace('executing cmd', cmd)

    this.client.exec(cmd, (err, stream: any) => {
      if (!err) {
        this._stream = stream
        stream.on('data', data => {
          const lines: string[] = _.compact(data.toString().split('\n'))
          lines.forEach(l => {
            log.trace(`logger "${loggerName} [stdout]:"`, l)
            this.emitDatum('stdout', l)
          })
        })

        stream.on('close', (code, signal) => {
          if (code && code > 0) {
            log.error(`The stream for logger ${loggerName} closed with code ${code}`)
          }
          else if (code != null) {
            log.debug(`The stream for logger ${loggerName} has closed with code ${code}`)
          }
          else {
            log.debug(`The stream for logger ${loggerName} has closed`)
          }
        })

        stream.stderr.on('data', data => {
          const text = data.toString().replace(/\n/g, '')
          log.trace(`logger "${loggerName} [stderr]:"`, text)
          this.emitDatum('stderr', text)
        })
      }
      else {
        throw err
      }
    })

    log.info(`Started logger "${loggerName}"`)
  }


  async terminate (): Promise<void> {

    const loggerName = this.opts.logDefinition.name
    log.info(`Terminating logger "${loggerName}"`)

    const client = this.client
    if (client) {
      await new Promise(resolve => {
        client.once('end', () => {
          this.client = null
          log.info(`Terminated logger "${loggerName}"`)
          resolve()
        })
        client.end()
      })
    }
    else {
      log.warn(`Tried to terminate logger "${loggerName}" but it was never started!`)
    }
  }
}
