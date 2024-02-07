import Cookies from 'js-cookie'
import { getCookieDomain } from '@/utils/util.js'
import { GID } from '../constants'

// 各主流浏览器
export const getBrowser = () => {
  var u = navigator.userAgent

  var bws = [
    {
      name: 'sgssapp',
      it: /sogousearch/i.test(u)
    },
    {
      name: 'wechat',
      it: /MicroMessenger/i.test(u)
    },
    {
      name: 'weibo',
      it: !!u.match(/Weibo/i)
    },
    {
      name: 'uc',
      it: !!u.match(/UCBrowser/i) || u.indexOf(' UBrowser') > -1
    },
    {
      name: 'sogou',
      it: u.indexOf('MetaSr') > -1 || u.indexOf('Sogou') > -1
    },
    {
      name: 'xiaomi',
      it: u.indexOf('MiuiBrowser') > -1
    },
    {
      name: 'baidu',
      it: u.indexOf('Baidu') > -1 || u.indexOf('BIDUBrowser') > -1
    },
    {
      name: '360',
      it: u.indexOf('360EE') > -1 || u.indexOf('360SE') > -1
    },
    {
      name: '2345',
      it: u.indexOf('2345Explorer') > -1
    },
    {
      name: 'edge',
      it: u.indexOf('Edge') > -1
    },
    {
      name: 'ie11',
      it: u.indexOf('Trident') > -1 && u.indexOf('rv:11.0') > -1
    },
    {
      name: 'ie',
      it: u.indexOf('compatible') > -1 && u.indexOf('MSIE') > -1
    },
    {
      name: 'firefox',
      it: u.indexOf('Firefox') > -1
    },
    {
      name: 'safari',
      it: u.indexOf('Safari') > -1 && u.indexOf('Chrome') === -1
    },
    {
      name: 'qqbrowser',
      it: u.indexOf('MQQBrowser') > -1 && u.indexOf(' QQ') === -1
    },
    {
      name: 'qq',
      it: u.indexOf('QQ') > -1
    },
    {
      name: 'chrome',
      it: u.indexOf('Chrome') > -1 || u.indexOf('CriOS') > -1
    },
    {
      name: 'opera',
      it: u.indexOf('Opera') > -1 || u.indexOf('OPR') > -1
    }
  ]

  for (var i = 0; i < bws.length; i++) {
    if (bws[i].it) {
      return bws[i].name
    }
  }

  return 'other'
}

// 系统区分
export const getOS = () => {
  var u = navigator.userAgent
  if (!!u.match(/compatible/i) || u.match(/Windows/i)) {
    return 'windows'
  } else if (!!u.match(/Macintosh/i) || u.match(/MacIntel/i)) {
    return 'macOS'
  } else if (!!u.match(/iphone/i) || u.match(/Ipad/i)) {
    return 'ios'
  } else if (u.match(/android/i)) {
    return 'android'
  } else {
    return 'other'
  }
}
// 获取用户唯一标识
export const getGid = () => {
  let result = Cookies.get(GID)
  if (!result) {
    // 改用 cookie 存储 gid，兼容不同域名的访问
    result = localStorage.getItem(GID)
    if (!result) {
      result = generateGid(16, 16)
    }
    Cookies.set(GID, result, { expires: 365, domain: getCookieDomain() })
  }
  return result
}
// 调用getGid的时候，会使用到generateGid方法
function generateGid(len, radix) {
  // 长度和基数
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(
    ''
  )
  const uuid = []
  let i
  radix = radix || chars.length
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    // rfc4122, version 4 form
    let r
    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}
// 获取浏览器版本
export const getVersion = () => {
  var agent = navigator.userAgent.toLowerCase()
  // eslint-disable-next-line camelcase
  var regStr_ie = /msie [\d.]+;/gi
  // eslint-disable-next-line camelcase
  var regStr_ff = /firefox\/[\d.]+/gi
  // eslint-disable-next-line camelcase
  var regStr_chrome = /chrome\/[\d.]+/gi
  // eslint-disable-next-line camelcase
  var regStr_saf = /safari\/[\d.]+/gi
  // IE
  if (agent.indexOf('msie') > 0) {
    return (agent.match(regStr_ie) + '').replace(/[^0-9.]/gi, '')
  }
  // firefox
  if (agent.indexOf('firefox') > 0) {
    return (agent.match(regStr_ff) + '').replace(/[^0-9.]/gi, '')
  }
  // Chrome
  if (agent.indexOf('chrome') > 0) {
    return (agent.match(regStr_chrome) + '').replace(/[^0-9.]/gi, '')
  }
  // Safari
  if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
    return (agent.match(regStr_saf) + '').replace(/[^0-9.]/gi, '')
  }
  // 当以上情况均不存在，返回空
  return ''
}

// 获取url参数
export const getQueryVariable = function (variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == variable) { return pair[1] }
  }
  return ''
}
