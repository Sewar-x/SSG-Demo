function getHead (vm) {
  const { head } = vm.$options
  if (head) {
    return typeof head === 'function'
      ? head.call(vm)
      : head
  }
}
// 将多个空格转为单个空格
function resetBlank(str) {
  const regEx = /\s+/g
  return str.replace(regEx, ' ')
}
const serverTitleMixin = {
  created () {
    const head = getHead(this)
    if (this.$ssrContext) {
      const noIndexTag = '<meta name="googlebot" content="noindex">'
      this.$ssrContext.noIndexTag = process.env.API_ENV === 'development' ? noIndexTag : ''
    }
    if (!head) return
    if (head.title) this.$ssrContext.title = resetBlank(head.title)
    if (head.lang) this.$ssrContext.lang = head.lang
    if (head.description) this.$ssrContext.description = resetBlank(head.description)
    if (head.favicon) this.$ssrContext.favicon = head.favicon
    if (head.extraTags) this.$ssrContext.extraTags = head.extraTags
    if (head.wholeUrl) this.$ssrContext.wholeUrl = head.wholeUrl
    if (head.ampHref) this.$ssrContext.ampHref = head.ampHref
    if (head.structuredDataTag) this.$ssrContext.structuredDataTag = head.structuredDataTag
    if (head.fontEncryptionUrl) this.$ssrContext.fontEncryptionUrl = head.fontEncryptionUrl
    if (head.imageUrl) this.$ssrContext.imageUrl = head.imageUrl
    if (head.extraScriptTags) this.$ssrContext.extraScriptTags = head.extraScriptTags
    if (head.keywords) this.$ssrContext.keywords = `<meta name="keywords" content="${head.keywords}">`
    const noIndexTag = '<meta name="googlebot" content="noindex">'
    this.$ssrContext.noIndexTag = process.env.API_ENV === 'development' ? noIndexTag : ''
  }
}

const clientTitleMixin = {
  mounted () {
    const head = getHead(this)
    if (!head) return
    if (head.title) {
      document.title = resetBlank(head.title)
      document.querySelector('meta[name="title"]').setAttribute('content', resetBlank(head.title))
    }
    // if (head.keywords) document.querySelector('meta[name="keywords"]').setAttribute('content', head.keywords)
    if (head.description) {
      document.querySelector('meta[name="description"]').setAttribute('content', resetBlank(head.description))
      document.querySelector('meta[property="og:description"]').setAttribute('content', resetBlank(head.description))
    }
    if (head.imageUrl) {
      document.getElementsByTagName('meta').image.content = `${head.imageUrl}`
    }
    if (head.wholeUrl) {
      document.querySelectorAll('link[rel*="canonical"]').href = `${head.wholeUrl}`
    }
    if (head.structuredDataTag) { }
    if (head.extraTags) { }
    if (head.extraScriptTags1) { }
    if (head.extraScriptTags2) { }
  }
}

// 可以通过 `webpack.DefinePlugin` 注入 `VUE_ENV`
export default process.env.VUE_ENV === 'server'
  ? serverTitleMixin
  : clientTitleMixin
