import { getCookieDomain } from '@/utils/util.js'
import { aHrefParse } from '@/utils/aHrefParse.js'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from '@/constants'
const JSBJumpInterface = 'startActivity'
const toastInterface = 'showToast'
const commonArr = ['loan', 'roadTax', 'insurance', 'fuelPrice', 'comparision']; const commonObj = {}
commonArr.forEach(item => {
  commonObj[item] = '/common/browser_activity'
})
const pageMap = {
  ...commonObj,
  article: '/car/news_detail_activity',
  brand: '/car/brand_detail_activity',
  model: '/car/model_detail_activity',
  variant: '/car/variant_activity',
  brandList: '/car/brand_list_activity',
  home: '/app/activity_main',
  me: '/user/user_profile_activity',
  login: '/user/login_dialog_activity',
  common: '/common/browser_activity', // h5页面
  cityPicker: '/car/select_city_activity',
  images: '/car/gallery_activity',
  post: '/post/post_detail_activity',
  compareList: '/car/comparision_select_activity',
  bestPrice: '/car/best_deal_activity'
}
const { domainMap } = require('@/config/urlMap.js')
const cookieDefaultOpt = {
  expires: 365
}
/**
 * 唤起webview的跳转方法
 * @param {*} page 跳转的页面类型 [article,brand,model,variant,brandList,login,me]
 * @param {*} data 携带的数据
 */
export function webViewJump(page, data, callback) {
  // alert('wv');
  // window.WebViewJavascriptBridge对象在页面mounted时注册
  if (window.WebViewJavascriptBridge) {
    if (pageMap[page] === '/common/browser_activity') {
      console.info('是普通页的跳转')
      addHost(data)// 跳到h5页面时需要补上host
    }
    const param = {
      key: pageMap[page],
      value: data
    }
    console.info('进入跳转的方法', param)
    window.WebViewJavascriptBridge.callHandler(JSBJumpInterface, param, (response) => {
      if (callback) {
        // console.log('response :>> ', response);
        callback(response)
      }
    })
  }
}

/**
 * 唤起webview的toast
 * @param {*} data 提示信息
 */
export function webViewToast(data) {
  // alert('wvtoast');
  // window.WebViewJavascriptBridge对象在页面mounted时注册
  if (window.WebViewJavascriptBridge) {
    const param = {
      data
    }
    window.WebViewJavascriptBridge.callHandler(toastInterface, param, function(response) {

    })
  }
}

/**
 * 获取app端的登录信息
 * @param {*} data 提示信息
 */
export function getWebViewLoginInfo() {
  const getLoginInfoInterface = 'getLoginInfo'
  if (window.WebViewJavascriptBridge) {
    return new Promise((resolve) => {
      window.WebViewJavascriptBridge.callHandler(getLoginInfoInterface, {}, (response) => {
        resolve(response)
        // if(response && response.code == '401'){//没登录的话唤起登录页
        //     webViewJump('login',{},function(loginResponse){
        //         resolve(loginResponse);
        //     })
        // }
        // else{
        //     resolve(response);
        // }
      })
    })
  }
}

/**
 * 调起wv的登录
 * @param {*} data 提示信息
 */
export function webViewLogin() {
  return new Promise((resolve, reject) => {
    webViewJump('login', {}, (response) => {
      const { accessToken, refreshToken } = response
      const userInfoJsonStr = JSON.stringify(response)
      // console.log('reponse :>> ', reponse);
      Cookies.set(ACCESS_TOKEN, accessToken, { ...cookieDefaultOpt, domain: getCookieDomain() })
      Cookies.set(REFRESH_TOKEN, refreshToken, { ...cookieDefaultOpt, domain: getCookieDomain() })
      Cookies.set(USER_INFO, encodeURIComponent(userInfoJsonStr), { ...cookieDefaultOpt, domain: getCookieDomain() })
      if (response) {
        resolve(response)
      } else {
        reject()
      }
    })
  })
}

/**
 * 获取app端的车型对比列表
 */
