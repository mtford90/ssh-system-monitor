import {monitors, alerting, DataTypes} from '../../src'

import {servers} from '../../src/dev/config'

const monitor = monitors.log(servers)

alerting.slack(monitor, {
  slack:    {
    webhook:  'https://hooks.slack.com/services/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',
    username: 'Monitoring',
    channel:  '#alerts',
  },
  callback: data => {
    const host  = data.server.ssh.host
    const value = data.value

    switch (data.type) {
      case DataTypes.CpuUsage:
        return false // Never send an alert
      case DataTypes.SwapUsed:
        return false // Never send an alert
      case DataTypes.MemoryUsed:
        return value > 0.7;
      case DataTypes.AverageLoad: {
        return false
      }
      case DataTypes.DiskSpaceUsed:
        return value > 0.7;
      default:
        return false
    }
  },
  limit:    20000 // Don't send each alert more than every 20s
})

const terminate = () => {
  monitor.terminate()
}

process.on('SIGTERM', terminate).on('SIGINT', terminate).on('SIGHUP', terminate)