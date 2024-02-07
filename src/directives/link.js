/** -----------------------------------------------------------------------
 * v-link 指令：
 *  1.功能：
 *  （1）给dom添加监听事件，点击dom跳转到<a>标签中href属性的地址
 *  （2）指定lgs打点
 *  2.使用：
 *  （1）v-link, 获取dom内第一个<a>标签 href 属性数据
 *  （2）v-link.href="{href:''}" , 指定指令跳转地址
 *  3.注意：
 *  （1）指令不能用于 <a> 标签
 *
 *  4.为配合webview的跳转做了适配
 *
 * -----------------------------------------------------------------------
 */

import { isWebView } from '@/utils/index.js'
import { aHrefParse } from '@/utils/aHrefParse.js'
import { webViewJump } from '@/utils/webView.js'

const context = 'linkContext'
const lang = process.env.LANG || 'my-en'

function handleClick(el, binding) {
  const href = binding.modifiers.href ? binding.value.href : el.getElementsByTagName('a').item(0).href
  if (!href) {
    console.error('href is empty')
  }
  function handle(e) {
    href && window && window.location && window.location.assign(href)
  }
  function handleWebViewJump() {
    const hrefValue = aHrefParse(href, lang) // 从a标签的href中匹配出wv跳转需要的数据
    console.error('打印转化后的href', hrefValue)
    const aTagList = el.getElementsByTagName('a')
    if (el.tagName === 'A') {
      el.href = 'javascript:void(0);'
    }
    for (let i = 0; i < aTagList.length; i++) { // 禁止点击a标签时的跳转
      aTagList[i].href = 'javascript:void(0);'
    }
    let param
    if (['brand', 'model', 'variant', 'images'].includes(hrefValue.type)) {
      param = { code: hrefValue.value.replace(/\//g, '-') }
    } else if (hrefValue.type === 'brandList') {
      param = { from_type: hrefValue.value }
    } else if (hrefValue.type === 'common' || hrefValue.type === 'comparision') {
      param = { url: hrefValue.value }
    } else if (hrefValue.type === 'article') {
      param = { id: hrefValue.value, url: href }
    } else {
      param = { id: hrefValue.value }
    }
    console.log('打印链接', hrefValue.type)
    console.log('打印参数', param)
    webViewJump(hrefValue.type, param)// 跳转
  }
  const handleFunc = isWebView() ? handleWebViewJump : handle
  if (!el[context]) {
    el[context] = {
      removeHandle: handleFunc
    }
  } else {
    el[context].removeHandle = handleFunc
  }
  // const isWebView = isWebView();
  return handleFunc
}
export default {
  bind(el, binding) {
    el.addEventListener('click', handleClick(el, binding), false)
  },
  update(el, binding) {
    el.removeEventListener('click', el[context].removeHandle, false)
    el.addEventListener('click', handleClick(el, binding), false)
  },
  unbind(el) {
    el.removeEventListener('click', el[context].removeHandle, false)
    el[context] = null
    delete el[context]
  }
}
