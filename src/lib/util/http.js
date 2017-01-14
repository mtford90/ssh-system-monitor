/* @flow */

import InternalLogging from '../internalLogging'

// function _encodeQueryParams (query: Object): string {
//   const encoded = Object.keys(query)
//     .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
//     .join('&')
//   return encoded
// }

const log = InternalLogging.util.http

export function _encodeQueryParams (obj: any, urlEncode?: boolean = false): string {
  function flattenObj (x: Object, path: Array<string> = []): Array<Object> {
    const result = [];

    Object.keys(x).forEach(function (key) {
      if (!x.hasOwnProperty(key)) return;

      const newPath = path.slice();
      newPath.push(key);

      let vals = [];
      if (typeof x[key] == 'object') {
        vals = flattenObj(x[key], newPath);
      } else {
        vals.push({path: newPath, val: x[key]});
      }
      vals.forEach(function (obj) {
        return result.push(obj);
      });
    });

    return result;
  } // flattenObj

  // start with  flattening `obj`
  let parts = flattenObj(obj); // [ { path: [ ...parts ], val: ... }, ... ]

  // convert to array notation:
  parts = parts.map(function (varInfo) {
    if (varInfo.path.length == 1) varInfo.path = varInfo.path[0]; else {
      const first = varInfo.path[0];
      const rest: Array<string> = varInfo.path.slice(1);
      varInfo.path = first + '[' + rest.join('][') + ']';
    }
    return varInfo;
  }); // parts.map

  // join the parts to a query-string url-component
  const queryString = parts.map(function (varInfo) {
    return varInfo.path + '=' + varInfo.val;
  }).join('&');
  if (urlEncode) {
    return encodeURIComponent(queryString)
  }
  else {
    return queryString
  }
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
  code: ? number

  constructor (msg: any, code?: number) {
    super(msg)
    this.code = code
  }
}

export async function post (path: string, params: Object, body: Object) {
  const opts: FetchOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
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
    const err = new APIError(responseBody.message || 'Error')
    err.code = responseBody.code
    err.message = responseBody.message
    throw err
  }

  return responseBody
}

export async function get (uri: string, params?: $Subtype<Object> = {}): Promise<*> {
  const encoded = _encodeQueryParams(params)
  uri += encoded

  const opts = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }

  const res: any = await fetch(uri, opts)

  if (!res.ok) {
    throw new APIError(`API returned status ${res.status}`, res.status)
  }

  return await res.json()
}
