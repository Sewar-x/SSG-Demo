import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from '@/app'
import './plugin/index.js' // 登录插件
import lgs from '@/directives/lgs' // 埋点上报插件
import link from '@/directives/link'
import analysis from '@/directives/analysis' // 数据分析插件
import scroll from '@/directives/scroll.js'
import '@/common/firebaseInit.js'
import '@/assets/font/arrow/iconfont.css'
Vue.directive('lgs', lgs)
Vue.directive('link', link)
Vue.directive('analysis', analysis)
Vue.directive('scroll', scroll)

// 全局 mixin：当组件参数发生变化时，调用组件内的 asyncData，用于预获取路由页面客户端渲染数据 
// 此函数会在组件实例化之前调用，所以它无法访问 this
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

const { app, router, store } = createApp()

// 当使用 template 时，context.state 将作为 window.__INITIAL_STATE__ 状态，自动嵌入到最终的 HTML 中
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// 等到路由器在钩子和异步组件之前解析了所有的异步
router.onReady(() => {
  // 添加路由钩子函数，用于处理 asyncData.
  // 在初始路由 resolve 后执行，以便我们不会二次预取(double-fetch)已有的数据。
  // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
  router.beforeResolve((to, from, next) => {
    // 获取路由匹配的进入和离开的异步组件
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    // 我们只关心非预渲染的组件， 所以我们对比它们，找出两个匹配列表的差异组件
    let diffed = false
    // 比较进入和离开组件是否相同
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c)
    })
    // 过滤获取激活组件异步获取数据钩子
    const asyncDataHooks = activated.map((c) => c.asyncData).filter((_) => _)
    // 不存在获取数据钩子，直接进入导航页面
    if (!asyncDataHooks.length) {
      return next()
    }
    //根据 asyncData 获取数据
    Promise.all(asyncDataHooks.map((hook) => hook({ store, route: to })))
      .then(() => {
        next()
      })
      .catch(next)
  })

  //挂载 dom 
  app.$mount('#app')
})
