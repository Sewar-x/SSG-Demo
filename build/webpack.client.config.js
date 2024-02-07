const webpack = require('webpack')
const merge = require('webpack-merge')
const chalk = require('chalk')
const consola = require('consola')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

/**
 * get client webpack config
 * @param {String} lang 主要语言（第一语言），默认为 'my-en'
 * @param {String} env 开发环境，测服/正式服，默认测服
 * @param {Boolean} localDev 本地开发还是静态化打包。本地开发是为 true。默认为 false
 */
module.exports = function ({
  lang = 'my-en',
  env = 'development',
  localDev = false,
  staticSource = 's3'
}) {
  try {
    // webpack 公共配置项
    const baseConfig = require('./webpack.base.config')({ lang, env, localDev, staticSource })
    // 合并 webpack 配置
    return merge(baseConfig, {
      entry: {
        app: './src/entry-client.js'
      },
      resolve: {
        alias: {
          'create-api': './create-api-client.js'
        }
      },
      plugins: [
        // 进度条插件
        new ProgressBarPlugin({
          format: 'Build Client [:bar] ' + chalk.green.bold(':percent') + ' (:current/:total)',
          clear: false,
          complete: '█',
          incomplete: '░'
        }),
        // 在 process 对象中定义不同的环境变量
        new webpack.DefinePlugin({
          'process.env': {
            LANG: JSON.stringify(lang),
            API_ENV: JSON.stringify(env),
            VUE_ENV: '"client"'
          }
        }),
        // vue 客户端渲染插件
        new VueSSRClientPlugin()
      ]
    })
  } catch (error) {
    consola.error(error)
  }
}
