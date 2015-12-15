'use strict'

const test = require('tape')
const util = require('../lib/util')

runTests()

function runTests () {
  test('normalizeName', function (t) {
    t.equal(util.normalizeName(''), '')
    t.equal(util.normalizeName('a'), 'a')
    t.equal(util.normalizeName('-'), '-')
    t.equal(util.normalizeName('_'), '_')

    t.equal(util.normalizeName('a-b_c--3'), 'a-b_c--3')
    t.equal(util.normalizeName('a-b$c--3'), 'a-b-c--3')
    t.equal(util.normalizeName('a-#_c--3'), 'a--_c--3')
    t.equal(util.normalizeName('%-b_c--^'), '--b_c---')

    t.equal(util.normalizeName('  '), '')
    t.equal(util.normalizeName('  a  '), 'a')
    t.equal(util.normalizeName('  a & b '), 'a---b')

    t.end()
  })

  test('parseAddress', function (t) {
    t.deepEqual(util.parseAddress('example.com:80'), ['example.com', '80'])
    t.end()
  })

  test('normalizeAddress', function (t) {
    t.equal(util.normalizeAddress('', 42), 'localhost:42')
    t.equal(util.normalizeAddress(':', 9000), 'localhost:9000')
    t.equal(util.normalizeAddress('locohost', 666), 'locohost:666')
    t.equal(util.normalizeAddress('2001', 2002), 'localhost:2001')
    t.equal(util.normalizeAddress('example.com:80', 8080), 'example.com:80')
    t.equal(util.normalizeAddress('http://example.com:80', 8081), 'http://example.com:80')
    t.equal(util.normalizeAddress('http://example.com', 80), 'http://example.com:80')
    t.equal(util.normalizeAddress('https://example.com', 443), 'https://example.com:443')
    t.equal(util.normalizeAddress('http://', 80), 'http://localhost:80')
    t.equal(util.normalizeAddress('http://:', 80), 'http://localhost:80')
    t.equal(util.normalizeAddress('http://:81', 80), 'http://localhost:81')
    t.equal(util.normalizeAddress(':::80', 8082), ':::80')
    t.equal(util.normalizeAddress('locohost:', 8083), 'locohost:8083')
    t.equal(util.normalizeAddress(':8084', 8085), 'localhost:8084')
    t.throws(() => util.normalizeAddress('localhost:x'), /non-numeric port specified in address/)
    t.end()
  })
}
