'use strict'

const nsolid = require('../../lib/nsolid')

const secondsString = process.argv[2] || '10'

const totalSeconds = parseInt(secondsString, 10)
if (isNaN(totalSeconds)) {
  console.error(`expecting seconds to record as parameter`)
  process.exit(1)
}

const proxyAddress = process.env.NSOLID_PROXY || 'localhost:9000'
console.error(`collecting data from ${proxyAddress}`)
console.error(`recording for ${totalSeconds} seconds, writing to stdout ...`)

setTimeout(onFinished, 1000 * totalSeconds)

const conf = {
  nsolidAddress: proxyAddress
}

const nsolidClient = nsolid.createClient(conf)
let currentSeconds = 0

setInterval(getData, 1000)

function getData () {
  nsolidClient.getInfo(handler(currentSeconds, 'info'))
  nsolidClient.getProcessStats(handler(currentSeconds, 'process_stats'))
  nsolidClient.getSystemStats(handler(currentSeconds, 'system_stats'))

  currentSeconds++
}

function handler (seconds, command) {
  return gotData

  function gotData (err, data) {
    if (err) return logError(err, command)
    genOutput(command, seconds, data)
  }
}

function logError (err, command) {
  console.error(`error running N|Solid commad ${command}: ${err}`)
  console.error(err.stack)
}

function genOutput (command, seconds, response) {
  const result = {
    time: seconds,
    command: command,
    response: response
  }

  console.log(JSON.stringify(result))
}

function onFinished () {
  process.exit(0)
}
