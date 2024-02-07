const { webNameMap } = require('../../src/config/urlMap')
const { getPublishPath } = require('../../build/common')

module.exports = (lang = 'my-en', isProd = false) => {
  const s3PublishPath = getPublishPath({ env: isProd ? 'production' : 'development', lang })
  return {
    favicon: `${s3PublishPath}public/logo/favicon-${webNameMap[lang].toLowerCase()}.png`, // todo 填写服务器上该资源实际路径
    title: 'demo - SSR',
    keywords:
      '',
    description: lang === 'ph-en'
      ? 'Demo SSR Site in Philippines.'
      : 'Demo SSR in Malaysia.',
    structuredDataTag: '',
    imageUrl: '',
    wholeUrl: '',
    extraTags: '',
    ampHref: '',
    noIndexTag: '',
    extraScriptTags: ''
  }
}
