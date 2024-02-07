const xxtea = require('xxtea-node')
const axios = require('axios')
const { dateFormat } = require('@/config/common')
const dotAxios = axios.create({
  withCredentials: true,
  headers: {
    post: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }
})
const { getBrowser, getOS, getGid, getVersion, getQueryVariable } = require('../utils/getAgent')
// const host = 'http://cloudac.mohangs.com/mohang/logserv/collect';//测试服
const host = 'https://glean-web.mohangtimes.com/mohang/logserv/collect' // 正式服
const appkey = 'appkey'
const xxteaKey = 'xxteaKey'
const commitWords = [
  'lt',
  'time',
  'dt',
  'lid',
  'ua',
  'wd',
  'cy',
  're',
  'os',
  'br_v',
  'br',
  'gid', // 通用参数
  'type',
  'pg',
  'pg_id',
  'm1',
  'm2',
  'm3',
  'uid',
  'source',
  'target_type',
  'target_id',
  'x_position',
  'y_position' // 打点参数
] // 需要上报的字段
async function commit(data = {}, isBeacon = false) {
  // 请求上报
  const url = 'https://ipinfo.io/'
  // console.log(data)
  window.getLocationCallback = function(response) {
    // console.log(response)
    const locationInfo = response
    // const userAgentParse = userAgent.parse(navigator.userAgent);
    commitWords.forEach(item => {
      // 字段没数据时也要上报一个空值
      if (!data[item]) {
        data[item] = ''
      }
    })
    // 一些通用的字段
    data.lid = (navigator.languages && navigator.languages.toString()) || navigator.language || '' // 用户所属的语言
    data.lt = 'wap' // 系统类型
    data.ua = navigator.userAgent // 浏览器信息记录
    data.wd = location.host // 域名
    data.cy = locationInfo ? locationInfo.country : '' // 国家
    data.re = window.screen.width + '*' + window.screen.height // 分辨率(resolution)
    data.os = getOS() // 浏览器类型
    data.br = getBrowser() // 操作系统
    data.gid = getGid() // 用户唯一标识
    data.br_v = getVersion() // 浏览器当前版本
    data.dt = dateFormat('yyyyMMddhhmmss', new Date())
    data.source = getQueryVariable('utm_source')
    data.uid =
      (window.$local && window.$local.user && window.$local.user.id) || '' // 用户的id
    if (process.env.API_ENV === 'development') {
      console.log(JSON.stringify(data, null, 4))
    }
    const requestBody = JSON.stringify(data)
    const encryptData = xxtea.encrypt(requestBody, xxteaKey)
    const encryptDataToBase64 = new Buffer(encryptData).toString('base64')
    // 当上报类型为空时，不上报，类型为jump时上报方式为sendBeacon,其他的为axios
    // console.log(encryptDataToBase64)
    if (!data.pg) {
      return null
    } else if (data.type == 'jump' || isBeacon) {
      window.navigator.sendBeacon(
        `${host}?appkey=${appkey}`,
        encryptDataToBase64
      )
    } else {
      dotAxios
        .post(`${host}?appkey=${appkey}`, encryptDataToBase64)
        .then(res => {
          // console.log(res)
        })
        .catch(res => {
          // console.log(res)
          // console.log("捕捉到异常")
        })
    }
  }
  getLocationCallback()
}

// 落地页的埋点,initData为打点参数，初始化数据
function pageview(initData) {
  // p0top1();
  const commitData = {}
  if (!initData) {
    initData = []
  }
  initData.forEach(item => {
    commitData[item.key] = item.value
  })
  commit(commitData) // 调用commit提交打点
}
function scroll(scrollList = [], refList = [], threshold = 0.1) {
  for (let index = 0; index < scrollList.length; index++) {
    if (!refList[index]) {
      // 如果dom节点不存在，则跳过
      continue
    }
    const target = refList[index]
    //   console.log(target);
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: threshold
    }
    const callback = (entries, observer) => {
      entries.forEach(item => {
        if (item.isIntersecting) {
          // 当前元素可见
          // console.log(item.target.innerText)
          // console.log("触发一次");
          observer.unobserve(item.target) // 停止观察当前元素 避免不可见时候再次调用callback函数
          commit(scrollList[index])
        }
      })
    }
    const observer = new IntersectionObserver(callback, options)
    observer.observe(target)
  }
}
module.exports = {
  commit,
  pageview,
  scroll
}
