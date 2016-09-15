#!/usr/bin/env node

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

process.title = 'nsolid-statsd'

console.log(`Sending metrics to:   statsd server: ${conf.statsdAddress}`)
console.log(`Sending metrics from: N|Solid storage: ${conf.nsolidAddress}`)

// This creates a stream and only has to be done once
nsolidClient.getMetrics(gotNSolidMetrics)

function gotNSolidMetrics (err, stats) {
  if (err) return console.error(`Error getting N|Solid process stats: ${err.message}`)
  if (!stats) return

  statsdClient.sendNSolidMetrics(stats)
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
