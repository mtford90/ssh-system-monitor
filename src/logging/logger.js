/* @flow */
import type {ServerDefinition} from '../types/index'
import {getClient} from '../util/ssh'
import Client from 'ssh2'
import EventEmitter from 'events'

export type LoggerDatum = {
  source: string,
  text: string,
  timestamp: number,
}

export function waitForLog (logger: Logger): Promise<LoggerDatum> {
  return new Promise(resolve => {
    logger.once('data', (datum: LoggerDatum) => resolve(datum))
  })
}

export type LoggerOpts = {
  cmd: string,
  server: ServerDefinition,
}

export default class Logger extends EventEmitter {
  opts: LoggerOpts
  client: ? Client | null

  constructor (opts: LoggerOpts) {
    super()
    this.opts = opts
  }

  emitDatum (source: string, text: string): LoggerDatum {
    const datum: LoggerDatum = {
      source,
      text,
      timestamp: Date.now()
    }
    this.emit('data', datum)
    return datum
  }

  async start () {
    this.client = await getClient(this.opts.server.ssh)

    this.client.exec(this.opts.cmd, (err, stream) => {
      stream.on('data', data => {
        const text   = data.toString().replace(/\n/g, '')
        const source = 'stdin'
        this.emitDatum(source, text)
      })

      stream.on('close', (code, signal) => {
        const terminationPromise = this.terminate()
        this.emit('close', code, signal, terminationPromise)
      })

      stream.stderr.on('data', data => {
        const text   = data.toString().replace(/\n/g, '')
        const source = 'stderr'
        this.emitDatum(source, text)
      })
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
