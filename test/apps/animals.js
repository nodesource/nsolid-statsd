'use strict'

const cluster = require('cluster')

const apps = [
  {name: 'Baleful Beluga'},
  {name: 'Demanding Dimetrodon', tags: 'type:dino,big'},
  {name: 'Malevolent Muskrat', tags: 'type:mammal,small'},
  {name: 'Persnickety Pachyderm', tags: 'type:mammal,big'},
  {name: 'Zany Zebra', tags: 'type:mammal,medium'}
]

if (process.argv.length === 2) {
  console.log('expecting value of NSOLID_HUB to be passed as a parameter')
  process.exit(1)
}

const NSOLID_HUB = process.argv[2]

cluster.isMaster ? master() : worker()

// master starts a number of workers, based on apps data structure
function master () {
  cluster.on('exit', workerExited)

  console.log(`starting apps with NSOLID_HUB set to ${NSOLID_HUB}`)

  for (let app of apps) {
    // set env vars from the apps data structure
    const env = {
      NSOLID_HUB: NSOLID_HUB,
      NSOLID_APPNAME: app.name
    }

    if (app.tags) {
      env.NSOLID_TAGS = app.tags
    }

    // start two instances of each app
    for (let i = 0; i < 2; i++) {
      cluster.fork(env)
    }
  }
}

// each app instances prints a bit about itself, and then doesn't do much
function worker () {
  const name = process.env.NSOLID_APPNAME || '<not set>'
  const tags = process.env.NSOLID_TAGS || '<not set>'
  console.log(`starting: ${name} with tags: ${tags}`)

  setInterval(doNothing, 1000)
}

function doNothing () {
}

function workerExited (worker, code, signal) {
  const app = apps[cluster.worker.id - 1]
  console.log('worker %s died: %s', app, signal || code)
}
