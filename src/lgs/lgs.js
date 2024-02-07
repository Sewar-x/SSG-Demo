const xxtea = require('xxtea-node')
const axios = require('axios')
// const host = 'http://cloudac.mohangs.com/mohang/logserv/collect';//测试服
const host = 'https://glean.mohangtimes.com/mohang/logserv/collect' // 正式服
const appkey = 'appkey'
const { getGid } = require('../utils/getAgent')
const xxteaKey = 'xxteaKey'
const commitWords = [
  'lt',
  'ct',
  'dt',
  'et',
  'ft',
  'ht',
  'v_type',
  'time',
  'cid',
  'lid',
  'ua',
  'p0',
  'p1',
  'wd',
  'cy',
  're',
  'os',
  'br',
  'br_v',
  'gid',
  'c_type', // 旧逻辑字段
  'type',
  'pg',
  'pg_id',
  'm1',
  'm2',
  'm3',
  'target_type',
  'target_id',
  'x_position',
  'y_position' // 新逻辑字段
] // 需要上报的字段
const lang = process.env.LANG || process.env.VUE_APP_LANG || 'my-en'
// const userAgent = require('user-agent-parse');
async function commit(data) {
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
    data.lid = lang
    data.lt = 'wap'
    data.ua = navigator.userAgent
    data.wd = location.host
    data.cy = locationInfo ? locationInfo.country : ''
    data.re = window.screen.width + '*' + window.screen.height
    data.gid = getGid()
    // 数据加密部分
    // console.log(data)
    const requestBody = JSON.stringify(data)
    const encryptData = xxtea.encrypt(requestBody, xxteaKey)
    const encryptDataToBase64 = new Buffer(encryptData).toString('base64')
    // 请求上报
    // axios.post(`${host}?appkey=${appkey}`, encryptDataToBase64).then(res => {
    //     // console.log(res)
    // })
  }
  getLocationCallback()
}

function getParams(paramName) {
  // 获取参数列表，有传参时返回该参数名字段，否则返回全部
  // sessionStorage
  const paramStr = sessionStorage.getItem('lgs')
  if (!paramStr) {
    return false
  }
  const paramList = JSON.parse(paramStr)
  if (paramName) {
    return paramList[paramName]
  } else {
    return paramList
  }
}
function p0top1() {
  // 此函数的作用是在发生了页面跳转但不走v-lgs的逻辑（如后退）的情况下，设置新的p1（取自原sessionStorage的p0）和p0（取自原sessionStorage的v-type）
  const alreadyVLGS = sessionStorage.getItem('alreadyVLGS')
  if (alreadyVLGS === 'true' || alreadyVLGS === true) {
    // 如果已经走过v-lgs指令的代码则无需再做下面的操作
    sessionStorage.removeItem('alreadyVLGS')
    return
  }
  const paramStr = sessionStorage.getItem('lgs')
  if (paramStr) {
    const paramList = JSON.parse(paramStr)
    const newParamList = []
    // 2020.06.05:此处拿上次事件的v_type作为本次事件的p0，
    // 但由于并非每个view事件都有v_type,且v_type也并非都是页面或者说数据的标识，
    // 存在如以v_type表示本数据位于第几个的场景，由此看v_type的解决方案其实并不适合，此乃临时措施，待改
    if (
      paramList.length > 0 &&
      paramList.filter(item => item.key === 'p0').length > 0 &&
      paramList.filter(item => item.key === 'v_type').length > 0
    ) {
      const p1 = paramList.filter(item => item.key === 'p0')[0].value
      const p0 = paramList.filter(item => item.key === 'v_type')[0].value
      newParamList.push(
        {
          key: 'p0',
          value: p0
        },
        {
          key: 'p1',
          value: p1
        }
      )
    }
    // 打点新逻辑，pg推source，target推pg的逻辑
    // 未确定是否需要追踪后退等事件，先不加
    sessionStorage.setItem('lgs', JSON.stringify(newParamList))
  }
}

function pageview(initData) {
  p0top1()
  const paramList = getParams() || []
  const commitData = {}
  if (!initData) {
    initData = []
  }
  initData.forEach(item => {
    commitData[item.key] = item.value
  })
  paramList.forEach(item => {
    commitData[item.key] = item.value
  })
  commitData.ct = 'view'
  commitData.type = 'view'
  commit(commitData)
}

module.exports = {
  commit,
  getParams,
  pageview
}
