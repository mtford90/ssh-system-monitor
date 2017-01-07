import {getLogger} from './util/log'

export default {
  alerting:  {
    slack: getLogger('alerting/slack', 'trace')
  },
  logging:   {
    Logger: getLogger('logging/Logger', 'trace')
  },
  Monitor:   getLogger('Monitor', 'debug'),
  pool:      getLogger('pool', 'trace'),
  server:    getLogger('server', 'trace'),
  routers:   {
    api: getLogger('routers/api', 'trace'),
  },
  storage:   {
    NEDBDataStore: getLogger('storage/NEDBDataStore', 'warn'),
  },
  util:      {
    http: getLogger('util/http', 'trace'),
  },
  platforms: {
    linux: {
      system: getLogger('platforms/linux/system', 'warn')
    }
  }
}