export function getWebViewCompareCars() {
  const getCompareCarsInterface = 'getCompareCars'
  if (window.WebViewJavascriptBridge) {
    return new Promise((resolve) => {
      window.WebViewJavascriptBridge.callHandler(getCompareCarsInterface, {}, (response) => {
        resolve(response)
      })
    })
  }
}

/**
 * app选择车型（跳转到选车页面并获取选择的车型）
 */
export function getSelectVariant() {
  return new Promise(resolve => {
    webViewJump('brandList', { from_type: '1' }, (res) => {
      resolve(JSON.parse(res))
    })
  })
}

/**
 * 将一个车型添加到对比列表
 * @param {*} data 入参，数据结构同获取对比列表的出参一致
 */
export function addToWebViewCompareList(data, callback) {
  const param = data
  window.WebViewJavascriptBridge.callHandler('insertCompareVariant', param, (response) => {
    if (callback) {
      callback(response)
    }
  })
}

/**
 * 将一个车型从对比列表删除
 * @param {*} data 入参，数据结构同获取对比列表的出参一致
 */
export function deleteWebViewCompareList(data, callback) {
  const param = data
  window.WebViewJavascriptBridge.callHandler('deleteCompareVariant', param, (response) => {
  })
}

/**
 * 调起图片预览
 * @param {*} imgUrl
 */
export function imagePreview(imgUrl) {
  const param = {
    data: imgUrl
  }
  window.WebViewJavascriptBridge.callHandler('previewImage', param, (response) => {
    if (callback) {
      callback(response)
    }
  })
}
/**
 * 判断是否有在app端登录，有的话将登录信息写入cookies
 */
export async function loginCheck() {
  getWebViewLoginInfo().then(response => {
    if (response && response.code != '401') {
      const { accessToken, refreshToken } = response
      const userInfoJsonStr = JSON.stringify(response)
      Cookies.set(ACCESS_TOKEN, accessToken, { ...cookieDefaultOpt, domain: getCookieDomain() })
      Cookies.set(REFRESH_TOKEN, refreshToken, { ...cookieDefaultOpt, domain: getCookieDomain() })
      Cookies.set(USER_INFO, encodeURIComponent(userInfoJsonStr), { ...cookieDefaultOpt, domain: getCookieDomain() })
    }
  })
}

/**
 * 关闭页面loading
 */
export function closeLoading() {
  window.WebViewJavascriptBridge.callHandler('closeLoading', () => {})
}

/**
 * 给内链绑定点击事件
 * @param {*} selector 选择器字段
 */
export function bindWebviewALinkJump(selector, lang) {
  if (!selector) return
  const aTagList = document.querySelectorAll(selector)
  aTagList.forEach(item => {
    const hrefValue = aHrefParse(item.href, lang)
    item.onclick = (evt) => {
      evt.preventDefault()
      let param = {}
      if (hrefValue.type === 'article') {
        param = { id: hrefValue.value, url: href }
      } else if (['brand', 'model', 'variant', 'images'].includes(hrefValue.type)) {
        param = { code: hrefValue.value.replace(/\//g, '-') }
      }
      webViewJump(hrefValue.type, param)
    }
  })
}

/**
 * 提供资讯详情页作者信息到native
 * @param {*} authorInfo { "authorAvatar":"", "authorId":"", "authorName":"", "releaseTime":""}
 */
export function submitAuthorInfo(authorInfo) {
  window.WebViewJavascriptBridge.callHandler('submitAuthorInfo', authorInfo, (response) => {})
}

function addHost(data) {
  const lang = process.env.LANG || 'my-en'
  const httpReg = /(http|https):\/\/([\w.]+\/?)\S*/
  if (data.url && !httpReg.test(data.url)) {
    // data.url = 'http://test.wap.demo.my' + data.url;
    data.url = domainMap[lang] + data.url
    return data
  }
  if (data.id) { // 兼容工具页的跳转
    data.url = `${domainMap[lang]}/tools/${data.id}`
    return data
  }
}
