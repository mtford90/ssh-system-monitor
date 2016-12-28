/* @flow */
import type {LatestStats} from '../../../../monitors/monitor'
import {getJSON} from '../../../../util/http'

export async function latest() : Promise<LatestStats> {
  const res = await getJSON('/api/latest')
  return res.latest
}