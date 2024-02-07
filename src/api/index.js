import axios from 'axios'
import { getIsServer, getIsClient } from '../utils/util'
import {
  setStorage,
  removeStorage,
  getRefreshToken,
  getAccessToken
} from '../utils/loginStorage'
const env = process.env.API_ENV === 'production' ? 'production' : 'development'
const lang = process.env.LANG || 'my-en'
const hostMap = require('./hostMap')
const isServer = getIsServer()
const isClient = getIsClient()

const axiosInstance = axios.create({
  withCredentials: true
})

if (isClient) {
  axiosInstance.defaults.headers = {
    post: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    get 'User-Token'() {
      return getAccessToken() || ''
    }
  }
}

function request(opt) {
  const { method = 'get', url, params = {}, data = {}, config = {} } = opt
  // 之所以不在 api.js 中统一处理 baseURL，是因为：静态化打包走的是 nodejs 流程，如果在 api.js 中有引进 vant，会报 vant 相关的错误：navigator、window is not defined 等。
  if (params.host) {
    // 静态化打包 params 携带host，baseURL 为 params.host；非静态化统一通过环境变量获取映射表 host
    config.baseURL = params.host
    delete params.host
  } else {
    if (!isServer) {
      config.baseURL = ''
    } else {
      let host = env === 'production' ? (config.baseURL || 'http://localhost:8097') : hostMap[env][lang]
      if (/\/v1/.test(url)) {
        host = hostMap[env][lang]
      }
      config.baseURL = host
    }
  }
  return isClient
    ? axiosInstance({
      method,
      url,
      params,
      data,
      ...config
    })
      .then((res) => {
        if (res && res.code === 401) {
          console.log('accessToken 过期')
          // accessToken 过期
          if (needRefresh) {
            const userId = window.$local.user.id
            const refreshToken = getRefreshToken()
            client({
              url: '/v2/user/refreshToken',
              params: {
                refreshToken,
                userId
              }
            }).then((tokenRes) => {
              if (tokenRes && tokenRes.code === 401) {
                // refreshToken 过期，需要重新登录
                removeStorage()
                subscribers = []
                isRefreshing = true
                return Promise.reject()
              }
              setStorage(tokenRes)
              subscribers.forEach((req) => {
                req()
              })
              subscribers = []
              isRefreshing = true
            })
          }
          needRefresh = false
          return new Promise((resolve) => {
            subscribers.push(() => {
              resolve(request(opt))
            })
          })
        }
        return res
      })
      .catch((err) => {
        console.log(err)
        return err
      })
    : axiosInstance({
      method,
      url,
      params,
      data,
      ...config
    })
}

export function post(url, data = {}, config = {}) {
  return request({
    method: 'post',
    url,
    data,
    config
  })
}

export function get(url, params = {}, config = {}) {
  return request({
    url,
    params,
    config
  })
}

export function put(url, data = {}) {
  return request({
    method: 'put',
    url,
    data
  })
}

export function del(url, data = {}) {
  return request({
    method: 'delete',
    url,
    data
  })
}

export { axiosInstance }
