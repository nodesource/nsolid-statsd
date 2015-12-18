'use strict'

const dgram = require('dgram')

const camelize = require('camelize')

const util = require('./util')

const ProcessStats =
  'uptime rss heapTotal heapUsed active_requests active_handles cpu'.split(' ')

const SystemStats =
  'freemem uptime load_1m load_5m load_15m cpu_speed'.split(' ')

const CamelStats = new Map()
for (let stat of ProcessStats) CamelStats.set(stat, camelize(stat))
for (let stat of SystemStats) CamelStats.set(stat, camelize(stat))

exports.createClient = createClient

function createClient (conf) {
  const parts = util.parseAddress(conf.statsdAddress)
  const host = parts[0]
  const port = parseInt(parts[1], 10)

  return new StatsdClient(host, port, conf)
}

class StatsdClient {
  constructor (host, port, conf) {
    this.host = host
    this.port = port
    this.conf = conf
    this.socket = dgram.createSocket('udp4')

    util.debug(`created statsd client: ${host}:${port}`)
  }

  sendNSolidProcessStats (stats) {
    this.sendNSolidStats('process', ProcessStats, stats)
  }

  sendNSolidSystemStats (stats) {
    stats = filterUniqueHosts(stats)
    this.sendNSolidStats('system', SystemStats, stats)
  }

  sendNSolidStats (type, fields, stats) {
    for (let stat of stats) {
      stat = stat.reply
      for (let statName of fields) {
        const statCamel = CamelStats.get(statName)
        if (!statCamel) continue

        const metricName = `${this.conf.prefix}.${stat.app}.${type}.${statCamel}`
        this.sendGauge(metricName, stat[statName], stat.tags)
      }
    }
  }

  sendGauge (name, val, tags) {
    // doc for statsd gauge format and dogstatsd extensions:
    // http://docs.datadoghq.com/guides/dogstatsd/#datagram-format

    if (val == null) return

    let msg = `${name}:${val}|g`

    if (this.conf.tags && tags) {
      msg = `${msg}|#${tags}`
    }

    util.debug(`sending statsd packet: ${msg}`)
    msg = new Buffer(msg)

    this.socket.send(msg, 0, msg.length, this.port, this.host, onSend)

    function onSend (err, bytes) {
      if (err) return console.error(`error sending statsd gauge: ${err}`)
    }
  }
}

// filter output of system_stats for unique hosts, removing dups
function filterUniqueHosts (system_stats) {
  const result = []
  const hosts = new Map()

  for (let stat of system_stats) {
    const address = stat.meta.address

    // no address at all? just add it
    if (!address) {
      result.push(stat)
      continue
    }

    // get the ip address of the agent; can't get it, just add it
    const match = address.match(/^(.*):\d+$/)
    if (!match) {
      result.push(stat)
      continue
    }

    const appHost = `${stat.meta.app}:${match[1]}`

    // already have this app+host?  skip
    if (hosts.has(appHost)) {
      util.debug(`skipping duplicate app/host system stats: ${appHost}`)
      continue
    }

    hosts.set(appHost, true)
    result.push(stat)
  }

  return result
}
