const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const chalk = require('chalk')
const consola = require('consola')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

/**
 * get server webpack config
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
      target: 'node', // 指定目标环境，这里设置为Node.js
      devtool: '#source-map', //开发过程中查看源代码maps
      entry: './src/entry-server.js',
      output: {
        filename: 'server-bundle.js',
        libraryTarget: 'commonjs2'
      },
      resolve: {
        alias: { // 路径别名
          'create-api': './create-api-server.js'
        }
      },
      //使用nodeExternals插件来外部化某些模块，避免在构建过程中包含不必要的依赖
      externals: nodeExternals({
        //whitelist 参数中被指定为忽略CSS文件的外部化，以及vant/lib模块的不外部化。
        whitelist: [/\.css$/, /vant\/lib/]
      }),
      plugins: [
        //添加一个进度条来显示构建过程中的进度。
        new ProgressBarPlugin({
          format: 'Build Server [:bar] ' + chalk.green.bold(':percent') + ' (:current/:total)',
          clear: false,
          complete: '█',
          incomplete: '░'
        }),
        //定义一些环境变量，这些变量在编译时会被替换为实际的值。
        new webpack.DefinePlugin({
          'process.env': {
            LANG: JSON.stringify(lang),
            API_ENV: JSON.stringify(env),
            VUE_ENV: '"server"'
          }
        }),
        //使用VueSSRServerPlugin插件来处理Vue组件的SSR（服务器端渲染）。
        new VueSSRServerPlugin(),
        // 解决 mini-css-extract-plugin 静态化 render route 时 document is not defined 问题
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1
        })
      ]
    })
  } catch (error) {
    consola.error(error)
  }
}
