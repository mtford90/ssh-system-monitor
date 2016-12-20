import child_process from 'child_process'

export const servers = [
  {
    name:       'Operator Dev',
    host:       'operator-dev.barchick.com',
    username:   'root',
    privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()
  },
  {
    name:       'Operator Prod',
    host:       'operator.barchick.com',
    username:   'root',
    privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()
  },
  {
    name:       'Portal Dev',
    host:       'partner-dev.barchick.com',
    username:   'root',
    privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()
  },
  {
    name:       'Portal Prod',
    host:       'partner.barchick.com',
    username:   'root',
    privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()
  },
]