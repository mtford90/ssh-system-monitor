/* @flow */

// import {Logger, transports} from 'winston'
import moment from 'moment'


type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  name: string
  level: LogLevel

  constructor (name: string, level: LogLevel) {
    this.name  = name
    this.level = level
  }

  log (level: LogLevel, message: string, ...rest: any[]) {
    const timestamp = moment().format('DD/MM/YYYY HH:mm:ss.SSS')
    const _level    = level.toUpperCase()
    console.log(`${timestamp} ${_level} {${this.name}} ${message}`)
  }

  debug (message: string, ...rest: any[]) {
    this.log('debug', message, ...rest)
  }

  info (message: string, ...rest: any[]) {
    this.log('info', message, ...rest)
  }

  warn (message: string, ...rest: any[]) {
    this.log('warn', message, ...rest)
  }

  error (message: string, ...rest: any[]) {
    this.log('error', message, ...rest)
  }
}


export function getLogger (name: string, level?: LogLevel = 'debug'): Logger {
  return new Logger(name, level)
}