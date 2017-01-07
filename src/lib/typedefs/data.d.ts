// Logs to be consumed
export type LogDefinition = {
  name: string,
  grep: string,
  type: 'command' | 'docker' | 'file',
}

export type SSH2Options = {
  host: string,
  username: string,
  password?: string,
  privateKey?: string,
}

export type SSH2Error = {
  level: 'client-socket' | 'client-ssh', // client-socket means a socket level error, client-ssh means an SSH disconnection message
  description?: string // May be present for client-ssh
}

// A server that will be monitored
export type ServerDefinition = {
  name: string,
  ssh: SSH2Options,
  paths?: string[],
  processes?: ProcessDefinition[],
  logs?: LogDefinition[],
}

// A process that will be monitored
export type ProcessDefinition = {
  grep: string,
  id: string,
  name?: string,
  count?: number | number[],
}

// Defines the data type emitted by monitors
export type SystemDatum = {
  server: ServerDefinition,
  type: DataType,
  value: any,
  extra: {
    path?: string, // when type is percentageDiskSpaceUsed
    process?: ProcessDefinition // when type is processInfo
  },
  timestamp: number,
}

// A collection of all the latest data from a host
export type HostStatsCollection = {
  cpuUsage: number | null,
  swapUsedPercentage: number | null,
  memoryUsedPercentage: number | null,
  averageLoad: SystemAverageLoad | null,
  percentageDiskSpaceUsed: {
    [path:string]: number | null
  },
  processInfo: {
    [processId:string]: ProcessInfo | null
  }
}

// Info about a process obtained from 'ps' command
export type ProcessInfo = {
  pid: number,
  pcpu: number,
  size: number,
  vsize: number,
  rss: number,
  etime: number,
  user: string,
  started: number,
}

export type SystemAverageLoad = {
  '1': number,
  '5': number,
  '15': number,
}

export type LogSource = 'stderr' | 'stdout'

export type LoggerDatum = {
  source: LogSource,
  text: string,
  timestamp: number,
  server: ServerDefinition,
  logger: LogDefinition,
}

export type LatestHostStats = {[host:string]: HostStatsCollection}

export type DataType =  'cpuUsage' | 'swapUsedPercentage' | 'memoryUsedPercentage' | 'averageLoad' | 'percentageDiskSpaceUsed' | 'processInfo'
export type SimpleDataType = 'cpuUsage' | 'swapUsedPercentage' | 'memoryUsedPercentage' | 'averageLoad'

