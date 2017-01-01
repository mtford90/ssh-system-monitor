/* @flow */
import type {ServerDefinition, LoggerDatum, LogDefinition, LogSource} from '../types/index'
import {getClient} from '../util/ssh'
import Client from 'ssh2'
import EventEmitter from 'events'
import {getLogger} from '../util/log'

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

  async start (): Promise<void> {
    const loggerName = this.opts.logDefinition.name

    log.debug(`Acquiring SSH connection for use in logger ${loggerName}`)
    this.client = await getClient(this.opts.serverDefinition.ssh)
    log.debug(`Acquired SSH connection for use in logger ${loggerName}`)

    const cmd = this.opts.cmd

    log.debug('executing cmd', cmd)

    this.client.exec(cmd, (err, stream) => {
      if (!err) {
        stream.on('data', data => {
          const text = data.toString().replace(/\n/g, '')
          this.emitDatum('stdout', text)
        })

        // TODO: If the SSH client errors out, ends or whatever we need to get a new client - probably with exponential backoff

        // stream.on('close', (code, signal) => {
        //   const terminationPromise = this.terminate()
        //   this.emit('close', code, signal, terminationPromise)
        // })

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

    const client     = this.client
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
