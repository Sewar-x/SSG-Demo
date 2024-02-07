const fs = require('fs')
const path = require('path')
const MFS = require('memory-fs')
const webpack = require('webpack')
const consola = require('consola')
const chokidar = require('chokidar')
const { createProxyMiddleware } = require('http-proxy-middleware')

const readFile = (fs, file, outputPath) => {
  try {
    return fs.readFileSync(path.join(outputPath, file), 'utf-8')
  } catch (err) {
    consola.error(err)
  }
}

module.exports = function setupDevServer (app, templatePath, webpackParams, cb) {
  try {
    const clientConfig = require('./webpack.client.config')(webpackParams)
    const serverConfig = require('./webpack.server.config')(webpackParams)
    const outputPath = clientConfig.output.path

    let bundle
    let template
    let clientManifest

    let ready
    const readyPromise = new Promise(r => { ready = r })
    const update = () => {
      if (bundle && clientManifest) {
        ready()
        cb(bundle, {
          template,
          clientManifest
        })
      }
    }

    // read template from disk and watch
    template = fs.readFileSync(templatePath, 'utf-8')
    chokidar.watch(templatePath).on('change', () => {
      template = fs.readFileSync(templatePath, 'utf-8')
      console.log('index.html template updated.')
      update()
    })

    // modify client config to work with hot middleware
    clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
    clientConfig.output.filename = '[name].js'
    clientConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
    clientConfig.optimization.noEmitOnErrors = true
    clientConfig.mode = 'development'

    // dev middleware
    const clientCompiler = webpack(clientConfig)
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
      publicPath: clientConfig.output.publicPath,
      noInfo: true
    })
    app.use(devMiddleware)
    app.use(createProxyMiddleware('/v2', {
      target: webpackParams.env === 'production' ? 'https://www.demo.my' : 'http://test.wap.demo.my',
      changeOrigin: true,
      // cookieDomainRewrite: {
      //   "*": cookieUrl // 把相应的 cookie 域都设置成 localhost
      // },
      ws: true,
      withCredentials: true
    }))
    clientCompiler.hooks.done.tap('done', stats => {
      stats = stats.toJson()
      stats.errors.forEach(err => console.error(err))
      stats.warnings.forEach(err => console.warn(err))
      if (stats.errors.length) return
      clientManifest = JSON.parse(readFile(
        devMiddleware.fileSystem,
        'vue-ssr-client-manifest.json',
        outputPath
      ))
      update()
    })

    // hot middleware
    app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

    // watch and update server renderer
    serverConfig.mode = 'development'
    const serverCompiler = webpack(serverConfig)
    const mfs = new MFS()
    serverCompiler.outputFileSystem = mfs
    serverCompiler.watch({}, (err, stats) => {
      if (err) throw err
      stats = stats.toJson()
      if (stats.errors.length) return

      // read bundle generated by vue-ssr-webpack-plugin
      bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json', outputPath))
      update()
    })

    return readyPromise
  } catch (err) {
    consola.error(err)
  }
}