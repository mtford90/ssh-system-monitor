export start from './api'

import log from './monitors/logMonitor'
import nedb from './monitors/nedbMonitor'
import slack from './alerting/slack'

export const monitors = {log, nedb}
export const alerting = {slack}
