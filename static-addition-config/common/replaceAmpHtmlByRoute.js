const toAmp = require('../utils/toAmp')
const { lang = 'my-en' } = require('yargs').argv
const gaConfig = require('../../src/config/gaConfig')
const gaId = gaConfig[lang]
const ampGaBaseObj = {
  vars: {
    account: gaId
  },
  triggers: {
    trackPageview: {
      on: 'visible',
      request: 'pageview'
    }
  }
}
function newsCommon(rawHtml) {
  rawHtml = toAmp.handleEmbed(rawHtml, lang)// 将页面里嵌入的fb , ins , twitter , ytb等第三方内容转为对应的amp组件
  return rawHtml.replace(/\<style type\=\"text\/css\"\>/g, '<style amp-custom type="text/css">')
    .replace(/\<script type\=\"text\/javascript\" src\=\"(.*)\"><\/script\>/g, '')
    .replace(/\&quot\;/g, '"').replace(/\&lt\;/g, '<').replace(/\&gt\;/g, '>')// 写在页面script里的字符如 '>' '<' 等会被转义 原因还不清楚 所以这里再做一次转回来的操作
    .replace(/\@charset \"UTF\-8\"\;/g, '')
    .replace(/\<meta charset=\"utf-8\"\s*?\/\>/g, '')
}
function modelCommon(rawHtml) {
  return rawHtml.replace(/autoplay\=\"autoplay\"/g, 'autoplay')
    .replace(/loop\=\"loop\"/g, 'loop')
    .replace(/controls\=\"controls\"/g, 'controls')
    .replace(/\#\#\#(.*?)\#\#\#/g, '{{$1}}')
    .replace(/amp\-template/g, 'template')
    .replace(/data\-hidden\="(.*?)"/g, ($0, $1) => {
      if ($1.indexOf('!') >= 0) {
        return `[hidden]="!variantAddedMap['${$1.replace('!', '')}']"`
      }
      if ($1.indexOf('-container') >= 0) {
        return `[hidden]="(carCodeMap['${$1.replace('-container', '')}'] == 'Compare') || (carCodeMap['${$1.replace('-container', '')}'] == 'Added')"`
      }
      if ($1.indexOf('-init') >= 0) {
        return `[hidden]="(carCodeMap['${$1.replace('-init', '')}'] != 'Compare') && (carCodeMap['${$1.replace('-init', '')}'] != 'Added')"`
      }
      return `[hidden]="variantAddedMap['${$1}']"`
    })
    .replace(/\<amp\-script(.*?)src\=\"(.*?)\"(.*?)\>/g, '<amp-script$1src="$2"$3>')
    .replace(/<body(.*?)>/, `<body$1><amp-analytics type="googleanalytics" id="analytics"><script type="application/json">${JSON.stringify(ampGaBaseObj)}</script></amp-analytics>`)
}
function brandsCommon(rawHtml) {
  return rawHtml.replace(/<body(.*?)>/, `<body$1><amp-analytics type="googleanalytics" id="analytics"><script type="application/json">${JSON.stringify(ampGaBaseObj)}</script></amp-analytics>`)
}

module.exports = {
  ModelAmp: modelCommon,
  MotorModelAmp: modelCommon,
  NewsAmp: newsCommon,
  MotorNewsAmp: newsCommon,
  ZhNewsAmp: newsCommon,
  MsNewsAmp: newsCommon,
  BrandsAmp: brandsCommon,
  MotorBrandsAmp: brandsCommon,
  Model2021Amp: modelCommon,
  PostAmp: newsCommon
}
