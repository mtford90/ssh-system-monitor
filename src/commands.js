import Client from 'ssh2'
import keymirror from 'keymirror'
import _ from 'lodash'

const MEM_INFO_KEY = keymirror({
  MemTotal:          null,
  MemFree:           null,
  Buffers:           null,
  Cached:            null,
  SwapCached:        null,
  Active:            null,
  Inactive:          null,
  Unevictable:       null,
  Mlocked:           null,
  SwapTotal:         null,
  SwapFree:          null,
  Dirty:             null,
  Writeback:         null,
  AnonPages:         null,
  Mapped:            null,
  Shmem:             null,
  Slab:              null,
  SReclaimable:      null,
  SUnreclaim:        null,
  KernelStack:       null,
  PageTables:        null,
  NFS_Unstable:      null,
  Bounce:            null,
  WritebackTmp:      null,
  CommitLimit:       null,
  Committed_AS:      null,
  VmallocTotal:      null,
  VmallocUsed:       null,
  VmallocChunk:      null,
  HardwareCorrupted: null,
  AnonHugePages:     null,
  HugePages_Total:   null,
  HugePages_Free:    null,
  HugePages_Rsvd:    null,
  HugePages_Surp:    null,
  Hugepagesize:      null,
  DirectMap4k:       null,
  DirectMap2M:       null,
})

/**
 * @param {Client} client
 * @param {string} cmd
 * @returns {Promise}
 * @private
 */
function _execute (client, cmd) {
  return new Promise((resolve, reject) => {
    client.exec(cmd, (err, stream) => {
      if (err) reject(err)
      else {
        stream.on('data', function (data) {
          resolve(data.toString())
        }).stderr.on('data', function (data) {
          reject(new Error(data))
        })
      }
    })
  })
}

/**
 * @param {Client} client
 */
export async function cpuUsage (client) {
  const data = await _execute(
    client,
    'top -b -d1 -n1|grep -i "Cpu(s)"|head -c21|cut -d \' \' -f3|cut -d \'%\' -f1'
  )

  return parseFloat(data)
}

/**
 * @param {Client} client
 */
export async function memoryInfo (client) {
  const data = await _execute(
    client,
    'cat /proc/meminfo',
  )

  let kv = _.map(data.split('\n'), function (x) {return x.split(':')});
  kv.pop(); // Remove spurious last val.
  kv = _.map(kv, function (x) {
    const key = x[0];
    let val   = x[1];
    if (val) {
      val = val.trim();
      if (val.indexOf('kB') != -1) val = val.substring(0, val.length - 3);
      val = parseInt(val);
    }
    return [key, val];
  });

  const info = _.reduce(kv, function (memo, x) {
    memo[x[0]] = x[1];
    return memo
  }, {});

  return info
}

/**
 * @param {Client} client
 */
export async function swapUsedPercentage (client) {
  const info = await memoryInfo(client)

  const swapFree  = info[MEM_INFO_KEY.SwapFree];
  const swapTotal = info[MEM_INFO_KEY.SwapTotal];

  const perc = swapTotal ? swapFree / swapTotal : 0

  return perc
}

/**
 * @param {Client} client
 */
export async function memoryUsedPercentage (client) {
  const info       = await memoryInfo(client)
  const memoryFree = info[MEM_INFO_KEY.MemFree];
  const cached     = info[MEM_INFO_KEY.Cached];
  const realFree   = memoryFree + cached;
  const perc       = realFree / info[MEM_INFO_KEY.MemTotal];

  return perc
}

/**
 * @param {Client} client
 */
export async function averageLoad (client) {
  let data = await _execute(
    client,
    'uptime',
  )

  let averages = data.split('load average:');


  averages = averages[averages.length - 1].trim().split(' ');

  averages = {
    1:  parseFloat(averages[0]),
    5:  parseFloat(averages[1]),
    15: parseFloat(averages[2])
  };

  return averages
}


/**
 * @param {Client} client
 * @param {string} path
 */
export async function percentageDiskSpaceUsed (client, path) {
  let data = await _execute(
    client,
    'df ' + path + ' -h | tail -n 1',
  )

  const percentageString = data.match(/\S+/g)[4];
  const percentageUsed   = parseFloat(percentageString.substring(0, percentageString.length - 1)) / 100;

  return percentageUsed
}