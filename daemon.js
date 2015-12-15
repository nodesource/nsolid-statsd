'use strict'

const pkg = require('./package.json')
const util = require('./lib/util')
const config = require('./lib/config')
const statsd = require('./lib/statsd')
const nsolid = require('./lib/nsolid')

const conf = getConfig()
util.debug('config: %j', conf)

const statsdClient = statsd.createClient(conf)
const nsolidClient = nsolid.createClient(conf)

console.log(`sending metrics from: N|Solid proxy at: ${conf.nsolidAddress}`)
console.log(`sending metrics to:   statsd server at: ${conf.statsdAddress}`)

setInterval(getNSolidMetrics, conf.interval * 1000)

function getNSolidMetrics () {
  nsolidClient.getProcessStats(gotNSolidProcessStats)
}

function gotNSolidProcessStats (err, stats) {
  // Not doing process and system stats in parallel; these may cause an
  // info command to be run, and serializing them like this will prevent
  // multiple info commands from being invoked.  Also, if there aren't
  // any stats available, the early return here will prevent the system_stats
  // command from being run at all.

  if (!stats) return

  nsolidClient.getSystemStats(gotNSolidSystemStats)

  if (err) return console.error(`error getting N|Solid process stats: ${err}`)

  statsdClient.sendNSolidProcessStats(stats)
}

function gotNSolidSystemStats (err, stats) {
  if (err) return console.error(`error getting N|Solid system stats: ${err}`)

  if (!stats) return

  statsdClient.sendNSolidSystemStats(stats)
}

function getConfig () {
  let conf

  try {
    conf = config.getConfig('nsolid-statsd')
  } catch (e) {
    exit(1, () => console.error(e.message))
  }

  if (conf.help) exit(0, () => util.printHelp())
  if (conf.version) exit(0, () => console.log(pkg.version))

  return conf
}

// run a function, then exit with specified status code
function exit (statusCode, fn) {
  fn()
  process.exit(statusCode)
}
