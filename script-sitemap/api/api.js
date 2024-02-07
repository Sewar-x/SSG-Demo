const argv = require('yargs').argv
const { lang = 'my-en', env = 'production' } = argv
const languageCode = lang
const countryCode = (languageCode.split('-') ? languageCode.split('-')[0] : false) || 'my'
const host = env === 'production' ? 'https://www.prod.demo' : 'http://www.test.demo'

const axios = require('axios')
const platform = 2 // 平台 1-app 2-wap 3-pc,可用值:1,2,3
axios.interceptors.request.use(
  function(config) {
    if (config) {
      if (['post', 'delete', 'put'].includes(config.method)) {
        config.data.languageCode = languageCode
        config.data.countryCode = countryCode
        config.data.platform = platform
      } else if (config.method === 'get') {
        config.params.languageCode = languageCode
        config.params.countryCode = countryCode
        config.params.platform = platform
      }
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

axios.defaults.withCredentials = true

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

exports.post = function (urls, params = {}, config = {}) {
  return axios.post(host + urls, params, config).then((res) => {
    return res
  }).catch((err) => {
    return err
  })
}

exports.get = function (urls, params = {}) {
  return axios.get(host + urls, {
    params: params
  }).then((res) => {
    return res
  }).catch((err) => {
    return Promise.reject(err)
  })
}

exports.put = function (urls, params = {}) {
  return axios.put(host + urls, params).then((res) => {
    return res
  })
}

exports.del = function (urls, params) {
  return axios.delete(host + urls, { data: params }).then((res) => {
    return res
  })
}
