import Vue from 'vue'
import Router from 'vue-router'
import getRoutes from './routes'
const lang = process.env.LANG || 'my-en'
Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    routes: getRoutes({ lang })
  })
}
