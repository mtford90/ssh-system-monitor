export type Server = {
  name: string,
  ssh: {
    host: string,
    username: string,
    password?: string,
    privateKey?: string,
  },
  paths: string[],
}

export type Stat = 'cpuUsage' | 'swapUsedPercentage' | 'memoryUsedPercentage' | 'averageLoad' | 'percentageDiskSpaceUsed'
