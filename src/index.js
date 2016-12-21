export start from './api'

import log from './monitors/logMonitor'
import nedb from './monitors/nedbMonitor'

export const monitors = {log, nedb}

