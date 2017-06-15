'use strict'

const dgram = require('dgram')

const util = require('./util')

const Metrics = [
  'uptime', 'rss', 'heapTotal', 'heapUsed', 'activeRequests', 'activeHandles',
  'title', 'user', 'cpu', 'freeMem', 'systemUptime', 'load1m', 'load5m', 'id',
  'load15m', 'cpuSpeed', 'app', 'hostname', 'time', 'percentCpuThreshold',
  'percentHeapThreshold', 'totalHeapSizeExecutable', 'totalPhysicalSize',
  'totalAvailableSize', 'heapSizeLimit', 'loopIdlePercent', 'loopEstimatedLag',
  'loopsPerSecond', 'loopAvgTasks', 'loopTotalCount',
  'blockInputOpCount', 'blockOutputOpCount', 'cpuPercent', 'cpuSystemPercent',
  'cpuUserPercent', 'gcForcedCount', 'gcFullCount', 'gcCount', 'gcCpuPercent',
  'gcDurUs99Ptile', 'gcDurUsMedian', 'pageFaultHardCount', 'ctxSwitchInvoluntaryCount',
  'ipcReceivedCount', 'ipcSentCount', 'gcMajorCount', 'signalCount', 'pageFaultSoftCount',
  'swapCount', 'ctxSwitchVoluntaryCount'
]

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

  sendNSolidMetrics (stats) {
    this.sendNSolidStats('process', Metrics, stats)
  }

  sendNSolidStats (type, fields, stats) {
    for (let statName of fields) {
      const metricName = `${this.conf.prefix}.${stats.app}.${stats.hostname.replace(/\./ig, '_')}.${statName}`
      this.sendGauge(metricName, stats[statName], stats.tags)
    }
  }

  sendGauge (name, val, tags) {
    // doc for statsd gauge format and dogstatsd extensions:
    // http://docs.datadoghq.com/guides/dogstatsd/#datagram-format

    if (val == null) return

    let msg = `${name}:${val}|g`

    if (this.conf.tags && tags && tags.length) {
      msg = `${msg}|#${tags.join(',')}`
    }

    util.debug(`sending statsd packet: ${msg}`)
    msg = new Buffer(msg)

    this.socket.send(msg, 0, msg.length, this.port, this.host, onSend)

    function onSend (err, bytes) {
      if (err) return console.error(`error sending statsd gauge: ${err}`)
    }
  }
}
