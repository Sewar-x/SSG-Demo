const { Compiler } = require('./common')
const consola = require('consola')
const clientWebpack = require('./webpack.client.config')

// 立即执行函数
;(async function () {
  try {
    // 获取命令行参数
    const argvs = require('yargs').argv
    // 获取 Client webpack 构建配置
    const clientConfig = clientWebpack(argvs)
    // 创建 webpack 实例
    const ClientCmpiler = new Compiler(clientConfig)
    // 启动 webpack 构建
    await ClientCmpiler.run()
  } catch (error) {
    consola.error(error)
  }
})()
