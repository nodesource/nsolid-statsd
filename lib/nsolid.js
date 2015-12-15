'use strict'

const child_process = require('child_process')

const util = require('./util')

exports.createClient = createClient

function createClient (conf) {
  return new NSolidClient(conf)
}

class NSolidClient {
  constructor (conf) {
    this.conf = conf
    this.instances = new Map()
    this.cliOpts = `--hub=${conf.nsolidAddress} --timeout=${conf.timeout}`
    if (conf.app) this.cliOpts = `${this.cliOpts} --app="${conf.app}"`

    this.gcInterval = setInterval(() => this.gc(), 1000 * 60)

    util.debug(`created nsolid client: ${conf.nsolidAddress}`)
  }

  // clear out dead stuff
  gc () {
    const dateNow = Date.now() / 1000
    const toDelete = []

    for (let keyVal of this.instances) {
      if (dateNow - keyVal[1].lastUpdate > 10 * this.conf.timeout) {
        toDelete.push(keyVal[0])
      }
    }

    for (let key of toDelete) {
      this.instances.delete(key)
      util.debug(`deleted stale app ${key} from cache`)
    }
  }

  getInfo (cb) {
    this.nsolidCommand('info', (err, data) =>
      this.gotInfo(err, data, cb)
    )
  }

  getProcessStats (cb) {
    this.nsolidCommand('process_stats', (err, data) =>
      this.gotStats(err, data, cb)
    )
  }

  getSystemStats (cb) {
    this.nsolidCommand('system_stats', (err, data) =>
      this.gotStats(err, data, cb)
    )
  }

  // this method has a side effect of updating this.instances
  gotInfo (err, data, cb) {
    if (err) return cb(err)
    if (!data) data = []

    const lastUpdate = Date.now() / 1000

    // refill our instances cache
    for (let datum of data) {
      const id = datum.meta.id
      const found = this.instances.has(id)
      const instance = found ? this.instances.get(id) : {}

      instance.lastUpdate = lastUpdate

      if (found) continue

      instance.app = util.normalizeName(datum.meta.app)

      let tags = datum.reply.tags || []
      tags = tags.map(tag => util.normalizeName(tag))
      instance.tags = tags.join(',')

      this.instances.set(id, instance)
    }

    cb(null, data)
  }

  gotStats (err, data, cb) {
    if (err) return cb(err)
    if (!data) data = []

    for (let datum of data) {
      if (!datum.meta) return cb(new Error('N|Solid response has no reply'))

      if (!this.instances.has(datum.meta.id)) {
        // If we're missing info, get it, continue after we got it.
        // Note callback data from getInfo() is ignored, as we're just wanting
        // the side effect of getting this.instances updated.
        this.getInfo(err => this.gotStats2(err, data, cb))
        return
      }
    }

    this.gotStats2(err, data, cb)
  }

  // adds app and tags to N|Solid reply
  gotStats2 (err, data, cb) {
    if (err) return cb(err)
    if (!data) data = []

    // add app and tags to data
    for (let datum of data) {
      if (this.instances.has(datum.meta.id)) {
        const instance = this.instances.get(datum.meta.id)
        datum.reply.app = instance.app
        datum.reply.tags = instance.tags

        continue
      }

      // couldn't find instance
      datum.reply.app = util.normalizeName(datum.meta.app || 'unknown')
      datum.reply.tags = ''
    }

    cb(null, data)
  }

  // invoke an nsolid command, send JSON to callback
  nsolidCommand (command, cb) {
    const cmd = `nsolid-cli ${this.cliOpts} ${command}`
    util.debug(`invoking ${cmd}`)
    child_process.exec(cmd, execCB)

    function execCB (err, stdout, stderr) {
      if (err) {
        util.debug(`error invoking ${cmd}; code:${err.code}; signal:${err.signal}`)
        return cb(err)
      }

      let data = '' + stdout

      try {
        data = data.trim()
        if (data === '') return cb(null, null)

        data = data.trim().split('\n').map(function (datum) {
          return JSON.parse(datum)
        })
      } catch (err) {
        util.debug(`error parsing nsolid-cli response: ${data}`)
        return cb(err)
      }

      for (let datum of data) {
        if (!datum) return cb(new Error('N|Solid instance data was null'))
        if (!datum.meta) return cb(new Error('N|Solid instance metadata was null'))

        // This can happen for instances that have recently died; there may
        // be an error property instead of reply.  But let's dummy a reply
        // up and we'll catch the non-existant properties of it later.
        if (!datum.reply) datum.reply = {}
      }

      util.debug(`obtained ${data.length} records from ${cmd}`)
      cb(null, data)
    }
  }
}
