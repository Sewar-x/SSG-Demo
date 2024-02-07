import Vue from 'vue'
import VueLazyload from 'vue-lazyload'
import { getIcon } from '@/config/iconConfig'
import { getGid } from '@/utils/getAgent.js'
import { getCookieDomain } from '@/utils/util.js'
import { isIOS, isWebView } from '@/utils/platform.js'
import Cookies from 'js-cookie'
import { USER_INFO, ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants'
import { getRefreshToken } from '@/utils/loginStorage'
import Login from '@/components/Login/index.js'
import i18nObj from '@/lang/index.js'
const i18n = i18nObj()
Vue.use(Login, { i18n })
Vue.use(VueLazyload, {
  preLoad: 1,
  error: getIcon('imgDefault'),
  loading: getIcon('imgDefault'),
  attempt: 1
})

window.$local = {
  get user() {
    let userInfo = null
    if (isIOS() || isWebView()) {
      const info = Cookies.get(USER_INFO)
      if (info) userInfo = decodeURIComponent(info)
    } else {
      userInfo = localStorage.getItem(USER_INFO)
    }
    if (userInfo) {
      userInfo = JSON.parse(userInfo)
      if (userInfo.id && userInfo.username) return userInfo
    }
    return null
  },
  get isLogin() {
    return (
      !!getRefreshToken() &&
      window.$local.user &&
      window.$local.user.id &&
      window.$local.user.username
    )
  },
  get uuid() {
    return getGid()
  }
}

// 论坛版本--兼容已登录老用户登录态 同步到 forum 到域名下
const currentOrigin = window.location.origin
if (isIOS() && !/forum/.test(currentOrigin)) {
  let accessToken = Cookies.get(ACCESS_TOKEN)
  if (!accessToken) {
    accessToken = localStorage.getItem(ACCESS_TOKEN)
    if (accessToken) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN)
      const userInfo = localStorage.getItem(USER_INFO)
      Cookies.set(ACCESS_TOKEN, accessToken, {
        expires: 365,
        domain: getCookieDomain()
      })
      Cookies.set(REFRESH_TOKEN, refreshToken, {
        expires: 365,
        domain: getCookieDomain()
      })
      Cookies.set(USER_INFO, userInfo, {
        expires: 365,
        domain: getCookieDomain()
      })
    }
  }
}
