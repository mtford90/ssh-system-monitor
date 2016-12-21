export start from './api'

import log from './monitors/logMonitor'
import nedb from './monitors/nedbMonitor'
import slack from './alerting/slack'
import * as commands from './commands/constants'

export const monitors  = {log, nedb}
export const alerting  = {slack}
export const DataTypes = commands
