/* @flow */


export const Stats = {
  cpuUsage:                'cpuUsage',
  swapUsedPercentage:      'swapUsedPercentage',
  memoryUsedPercentage:    'memoryUsedPercentage',
  averageLoad:             'averageLoad',
  percentageDiskSpaceUsed: 'percentageDiskSpaceUsed',
  processInfo:             'processInfo',
}

export type ServerDefinition = {
  name: string,
  ssh: {
    host: string,
    username: string,
    password?: string,
    privateKey?: string,
  },
  paths?: string[],
  processes?: ProcessDefinition[],
}

export type ProcessDefinition = {
  grep: string,
  id: string,
  name?: string,
  count?: number | number[],
}

export type Datum = {
  server: ServerDefinition,
  type: Stat,
  value: any,
  extra: {
    [key:string]: any
  }
}

export type Stat =  $Keys<typeof Stats>;
