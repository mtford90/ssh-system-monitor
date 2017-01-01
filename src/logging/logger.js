/* @flow */
import type {ServerDefinition, LoggerDatum, LogDefinition, LogSource} from '../types/index'
import {getClient} from '../util/ssh'
import Client from 'ssh2'
import EventEmitter from 'events'


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

  async start () {
    this.client = await getClient(this.opts.serverDefinition.ssh)

    const cmd = this.opts.cmd
    console.log('executing cmd', cmd) // TODO
    this.client.exec(cmd, (err, stream) => {
      if (!err) {
        stream.on('data', data => {
          const text = data.toString().replace(/\n/g, '')
          this.emitDatum('stdout', text)
        })

        stream.on('close', (code, signal) => {
          const terminationPromise = this.terminate()
          this.emit('close', code, signal, terminationPromise)
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

  terminate (): Promise<void> {
    return new Promise(resolve => {
      const client = this.client
      if (client) {
        client.once('end', () => {
          this.client = null
          resolve()
        })
        client.end()
      }
    })
  }
}
