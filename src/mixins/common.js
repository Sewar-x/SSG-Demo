import { getIcon } from '@/config/iconConfig'
import { isWebView } from '@/utils/platform.js'

export default {
  data() {
    return {
      lang: process.env.LANG || 'my-en',
      // secondLang: process.env.SECOND_LANG || '',
      isWebView: false
    }
  },
  methods: {
    getIcon: getIcon
  },
  computed: {
    _pg() {
      return this.$store.state.pg
    },
    _pg_id() {
      return this.$store.state.pg_id
    },
    isMotor() { // webview下暂时没有摩托车相关的东西
      return this.isWebView ? false : this.$store.state.isMotor
    },
    localCompare() {
      return this.$store.state.localCompare
    },
    localCompareList() {
      return this.$store.state.localCompareList
    },
    secondLang() {
      return this.$store.state.secondLang
    }
  },
  mounted () {
    this.isWebView = isWebView()
  }
}
