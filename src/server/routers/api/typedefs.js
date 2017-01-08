/* @flow */
import type {SystemDatum, LoggerDatum} from '../../../lib/typedefs/data'

export type APIResponseOptions<T> = {
  statusCode?: number | null,
  data?: T,
  detail?: string,
  readableDetail?: string,
  error?: Error
}

export class APIResponse<T> {
  statusCode: number | null
  data: T | null
  detail: string | null
  readableDetail: string | null
  error: ? Error

  constructor (opts: APIResponseOptions<T>) {
    this.statusCode     = opts.statusCode === undefined ? 200 : (opts.statusCode || null)
    this.data           = opts.data || null
    this.detail         = opts.detail || null
    this.readableDetail = opts.readableDetail || null
    this.error          = opts.error
  }

  serialize (): Object {
    const {statusCode, data, detail, readableDetail} = this
    return {statusCode, data, detail, readableDetail}
  }

  json (): string {
    return JSON.stringify(this.serialize())
  }

  getDetail (): string {
    return this.detail || (this.error && this.error.message) || 'Unknown Error'
  }

  getReadableDetail (): string {
    return this.readableDetail || this.getDetail() || 'Unknown Error'
  }

  /**
   * @param {express.Response} expressResponseObject
   */
  sendAsResponse (expressResponseObject: any) {
    expressResponseObject.status(this.statusCode).send(this.json())
  }

  isOk () {
    return !this.error && this.statusCode && this.statusCode >= 200 && this.statusCode < 300
  }
}

export class SystemStatsAPIResponse extends APIResponse<SystemDatum[]> {}
export class LogsAPIResponse extends APIResponse<LoggerDatum[]> {}

export function sendAPIResponse<T> (res: express$Response, opts: APIResponseOptions<T>) {
  const resp: APIResponse<T> = new APIResponse(opts)
  resp.sendAsResponse(res)
}