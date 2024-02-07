const { resolve } = require('../common/util')
const fse = require('fs-extra')
const { createBundleRenderer } = require('vue-server-renderer')
const consola = require('consola')
const getDefaultTDK = require('../common/getDefaultTDK')

class Server {
  /**
   *
   * @param {String} lang 语言
   */
  constructor({ lang = 'my-en', env = 'production', secondLang = '' }) {
    // this.app = express() 
    this._server = null // node 服务器对象
    this.lang = lang // 国家语言标识
    this.serverBundle = null // 使用 webpack 构建 entry-server 获取的服务端资源
    this.clientManifest = null // 使用 webpack 构建 entry-client 获取的客户端清单资源
    this.renderer = null // 渲染器对象
    this.secondLang = secondLang // 国家语言第二语言参数
    this.isProd = env === 'production' // 是否为生产环境
    this._init() // 开始初始化
  }

  async _init() {
    try {
      // 使用 webpack 构建 entry-server 获取的服务端资源 vue-ssr-server-bundle.json
      this.serverBundle = require(resolve(`../../dist-static/${this.lang}/vue-ssr-server-bundle.json`))
      // 使用 webpack 构建 entry-client 获取的客户端清单资源 vue-ssr-client-manifest.json
      this.clientManifest = require(resolve(`../../dist-static/${this.lang}/vue-ssr-client-manifest.json`))
      // HTML 模板资源
      const templatePath = resolve('../../src/index.template.html')
      // 创建渲染器实例
      this.renderer = this._createRenderer(this.serverBundle, {
        template: fse.readFileSync(templatePath, 'utf-8'),
        clientManifest: this.clientManifest,
        shouldPreload: (file, type) => {
          // https://fetch.spec.whatwg.org/#concept-request-destination
          return false
        },
        shouldPrefetch: (file, type) => {
          return false
        },
        runInNewContext: 'once'
      })
    } catch (error) {
      consola.error(error)
    }
  }
  // 渲染组件成 HTML 字符串
  renderHtml({ url = '' }) {
    return new Promise((resolve, reject) => {
      if (!url) { // 没有路由 url 时报错
        return reject('Not router render url!')
      }
      // 获取渲染上下文
      const context = {
        ...getDefaultTDK(this.lang, this.isProd), // 获取 TDK, SEO 三大关键： title、discription、 key
        lang: this.lang.split('-')[1],
        secondLang: this.secondLang,
        url
      }
      // 调用渲染器对象 renderToString 方法将组件渲染成 HTML 字符串
      this.renderer.renderToString(context, (err, html) => {
        if (err) {
          return reject(err)
        }
        // 返回 HTML 字符串
        return resolve(html)
      })
    })
  }
  // 创建渲染器对象
  _createRenderer(bundle, options) {
    return createBundleRenderer(bundle, Object.assign(options, {}))
  }
}

module.exports = Server
