'use strict'

const MAX_NAME_LEN = 200
const INVALID_NAME_CHARS = /[^\w\d\-_]/g

const fs = require('fs')
const path = require('path')
const util = require('util')

exports.debug = util.debuglog('nsolid')
exports.printHelp = printHelp
exports.normalizeName = normalizeName
exports.parseAddress = parseAddress
exports.normalizeAddress = normalizeAddress

function printHelp () {
  const helpFile = path.join(__dirname, 'help.md')
  const helpText = fs.readFileSync(helpFile, 'utf8')
  console.log(helpText)
}

// cache of normalized names
const NormalizedNames = new Map()

// convert a string to a normalized statsd name
function normalizeName (string) {
  if (NormalizedNames.has(string)) return NormalizedNames.get(string)

  const result = string
    .trim()
    .slice(0, MAX_NAME_LEN)
    .replace(INVALID_NAME_CHARS, '-')

  NormalizedNames.set(string, result)
  return result
}

// parse a normalized address; should be in host:port form already
function parseAddress (address) {
  if (!address) return null

  const match = address.match(/(.*):(.*)/)
  if (!match) return null

  return [match[1], match[2]]
}

// normalize an address to host:port
function normalizeAddress (address, defaultPort) {
  let hostname = ''
  let port = ''
  let protocol

  address = `${address}`

  // peel off http:// or https:// protocol
  const match = address.match(/^(https?:\/\/)(.*)$/)
  if (match) {
    protocol = match[1]
    address = match[2]
  }

  // if a hostname or port; no `:` allowed in address without a port at end
  if (address.indexOf(':') === -1) {
    // port
    if (isInteger(address)) {
      port = address
    // hostname
    } else {
      hostname = address
    }
  // has a `:` so parse as hostname:port
  } else {
    const parts = parseAddress(address)

    hostname = parts[0]
    port = parts[1]
  }

  // apply default values
  if (hostname === '') hostname = 'localhost'
  if (port === '') port = `${defaultPort}`

  if (protocol) hostname = `${protocol}${hostname}`

  if (isNaN(parseInt(port, 10))) {
    throw new Error(`non-numeric port specified in address: '${address}'`)
  }

  return `${hostname}:${port}`
}

function isInteger (string) {
  return string.match(/^\d+$/) != null
}
