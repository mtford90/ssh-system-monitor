/* @flow */

import {getLogger} from './util/log'

export default {
  alerting:  {
    slack: getLogger('alerting/slack', 'warn')
  },
  logging:   {
    Logger: getLogger('logging/Logger', 'warn')
  },
  Monitor:   getLogger('Monitor', 'warn'),
  pool:      getLogger('pool', 'warn'),
  server:    getLogger('server', 'info'),
  routers:   {
    api: getLogger('routers/api', 'warn'),
  },
  storage:   {
    NEDBDataStore: getLogger('storage/NEDBDataStore', 'warn'),
  },
  util:      {
    http: getLogger('util/http', 'warn'),
  },
  platforms: {
    linux: {
      system: getLogger('platforms/linux/system', 'warn')
    }
  }
}