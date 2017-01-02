/* @flow */
import type {ServerDefinition, LoggerDatum, LogDefinition, LogSource, SSH2Error} from '../types/index'
import {getClient} from '../util/ssh'
import Client from 'ssh2'
import EventEmitter from 'events'
import {getLogger} from '../util/log'

import {SSH2Stream} from 'ssh2-streams'

const log = getLogger('logging/Logger')

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
  _stream: SSH2Stream

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

    log.debug(`Acquiring SSH connection for use in logger ${loggerName}`)
    this.client = await getClient(this.opts.serverDefinition.ssh)
    log.debug(`Acquired SSH connection for use in logger ${loggerName}`)

    this.client.on('error', (err: SSH2Error) => {
      log.error(`Logger ${loggerName} suffered an SSH error`, err)
    })

    this.client.on('close', (hadError: boolean) => {
      if (hadError) {
        log.error(`The ssh connection for logger ${loggerName} has now closed due to an error`)
      }
      else {
        log.info(`The ssh connection for logger ${loggerName} has now closed`)
      }
    })

    this.client.on('end', () => {
      log.info(`The ssh connection for logger ${loggerName} has now disconnected.`)
    })

    return this.client
  }

  startStream () {

  }

  async start (): Promise<void> {
    const loggerName = this.opts.logDefinition.name

    await this._initClient()

    const cmd = this.opts.cmd

    log.debug('executing cmd', cmd)

    this.client.exec(cmd, (err, stream: SSH2Stream) => {
      if (!err) {
        this._stream = stream
        stream.on('data', data => {
          const text = data.toString().replace(/\n/g, '')
          this.emitDatum('stdout', text)
        })

        stream.on('close', (code, signal) => {
          if (code && code > 0) {
            log.error(`The stream for logger ${loggerName} closed with code ${code}`)
          }
          else if (code != null) {
            log.info(`The stream for logger ${loggerName} has closed with code ${code}`)
          }
          else {
            log.info(`The stream for logger ${loggerName} has closed`)
          }
        })

        stream.stderr.on('data', data => {
          const text = data.toString().replace(/\n/g, '')
          this.emitDatum('stderr', text)
        })
      }
      else {
        throw err
      }
    })
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
