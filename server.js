/**
 * Node 服务端渲染入口
 */

const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const favicon = require('serve-favicon')
const compression = require('compression')
const microcache = require('route-cache')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')

const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`
const argvs = require('yargs').argv // 获取命令行参数
const {
  env = 'development' // 开发环境，测服/正式服，默认测服
} = argvs // 获取命令行参数
const lang = process.env.MAIN_LANG || argvs.lang || 'my-en'// 主要语言（第一语言），默认为 'my-en'
const staticSource = process.env.STATIC_SOURCE || argvs.staticSource || 's3'// 静态资源来源
const distPath = staticSource === 's3' ? 'dist-static' : 'dist-ssr'
const localDev = !!((argvs.localDev && (argvs.localDev === 'true' || argvs.localDev === 1))) || false // 本地开发还是静态化打包。本地开发是为 true。默认为 false
const useMicroCache = process.env.MICRO_CACHE !== 'false'

const app = express()

function createRenderer (bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(bundle, Object.assign(options, {
    // for component caching
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve(`./${distPath}/${lang}/`),
    // recommended for performance
    runInNewContext: false
  }))
}

const ampInfo = {
  type: false,
  ampRouteName: '',
  ampCustomEleScripts: []
}
let renderer
let readyPromise
const templatePath = resolve('./src/index.template.html')
if (!localDev) { // build
  console.log('localDev', localDev, lang)
  // In production: create server renderer using template and built server bundle.
  // The server bundle is generated by vue-ssr-webpack-plugin.
  const template = fs.readFileSync(templatePath, 'utf-8')
  const bundle = require(`./${distPath}/${lang}/vue-ssr-server-bundle.json`)
  // The client manifests are optional, but it allows the renderer
  // to automatically infer preload/prefetch links and directly add <script>
  // tags for any async chunks used during render, avoiding waterfall requests.
  const clientManifest = require(`./${distPath}/${lang}/vue-ssr-client-manifest.json`)
  renderer = createRenderer(bundle, {
    template,
    clientManifest
  })
} else { // dev
  // In development: setup the dev server with watch and hot-reload,
  // and create a new renderer on bundle / index template update.
  const webpackParams = { lang, localDev, env }
  readyPromise = require('./build/setup-dev-server')(
    app,
    templatePath,
    webpackParams,
    (bundle, options) => {
      renderer = createRenderer(bundle, options)
    }
  )
}

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: !localDev ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(compression({ threshold: 0 }))
// app.use(favicon('./public/logo-48.png'))
app.use(`/${distPath}/${lang}`, serve(`./${distPath}/${lang}/`, true))
app.use('/public', serve('./public', true))
app.use('/manifest.json', serve('./manifest.json', true))

// since this app has no user-specific content, every page is micro-cacheable.
// if your app involves user-specific content, you need to implement custom
// logic to determine whether a request is cacheable based on its url and
// headers.
// 1-second microcache.
// https://www.nginx.com/blog/benefits-of-microcaching-nginx/
app.use(microcache.cacheSeconds(!localDev ? 1800 : 0, req => useMicroCache && req.originalUrl))

function render (req, res) {
  const s = Date.now()

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Server', serverInfo)

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if (err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  const defaultTDK = require('./static-cli/common/getDefaultTDK')(lang, !localDev)
  const context = {
    ...defaultTDK,
    url: req.url,
    lang: lang.split('-')[1]
  }

  renderer.renderToString(context, async (err, html) => {
    if (err) {
      console.log('接口err>>>>', err)
      return handleError(err)
    }
    // 判断是否是 amp 访问路由，是 amp 页面则删除外链 script，并添加相关的 amp 页面配置
    if (ampInfo.type) {
      const convertHtmlToAMP = require('./static-addition-config/common/convertHtmlToAMP')
      const { ampRouteName, ampCustomEleScripts } = ampInfo
      html = await convertHtmlToAMP({ html, routeName: ampRouteName, inlineCss: localDev, removeScriptLink: !localDev, ampCustomEleScripts })
    }
    res.send(html)
    if (localDev) {
      console.log(`whole request: ${Date.now() - s}ms`)
    }
  })
}

app.get('*', (req, res) => {
  const query = req.query || {}
  // eslint-disable-next-line no-prototype-builtins
  ampInfo.type = query.hasOwnProperty('ampRouteName') || false // amp 访问链接携带 ?ampRouteName=** 参数
  ampInfo.ampRouteName = query.ampRouteName || ''
  ampInfo.ampCustomEleScripts = require('./src/views/amp/customElement')[ampInfo.ampRouteName] || []
  if (!localDev) {
    render(req, res, ampInfo.type)
  } else {
    readyPromise.then(() => render(req, res, ampInfo.type))
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
