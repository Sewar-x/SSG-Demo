/**
 * 服务端和客户端公共代码
 */
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import VueAnalytics from 'vue-analytics'
import App from '@/App.vue'
import { createStore } from '@/store'
import { createRouter } from '@/router'
import tdkMixin from '@/mixins/tdk'
import commonMixin from '@/mixins/common'
import * as filters from '@/filters/common'
import '@/api/api.js'
import i18n from '@/lang'
import gaConfig from '@/config/gaConfig.js'
const lang = process.env.LANG || 'my-en'

Vue.use(VueAnalytics, {
  id: gaConfig[lang]
})

// mixin for handling title
Vue.mixin(tdkMixin)
Vue.mixin(commonMixin)

// register global utility filters.
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})

// Expose a factory function that creates a fresh set of store, router,
// app instances on each call (which is called for each SSR request)
export function createApp() {
  // create store and router instances
  const store = createStore()
  const router = createRouter()
  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)

  // create the app instance.
  // here we inject the router, store and ssr context to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = new Vue({
    i18n: i18n(lang),
    router,
    store,
    mounted() {
      this.$ga.page(location.pathname + location.search)
    },
    render: (h) => h(App)
  })

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return { app, router, store }
}
