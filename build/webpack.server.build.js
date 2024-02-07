const { Compiler } = require('./common')
const consola = require('consola')
const serverWebpack = require('./webpack.server.config')

;(async function () {
  try {
    const argvs = require('yargs').argv
    const serverConfig = serverWebpack(argvs)
    const ServerCmpiler = new Compiler(serverConfig)
    await ServerCmpiler.run()
  } catch (error) {
    consola.error(error)
  }
})()
