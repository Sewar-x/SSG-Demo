import Vue from 'vue'
import { Toast } from 'vant'
import { axiosInstance } from './index'
Vue.use(Toast)
const languageCode = process.env.LANG || 'my-en'
const countryCode = languageCode.split('-')[0]
const platform = 2 // 平台 1-app 2-wap 3-pc,可用值:1,2,3

axiosInstance.interceptors.request.use(
  function(config) {
    if (['post', 'delete', 'put'].includes(config.method)) {
      config.data.languageCode = languageCode
      config.data.countryCode = countryCode
      config.data.platform = config.data.platform || platform
    } else if (config.method === 'get') {
      config.params.languageCode = languageCode
      config.params.countryCode = countryCode
      config.params.platform = config.params.platform || platform
    }
    return config
  },
  function(error) {
    return Promise.reject({
      errMsg: error || '404(TimeOut)',
      errCode: 404
    })
  }
)

axiosInstance.interceptors.response.use(
  function(response) {
    // console.log('----response', response)
    const data = response.config ? response.data : response
    if (response.status == 200 && data && data.code === 0) {
      return data.data || data
    } else {
      let msg
      if (data) {
        msg = data.message
        const errCode = data.code
        switch (errCode) {
          case 101:
          case 103:
          case 104:
            Toast({
              type: 'error',
              message: msg
            })
            break
          case 404:
            return Promise.reject({
              errMsg: '404(TimeOut)',
              code: 404
            })
        }
      }
      return data
    }
  },
  function(error) {
    let code = 404
    if (error.response) {
      // console.log('----error.response', error.response)
      switch (error.response.status) {
        case 401:
        case 302:
          break
        case 502:
          Toast({
            message: '502(?)',
            duration: '2000'
          })
          break
        case 500:
          Toast({
            message: 'Network error,please try again later',
            duration: '2000'
          })
          break
        case 400:
          Toast({
            message: error.response.data.resMsg,
            duration: '2000'
          })
          break
      }
      code = error.response.status
    } else if (error.request) {
      Toast({
        message: 'Network Error',
        duration: '2000'
      })
      code = 101
    }
    return Promise.reject({
      errCode: code,
      errMsg: error.response || '404(req.error)'
    })
  }
)

axiosInstance.defaults.withCredentials = true

axiosInstance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
