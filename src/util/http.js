import _ from 'lodash'

function _encodeQueryParams (query) {
  const encoded = Object.keys(query)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
    .join('&')
  return encoded
}

export async function post (path, params, body) {
  const opts = {
    method:  'POST',
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json'
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
    const err   = new Error(responseBody.message || 'Error')
    err.code    = responseBody.code
    err.message = responseBody.message
    throw err
  }

  return responseBody
}

export async function get (path, params) {
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

  console.log(`GET ${path}`)

  const res        = await fetch(path, opts)
  let responseBody = await res.text()

  try {
    responseBody = JSON.parse(responseBody)
  }
  catch (err) {}

  if (_.isString(responseBody)) {
    console.log(`GET ${path}`, responseBody)

    return responseBody
  }
  else {
    if (responseBody && !responseBody.ok) {
      const err   = new Error(responseBody.message || 'Error')
      err.code    = responseBody.code
      err.message = responseBody.message
      throw err
    }

    console.log(`GET ${path}`, JSON.stringify(responseBody))

    return responseBody
  }
}