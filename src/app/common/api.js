/* @flow */

import {_encodeQueryParams} from 'lib/util/http'
import type {SystemStatFilter} from 'lib/storage/typedefs'
import {APIResponse} from '../../server/routers/api/typedefs'
import type {SystemDatum} from '../../lib/typedefs/data'

export class APIMethod<T, P: $Subtype<Object>> {
  path: string
  baseUrl: string

  constructor (path: string, baseUrl?: string = '') {
    this.path    = path
    this.baseUrl = baseUrl
  }

  async handleError (res: any): Promise<APIResponse<T>> {
    const responseText = await res.text()

    let responseObject: APIResponse<T>

    try {
      responseObject = JSON.parse(responseText)
    }
    catch (err) {
      const apiResponse: APIResponse<T> = new APIResponse({
        statusCode:     res.status,
        detail:         responseText.trim() || "API errored out & didn't return json",
        readableDetail: "Unknown server error",
      })
      return apiResponse
    }

    if (!responseObject.statusCode) {
      responseObject.statusCode = res.status
    }

    if (!responseObject.detail && !responseObject.readableDetail) {
      responseObject.detail         = "API didn't return any error details"
      responseObject.readableDetail = "Unknown server error"
    }

    return responseObject
  }

  async get (params: P): Promise<APIResponse<T>> {
    let path = this.path

    if (Object.keys(params).length) {
      const encoded = _encodeQueryParams(params)
      path += `?${encoded}`
    }

    const opts = {
      method:  'GET',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json'
      },
    }

    const url = `${this.baseUrl}${path}`

    console.log('url', url)

    let res: any

    try {
      res = await fetch(url, opts)
    }
    catch (err) {
      return new APIResponse({
        statusCode: null,
        error:      err,
      })
    }

    if (!res.ok) {
      return await this.handleError(res)
    }

    try {
      res = await fetch(url, opts)
    }
    catch (err) {
      return new APIResponse({
        statusCode: null,
        error:      err,
      })
    }

    let responseText: string

    try {
      responseText = await res.text()
    }
    catch (err) {
      return new APIResponse({
        statusCode: res.status,
        error:      err,
      })
    }

    let responseObject: APIResponse<T>

    try {
      responseObject = JSON.parse(responseText)
    }
    catch (err) {
      responseObject = new APIResponse({
        statusCode:     res.status,
        detail:         "API request succeeded but couldn't parse JSON",
        readableDetail: "Unknown server error",
      })
    }

    return responseObject
  }
}

export const systemStats: APIMethod<SystemDatum[],SystemStatFilter> = new APIMethod('/api/system/stats')
