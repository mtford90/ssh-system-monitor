import child_process from 'child_process'

export const servers = [
  {
    name:       'Operator Dev',
    ssh: {
      host:       'operator-dev.barchick.com',
      username:   'root',
      privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString(),
    }
  },
  {
    name:       'Operator Prod',
    ssh: {
      host:       'operator.barchick.com',
      username:   'root',
      privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString(),
    }
  },
  {
    name:       'Portal Dev',
    ssh: {
      host:       'partner-dev.barchick.com',
      username:   'root',
      privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString(),
    }

  },
  {
    name:       'Portal Prod',
    ssh: {
      host:       'partner.barchick.com',
      username:   'root',
      privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString(),
    },
  },
]