'use strict'

const fs = require('fs')
const path = require('path')
const ChildProcess = require('child_process')

const test = require('tape')

const pkg = require('../package.json')
const ThisFile = path.basename(__filename)
const AppFile = path.join(path.dirname(__dirname), 'daemon.js')
const HelpFile = path.join(path.dirname(__dirname), 'lib', 'help.md')

const HelpText = fs.readFileSync(HelpFile, 'utf8').trim()
const VersionText = pkg.version

runTests()

function runTests () {
  test(`${ThisFile} -h`, function (t) {
    runApp('-h', 2000, (err, stdout, stderr) => {
      t.equal(err, null, 'err should be null')
      t.equal(stdout.trim(), HelpText, 'stdout should be help text')
      t.equal(stderr, '', 'stderr should be empty')

      t.end()
    })
  })

  test(`${ThisFile} --help`, function (t) {
    runApp('--help', 2000, (err, stdout, stderr) => {
      t.equal(err, null, 'err should be null')
      t.equal(stdout.trim(), HelpText, 'stdout should be help text')
      t.equal(stderr, '', 'stderr should be empty')

      t.end()
    })
  })

  test(`${ThisFile} ?`, function (t) {
    runApp('?', 2000, (err, stdout, stderr) => {
      t.equal(err, null, 'err should be null')
      t.equal(stdout.trim(), HelpText, 'stdout should be help text')
      t.equal(stderr, '', 'stderr should be empty')

      t.end()
    })
  })

  test(`${ThisFile} -v`, function (t) {
    runApp('-v', 2000, (err, stdout, stderr) => {
      t.equal(err, null, 'err should be null')
      t.equal(stdout.trim(), VersionText, 'stdout should be version text')
      t.equal(stderr, '', 'stderr should be empty')

      t.end()
    })
  })

  test(`${ThisFile} --version`, function (t) {
    runApp('--version', 2000, (err, stdout, stderr) => {
      t.equal(err, null, 'err should be null')
      t.equal(stdout.trim(), VersionText, 'stdout should be version text')
      t.equal(stderr, '', 'stderr should be empty')

      t.end()
    })
  })

  test(`${ThisFile} bad statsd port`, function (t) {
    runApp('localhost:x', 2000, (err, stdout, stderr) => {
      t.notEqual(err, null, 'err should not be null')

      err = err || {}
      t.equal(err.code, 1, 'err.code should be 1')

      t.equal(stdout, '', 'stdout should be empty')
      t.notEqual(stderr, '', 'stderr should not be empty')

      t.end()
    })
  })

  test(`${ThisFile} bad storage port`, function (t) {
    runApp(': localhost:x', 2000, (err, stdout, stderr) => {
      t.notEqual(err, null, 'err should not be null')

      err = err || {}
      t.equal(err.code, 1, 'err.code should be 1')

      t.equal(stdout, '', 'stdout should be empty')
      t.notEqual(stderr, '', 'stderr should not be empty')

      t.end()
    })
  })
}

// run this app as a cli, passing specfied cli parameters
// calls cb(err, stdout, stderr), where stdout/stderr are strings
function runApp (parameters, timeout, cb) {
  const cmd = `node ${AppFile} ${parameters}`
  ChildProcess.exec(cmd, execCB)

  let finished = false
  setTimeout(timedOutCB, timeout)

  function execCB (err, stdout, stderr) {
    if (finished) return
    finished = true

    cb(err, stdout, stderr)
  }

  function timedOutCB () {
    if (finished) return
    finished = true

    cb(new Error('timed out'))
  }
}
