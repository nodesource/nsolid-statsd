'use strict'

const cluster = require('cluster')

const NSOLID_HUB = process.argv[2] || '4001'

const Apps = [
  {name: 'Elegant Elm', tags: 'geo:eu'},
  {name: 'Hoary Hemlock', tags: 'geo:ap,small'},
  {name: 'Marvelous Maple', tags: 'geo:ap,big'},
  {name: 'Old Oak', tags: 'geo:af,big'},
  {name: 'Pretty Pine'}
]

const WorkerNames = new WeakMap()

cluster.isMaster ? runMaster() : runWorker()

// master starts a number of workers, based on Apps data structure
function runMaster () {
  cluster.on('exit', workerExited)

  console.log(`starting apps with NSOLID_HUB set to ${NSOLID_HUB}`)

  for (let app of Apps) {
    // launch two instances of each app
    launchApp(app)
    launchApp(app)
  }

  setInterval(runLifecycle, 1000)
}

function launchApp (app) {
  const env = {
    NSOLID_HUB: NSOLID_HUB,
    NSOLID_APPNAME: app.name
  }

  if (app.tags) {
    env.NSOLID_TAGS = app.tags
  }

  const worker = cluster.fork(env)

  WorkerNames[worker] = app.name
}

function runLifecycle () {
  // 10% chance we kill or add a process
  if (Math.random() < 0.1) killWorker()
  if (Math.random() < 0.1) addWorker()
}

function killWorker () {
  const workers = []
  for (let workerId in cluster.workers) {
    workers.push(cluster.workers[workerId])
  }

  if (workers.length === 0) return

  const index = Math.floor(Math.random() * workers.length)
  workers[index].kill()
}

function addWorker () {
  const workerIndex = Math.floor(Math.random() * Apps.length)
  const app = Apps[workerIndex]

  launchApp(app)
}

function workerExited (worker, code, signal) {
  const pid = worker.process.pid
  const name = WorkerNames[worker]
  console.log(`died:     ${name} (${pid}): ${signal || code}`)
}

// each app instances prints a bit about itself, and then doesn't do much
function runWorker () {
  const name = process.env.NSOLID_APPNAME || '<not set>'
  const tags = process.env.NSOLID_TAGS || '<not set>'
  const pid = cluster.worker.process.pid

  console.log(`starting: ${name} (${pid}) with tags: ${tags}`)

  setInterval(doNothing, 1000)
}

function doNothing () {
}
