/* @flow */

import {getLogger} from './util/log'

export default {
  alerting:  {
    slack: getLogger('alerting/slack', 'info')
  },
  logging:   {
    Logger: getLogger('logging/Logger', 'info')
  },
  Monitor:   getLogger('Monitor', 'info'),
  pool:      getLogger('pool', 'info'),
  server:    getLogger('server', 'info'),
  routers:   {
    api: getLogger('routers/api', 'info'),
  },
  storage:   {
    NEDBDataStore: getLogger('storage/NEDBDataStore', 'info'),
  },
  util:      {
    http: getLogger('util/http', 'info'),
  },
  platforms: {
    linux: {
      system: getLogger('platforms/linux/system', 'info')
    }
  }
}