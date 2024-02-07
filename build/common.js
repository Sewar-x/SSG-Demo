const webpack = require('webpack')
// const consola = require("consola");
const { COUNTRY_MAP_CDN_HOST } = require('../src/enum')


// Compiler 类，用于执行 webpack 构建
class Compiler {
  constructor(options) {
    // 构建参数
    this.options = options
  }
  // 执行构建
  run() {
    return new Promise((resolve, reject) => {
      // 通过 webpack 对象执行构建
      webpack(this.options).run((err, stat) => {
        if (err || stat.hasErrors()) {
          // 获取构建结果信息
          const info = stat.toJson()
          return reject({
            error: err || info.errors,
            warning: info.warnings
          })
        }
        return resolve(true)
      })
    })
  }
}

/**
 * 获取命令行传入的国家语言标识
 * @param {*} argvLang 1. npm run dev/start: 通过 node 环境获取，--PAGE_LANG=** 传入，require('yargs').argv.PAGE_LANG 获取
 * @param {*} processLang 2. npm run build: 通过 cross-env 设置，PAGE_LANG=** 传入，process.env.PAGE_LANG 获取
 */
function getCmdLang(argvLang = '', processLang = '') {
  return argvLang || processLang
}

/**
 * 获取主题样式标识
 * @param {*} lang
 */
function getStyleVarByLang(lang) {
  switch (lang) {
    case 'th-th':
    case 'id-id':
    case 'ph-en':
      return 'autofun'
    default:
      return 'main'
  }
}

/**
 * 获取 S3 发布域名
 * @param {*} env
 * @param {*} lang
 */
function getPublishPath({ env = 'development', lang = 'my-en' }) {
  const countryCode = lang.split('-')[0]
  return env === 'production'
    ? `${COUNTRY_MAP_CDN_HOST[countryCode]}/${lang}/`
    : `https://xxxx.amazonaws.com/${lang}/`
}

module.exports = {
  getCmdLang,
  getStyleVarByLang,
  getPublishPath,
  Compiler
}
