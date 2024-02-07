const { execCmd } = require('../common/util')
const ora = require('ora')
const consola = require('consola')
const path = require('path')

class Builder {
  /**
   *
   * @param {String} lang 语言
   * @param {String} env 环境
   * @param {String} secondLang 第二语言，默认为空
   */
  constructor({ lang = 'my-en', env = 'test', secondLang = '' }) {
    this._builder = null
    this.lang = lang // 国家语言标识
    this.env = env // 发布环境
    this.secondLang = secondLang // 一国多语言，第二语言
  }
  // 参数格式化
  static run(options = {}) {
    return Builder.from(options).run()
  }
  // 创建builder 单例
  static from(options = {}) {
    if (this._builder instanceof Builder) {
      return this._builder
    }
    this._builder = new Builder(options)
    return this._builder
  }

  async run() {
    let spinnerBuild
    try {
      // shell 输出构建信息
      spinnerBuild = ora(
        `>>>> 正在构建: client \n`
      ).start()
      // 执行 client 脚本构建
      await this.runWebpackBuild('client')
      spinnerBuild.stop()
      // shell 输出构建信息
      spinnerBuild = ora(
        `>>>> 正在构建: server \n`
      ).start()
      // 执行 server 脚本构建
      await this.runWebpackBuild('server')
      spinnerBuild.stop()
      consola.success(`>>>> Build${this.env === 'test' ? ' test ' : ' '}bundles successfully!`)
    } catch (error) {
      spinnerBuild.stop()
      return Promise.reject(error)
    } finally {
      spinnerBuild.stop()
    }
  }

  // 执行 webpack 构建
  async runWebpackBuild(platform = '') {
    return new Promise(async (resolve, reject) => {
      try {
        // 构建脚本路径，根据平台参数获取
        const builderPath = path.resolve(__dirname, `../../build/webpack.${platform}.build.js`)
        // node 脚本参数
        const nodeCmd = `node ${builderPath} --lang=${this.lang} --secondLang=${this.secondLang} --env=${this.env === 'test' ? 'development' : 'production'}`
        // 执行 node 命令
        await execCmd(nodeCmd)
        consola.info(`>>>> 构建完成: ${platform} \n`)
        return resolve(true)
      } catch (error) {
        return reject(error)
      }
    })
  }
}

module.exports = Builder
