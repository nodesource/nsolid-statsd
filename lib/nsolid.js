'use strict'

const util = require('./util')
const Client = require('nsolid-apiclient')

exports.createClient = createClient

function createClient (conf) {
  return new NSolidClient(conf)
}

class NSolidClient {
  constructor (conf) {
    this.conf = conf
    this.client = new Client(conf.nsolidAddress)

    util.debug(`created nsolid client: ${conf.nsolidAddress}`)
  }

  getMetrics (cb) {
    var opts = {
      start: 0,
      app: this.conf.app
    }
    this.nsolidCommand('metrics', opts, (err, data) =>
      this.gotMetrics(err, data, cb)
    )
  }

  gotMetrics (err, data, cb) {
    if (err) return cb(err)
    if (!data) data = {}

    data.app = util.normalizeName(data.app || 'untitled application')
    cb(null, data)
  }

  // invoke an nsolid command, send JSON to callback
  nsolidCommand (command, opts, cb) {
    util.debug(`invoking ${command}`)

    const resultStream = this.client.read(command, opts)

    resultStream.on('data', chunk => {
      let data = JSON.parse(chunk)
      cb(null, data)
    })

    resultStream.on('response', () => {
      console.log('Connection established with N|Solid Storage')
    })

    resultStream.on('error', err => {
      util.debug(`error invoking ${command}; code:${err.code}; signal:${err.signal}`)
      cb(err)
      setTimeout(() => this.nsolidCommand(command, opts, cb), 500)
    })

    resultStream.on('end', err => {
      cb(new Error(`Query stream ended unexpectedly, trying again: ${err}`))
      setTimeout(() => this.nsolidCommand(command, opts, cb), 500)
    })
  }
}
