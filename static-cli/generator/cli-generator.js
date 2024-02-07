// support ECMAScript module loader
require = require('esm')(module/*, options */)

const Server = require('./cli-server')
const fse = require('fs-extra')
const config = require('../common/publishConfig')
const consola = require('consola')
const ora = require('ora')
const path = require('path')
const {
  resolve,
  readFileData,
  writeFileData,
  copyData
} = require('../common/util')
const {
  _ROUTES_NULL, // 路由表为空
  _STATIC_ROUTE, // 静态路由
  _DYNAMIC_ROUTE // 动态路由
} = require('../common/routeState')

class Generator {
  /**
   * @param {String} target 静态化目标路由名称，对应 src/router/routes.js 中的 name
   * @param {String} params 参数（构建动态路由或者处理页面发布路径用）
   * @param {String} lang 默认 'my-en'
   * @param {String} env 默认 'production', 'test' or 'production'
   * @param {Boolean} webpack 是否执行 webpack 流程
   * @param {String} params
   * @param {*} groupCount 静态化页面打包每次分组数量
   */
  constructor({ target = '', params = null, lang = 'my-en', env = 'production', host = '', webpack = true, groupCount = 10, secondLang = '' }) {
    this._generator = null // Generator  实例

    this.options = { ...arguments[0] }
    this.routerName = target // 静态化目标路由名称，对应 src/router/routes.js 中的 name
    this.params = params // 参数（构建动态路由或者处理页面发布路径用）
    this.lang = lang // 国家语言标识
    this.secondLang = secondLang // 国家第二语言标识
    this.env = env // 构建环境
    this.host = host // 发布服务地址
    this.webpack = webpack // 是否需要 webpack 构建
    this.config = config[env] // 发布路径配置等
    this.groupCount = groupCount // 并发构建数量
    this.routeList = require(resolve('../../src/router/routes'))({ lang }) // 所有的路由表
    this.renderRouteList = [] // 当前需要进行 render 的路由表
  }
  // 执行生成
  static run(options = {}) {
    return Generator.from(options).run()
  }
  // 生成 Generator 单例
  static from(options = {}) {
    if (this._generator instanceof Generator) {
      return this._generator
    }
    this._generator = new Generator(options)
    return this._generator
  }
  // 执行静态化生成器
  async run() {
    return new Promise(async (resolve, reject) => {
      try {
        switch (this.options.routeState) {
          case _ROUTES_NULL:  // 路由表为空
            return Promise.reject('Route List is Null!')
          case _STATIC_ROUTE: // 静态路由
            // 获取当前需要进行 render 静态路由表
            this.routeList = await this.getStaticRoutesMap()
            break
          case _DYNAMIC_ROUTE: // 动态路由
            // 获取当前需要进行 render 动态路由表
            this.routeList = await this.getDynamicRoutesMap()
            break
          default:
            break
        }
        // 路由表长度
        const routeLen = this.routeList.length
        if (routeLen) {
          consola.info(`>>>> 总共 ${routeLen} 个静态页面! `)
          const server = await new Server(this.options) // 构建服务对象
          const generatePerCount = this.groupCount // 并发构建数量
          for (let i = 0; i < routeLen; i += generatePerCount) {
            const curRouteGroup = this.routeList.slice(i, i + generatePerCount)
            // 生成路由
            await this.generateGroupRoutes(curRouteGroup, server)
            if (i + generatePerCount >= routeLen) {
              consola.success(`>>>> 静态化页面构建进度: ${routeLen} / ${routeLen}`)
              consola.success(`>>>> 所有静态化页面构建已完成!`)
              return resolve(true)
            } else {
              consola.success(`>>>> 静态化页面构建进度: ${i + generatePerCount} / ${routeLen}`)
            }
          }
        }
      } catch (error) {
        return reject(error)
      }
    })
  }
  // 获取当前需要进行 render 静态路由表
  async getStaticRoutesMap() {
    if (!this.options.target) { // 命令行参数没有生命需要进行 render 的路由 name
      return Promise.reject('>>>> target is null! 【目标路由名不能为空】')
    }
    const routeList = this.routeList.reduce((prev, cur) => {
      const isTargetRoute = cur.name === this.options.target // 是否命中目标路由
      if (isTargetRoute) {
        prev = prev.concat(cur)
      }
      return prev
    }, [])
    return routeList
  }
  // 获取当前需要进行 render 动态路由表
  async getDynamicRoutesMap() {
    return new Promise(async (resolve, reject) => {
      try {
        /** ********** 生成动态路由表，非框架逻辑 start ***********/
        // 调用 createDynamicRoutes 钩子，createDynamicRoutes 钩子通常返回动态路由列表
        let routesList = await this.callRouteHook(this.routerName, 'createDynamicRoutes', this.options)
        /** ********** 生成动态路由表，非框架逻辑 end ***********/

        // 转化数据接口 [] => [{}]
        routesList = routesList.map(item => {
          return {
            path: item,
            routeState: _DYNAMIC_ROUTE
          }
        })
        return resolve(routesList)
      } catch (error) {
        return reject(error)
      }
    })
  }
  // 生成路由表组
  async generateGroupRoutes(routeList = [], server = null) {
    return Promise.all(routeList.map(item => {
      return this.generateSingleRoute({
        route: item,
        payload: {},
        errors: []
      }, server)
    })).catch(err => {
      consola.error(err)
      return Promise.resolve(err)
    })
  }
  // 生成单个路由
  async generateSingleRoute({ route, payload = {}, errors = [] }, server = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!server) { return reject('Render Object null!') }
        // render to html, 获取目标路由 html
        let htmlData = await server.renderHtml({ url: route.path })

