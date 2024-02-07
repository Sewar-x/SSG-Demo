import { isWebView } from '@/utils/platform.js'
import { loginCheck } from '@/utils/webView.js'
import { aHrefParse } from '@/utils/aHrefParse.js'
import { removeStorage } from '@/utils/loginStorage'

export default {
  data() {
    return {
      isWebView: false,
      lang: process.env.LANG || 'my-en'
    }
  },
  methods: {
    /**
         * 初始化WebViewJavascriptBridge
         * @param {*} callback 回调
         */
    setupWVJB(callback) {
      if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge)
      }
      if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback)
      }
      window.WVJBCallbacks = [callback]
      // 通过iframe的方式注册全局WebViewJavascriptBridge对象
      const WVJBIframe = document.createElement('iframe')
      WVJBIframe.style.display = 'none'
      WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
      document.documentElement.appendChild(WVJBIframe)
      setTimeout(function() {
        document.documentElement.removeChild(WVJBIframe)
      }, 0)
    },
    /**
         * 注册webview的跳转方法
         */
    registeWVJB() {
      this.setupWVJB(function(bridge) {
        window.dispatchEvent(new Event('WVJBLoaded'))// 注册一个加载完成事件
        loginCheck()
        bridge.registerHandler(this.JSBJumpInterface, function(data) {})
      })
    },
    changeTitle() { // 更换每个页面的title
      const hrefValue = aHrefParse(window.location.href, this.lang)
      const titleMap = {
        news: '',
        author: '',
        brandList: this.$t('brands.Cars'),
        filterResult: 'Filtered Results',
        forumIndex: '',
        group: 'demo Group',
        topic: 'demo Topic',
        postDetail: '',
        modelSpecs: this.$t('common.Specs'),
        userReview: '',
        faq: '',
        variantSpecs: this.$t('common.Specs'),
        comparision: this.$t('compare.Comparision'),
        loan: this.$t('news.LoanCalculator'),
        insurance: this.$t('news.InsuranceCalculator'),
        roadTax: this.$t('news.RoadTaxCalculator'),
        fuelPrice: this.$t('news.FuelPrice'),
        common: ''
      }
      const title = titleMap[hrefValue.type]
      document.title = title || '\u200E'
    }
  },
  mounted () {
    this.isWebView = isWebView()// 通过ua判断是不是webview
    if (this.isWebView) { // 在mounted时初始化WebViewJavascriptBridge
      if (window.WebViewJavascriptBridge) {
        loginCheck()
      } else { // 注册wvjb
        this.registeWVJB()
      }
      this.changeTitle()
      // 供app端调用的全局方法
      window.loginSuccess = function() { // 登录成功
        loginCheck()
      }
      window.logout = function() { // 退出登录
        removeStorage()
      }
    }
  }
}
