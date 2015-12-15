'use strict'

const rc = require('rc')

const util = require('./util')

exports.getConfig = getConfig

const ValidOptions = '_ help version app interval timeout prefix tags'.split(' ')
const DefaultOptions = {
  interval: 10,
  timeout: 10,
  prefix: 'nsolid'
}

function getConfig (program) {
  const conf = rc(program, DefaultOptions)

  if (conf.h || conf.help || (conf._[0] === '?')) return { help: true }
  if (conf.v || conf.version) return { version: true }

  for (let optionName in conf) {
    if (ValidOptions.indexOf(optionName) === -1) {
      console.log(`invalid option ignored: '${optionName}: ${conf[optionName]}'`)
    }
  }

  conf.statsdAddress = conf._[0] || ':'
  conf.statsdAddress = util.normalizeAddress(conf.statsdAddress, 8125)

  conf.nsolidAddress = conf._[1] || ':'
  conf.nsolidAddress = util.normalizeAddress(conf.nsolidAddress, 9000)

  if (typeof conf.interval !== 'number') {
    throw new Error(`option --interval is not numeric: ${conf.interval}`)
  }

  if (typeof conf.timeout !== 'number') {
    throw new Error(`option --timeout is not numeric: ${conf.timeout}`)
  }

  return conf
}
