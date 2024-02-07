const { argv } = require('yargs')
const consola = require('consola')

const {
  _ROUTES_NULL, // 路由表为空
  _STATIC_ROUTE, // 静态路由
  _DYNAMIC_ROUTE // 动态路由
} = require('../common/routeState')

// host
const hostMap = require('../../src/api/hostMap')

class Argv {
  /**
   * @param {String} target 静态化目标路由名称，对应 src/router/routes.js 中的 name
   * @param {String} params 参数（构建动态路由或者处理页面发布路径用）
   * @param {String} lang 国家语言标识默认 'my-en'
   * @param {String} secondLang 一国多语言标识，第二语言，默认为空
   * @param {String} env 发布环境，默认 'production', 'test' or 'production'
   * @param {Boolean} webpack 是否执行 webpack 流程
   * @param {*} groupCount 静态化页面打包每次分组数量
   */
  constructor ({ target = '', params = null, lang = 'my-en', secondLang = '', env = 'production', webpack = true, groupCount = 10 }) {
    this._argvs = null

    this.routerName = target //静态化目标路由名称，对应 src/router/routes.js 中的 name
    this.params = params //参数（构建动态路由或者处理页面发布路径用）
    this.lang = lang // 国家语言标识
    this.secondLang = secondLang //一国多语言标识，第二语言，默认为空
    this.env = Array.isArray(env) ? env[env.length - 1] : env //发布环境，默认 'production', 'test' or 'production'
    this.host = hostMap[env === 'production' ? env : 'development'][lang] // 发布站点 url
    this.webpack = webpack != 'false' && webpack != 0 // 是否执行 webpack 流程
    this.groupCount = Number(groupCount) // 静态化页面打包每次分组数量，并发执行打包数量
    this.routes = require('../../src/router/routes')({ lang }) // 静态路由
  }
  // 参数格式化
  static run (options = {}) {
    return Argv.from(options).run()
  }
  // 创建 Argv 单例
  static from (options = {}) {
    if (this._argvs instanceof Argv) {
      return this._argvs
    }
    this._argvs = new Argv(options)
    return this._argvs
  }

  async run () {
    // 获取路由对象和状态
    const routeStateObj = this._getRouteState()
    const cmdOptions = { // 参数选项
      target: this.routerName,
      params: this.params,
      lang: this.lang,
      env: this.env,
      host: this.host,
      webpack: this.webpack,
      secondLang: this.secondLang,
      groupCount: this.groupCount
    }
    switch (routeStateObj.routeState) {
      case _ROUTES_NULL: // 路由表为空
        return Promise.reject('Route List is Null!')
      case _STATIC_ROUTE: // 静态路由，返回参数选项和路由状态对象
        return Promise.resolve({
          ...routeStateObj,
          ...cmdOptions
        })
      case _DYNAMIC_ROUTE:// 动态路由，返回参数选项和路由状态对象
        return Promise.resolve({
          ...routeStateObj,
          ...cmdOptions
        })
      default:
        break
    }
  }

  /**
   * 获取路由对象和状态
   */
  _getRouteState () {
    // 路由对象为空，返回路由状态标识
    if (!this.routes.length) {
      return { routeState: _ROUTES_NULL }
    }
    // 从项目中定义的路由对象中查找参数指定的路由对象，并返回路由状态
    const routeStateObj = this.routes.find(item => {
      if (item.name === this.routerName) {
        const ifDynamicRoute = item.name === this.routerName && item.path.includes(':') // 动态路由
        delete item.component
        item.routeState = ifDynamicRoute ? _DYNAMIC_ROUTE : _STATIC_ROUTE
        return item
      }
    })
    return routeStateObj
  }
}

module.exports = Argv
