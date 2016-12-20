import child_process from 'child_process'

export const server = {
  name:       'operator-dev',
  host:       'operator-dev.barchick.com',
  username:   'root',
  privateKey: child_process.execSync('cat /Users/mike/.ssh/id_rsa').toString()
}