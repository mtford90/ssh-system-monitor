/* @flow */

import _ from 'lodash'

function _encodeQueryParams (query: Object): string {
  const encoded = Object.keys(query)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
    .join('&')
  return encoded
}

// https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
export type FetchOptions = {
  method?: 'POST' | 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'PUT' | null,
  headers?: Object | null,
  body?: string | Blob | FormData | URLSearchParams | null,
  mode?: 'cors' | 'no-cors' | 'same-origin' | null,
  credentials?: 'omit' | 'same-origin' | 'include' | null,
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached' | null,
  redirect?: 'follow' | 'error' | 'manual' | null,
  referrer?: 'no-referrer' | 'client' | string | null,
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin-only' | 'origin-when-cross-origin' | 'unsafe-url' | '' | null,
  integrity?: string | null,
}

export class APIError extends Error {
  code: number

  constructor (msg: any) {
    super(msg)
  }
}

export async function post (path: string, params: Object, body: Object) {
  const opts: FetchOptions = {
    method:  'POST',
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    }
  }

  if (params) {
    const encoded = _encodeQueryParams(params)
    path += encoded
  }

  if (body) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(path, opts)

  const responseBody = await res.json()

  if (!responseBody.ok) {
    const err   = new APIError(responseBody.message || 'Error')
    err.code    = responseBody.code
    err.message = responseBody.message
    throw err
  }

  return responseBody
}

export async function get (path: string, params?: Object): Promise<string> {
  const opts = {
    method:  'GET',
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json'
    }
  }

  if (params) {
    const encoded = _encodeQueryParams(params)
    path += `?${encoded}`
  }

  // TODO
  // console.log(`GET ${path}`)

  const res                  = await fetch(path, opts)
  const responseText: string = await res.text()

  // TODO
  // console.log(`GET ${path}`, responseText)

  return responseText

}

export async function getJSON (path: string, params?: Object): Promise<Object> {
  const responseText: string = await get(path, params)

  let responseObject: Object | null = null

  try {
    responseObject = JSON.parse(responseText)
  }
  catch (err) {
    throw new APIError(`API didn't return JSON...`)
  }

  if (!responseObject.ok) {
    const err = new APIError(responseText.message || 'Error')
    err.code  = responseObject.code
    throw err
  }

  return responseObject
}