/* @flow */

export function pretty(something: any) : string {
  return JSON.stringify(something, null, 2)
}