        /** ********** 非框架层面处理函数调用 start **************/
        htmlData = await this.callRouteHook(this.routerName, 'createHtml', { html: htmlData, routeName: this.options.target, routePath: route.path, ...this.options })
        const targetPagePath = await this.callRouteHook(this.routerName, 'createPublishPath', { route: route.path, params: this.params, ...this.options })
        /** ********** 非框架层面处理函数调用 end **************/

        let routePublishPath // html 目录文件（路由发布路径）
        const lang = this.secondLang || this.lang
        const country = lang.split('-')[0]
        if (this.env === 'production') {
          // 为了打包到旧项目 html 目录的临时处理
          const langMapPrefixPath = {
            'my-en': '',
            'id-id': '/id',
            'th-th': '/th',
            'my-zh': '/my-zh',
            'my-my': '/my-my',
            'ph-en': '/ph'
          }
          routePublishPath = path.join(this.config.publicPath, `${langMapPrefixPath[lang]}${targetPagePath}`)
        } else {
          routePublishPath = path.join(__dirname, '../../', this.config.publicPath, country, targetPagePath) // html 目录文件（路由发布路径）
        }
        fse.ensureDirSync(routePublishPath)
        await writeFileData(path.join(routePublishPath, 'index.html'), htmlData)
        // ora(`>>>> ${targetPagePath} 静态化页面构建完成!`).succeed()
        consola.success(`>>>> ${targetPagePath} 静态化页面构建完成!`)
        return resolve(true)
      } catch (error) {
        consola.error(error)
        return resolve(error)
      }
    })
  }
  // 调用路由钩子
  async callRouteHook(routeName = '', hookName = '', payload = {}) {
    try {
      // 获取路由钩子路径，默认存放在 ../../static-addition-config/routeHooks/ 目录下，通过路由名称定义文件名称，文件对外暴露 hookName 方法
      const hookPath = `../../static-addition-config/routeHooks/${routeName}.js`
      if (fse.existsSync(resolve(hookPath))) { //判断是否存在文件，存在则调用路由钩子
        const lifeCycle = require(`../../static-addition-config/routeHooks/${routeName}.js`)
        const hookObj = lifeCycle.default || lifeCycle
        // 获取文件指定钩子的函数名称
        // eslint-disable-next-line no-prototype-builtins
        if (hookObj.hasOwnProperty(hookName)) {
          switch (hookName) {
            case 'createDynamicRoutes': // 调用 createDynamicRoutes 钩子
              return hookObj.createDynamicRoutes(payload) || []
            case 'createHtml': // 调用 createHtml 钩子
              return hookObj.createHtml(payload) || payload.html
            case 'createPublishPath': // 调用 createPublishPath 钩子
              return hookObj.createPublishPath(payload) || payload.route
            default:
              break
          }
        }
      }
      // 其他情况返回原有数据
      switch (hookName) {
        case 'createDynamicRoutes':
          return []
        case 'createHtml':
          return payload.html
        case 'createPublishPath':
          return payload.route
        default:
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = Generator
