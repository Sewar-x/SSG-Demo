const fs = require('fs')
const fse = require('fs-extra')
const readline = require('linebyline')
const { resolve } = require('../../static-cli/common/util')
const { calculateHash } = require('@ampproject/toolbox-script-csp')
const replaceAmpHtmlByRoute = require('./replaceAmpHtmlByRoute')
const ampValidator = require('./ampValidator')



/**
 * 逐行读取文件内容
 * @param {*} path
 */
function readFileLineByLine(path = '') {
  return new Promise((resolve, reject) => {
    rl = readline(path)
    let str = ''
    rl.on('line', function (line, lineCount, byteCount) {
      // console.log('line-----', line, lineCount)
      str = str + line + '\n'
    })
      .on('error', function (err) {
        // something went wrong
        return reject(err)
      })
      .on('end', function (e) {
        str = str.split('\n').filter(_ => _).join('\n') // 去除 \n
        // console.log('end', str, str.split('\n').filter(_ => _).join('\n'))
        return resolve(str)
      })
  })
}

/**
 * 获取 html 中所有的 css
 * 开发环境：获取所有 style 标签内的样式
 * 生产环境：获取所有 css 外链的样式
 * @param {*} html
 * @param {*} isProd
 */
const getAllCss = function (html = '', inlineCss = false) {
  if (inlineCss) { // 开发环境
    return html
      .match(/(\<style([\s\S]*?)<\/style\>)/g)
      .reduce((cur, prev) => `${prev} ${cur}`, '')
      .replace(/([\n\t]+)|(\s{2,})/g, '')
      .replace(/\<style[\s\S]*?\>/g, '')
      .replace(/\<\/style[\s\S]*?\>/g, '')
  } else { // 生产环境
    const reg = /<link\s*rel="stylesheet"\s*href="([\s\S]*?)">/g
    const cssLinks = [] // 收集所有的 css 外链
    html.replace(reg, ($1, $2) => {
      cssLinks.push($2)
    })
    if (!cssLinks.length) {
      return ''
    }
    let allCss = ''
    cssLinks.forEach(async item => {
      // 去除域名
      item = item
        .replace(/https:\/\/test-cdn-car-static.s3-ap-southeast-1.amazonaws.com\//g, '')
        .replace(/https:\/\/cdn-car-static.s3-ap-southeast-1.amazonaws.com\//g, '')
        .replace(/https:\/\/static.demo.my\//g, '')
        .replace(/https:\/\/static.autofun.co.id\//g, '')
        .replace(/https:\/\/static.autofun.co.th\//g, '')
        .replace(/https:\/\/static.autofun.ph\//g, '')
      if (/vanUI\./.test(item)) return ''
      allCss += fs.readFileSync(resolve(`../../dist-static/${item}`))
    })
    return allCss.replace(/\n/g, '')
  }
}

const addPageScript = function (html = '', routeName = '', isProd = true) {
  const reg = /<body[\s\S]+?>([\s\S]*?)<\/body>/g
  return html.replace(reg, ($1, $2, $3) => {
    // return `<body style="font-size: 16px;"><amp-script script="${routeName}-page-script" ${isProd ? '' : 'data-ampdevmode=true'}>${$2}</amp-script></body>`
    return `<body style="font-size: 16px;"><amp-script script="${routeName}-page-script">${$2}</amp-script></body>`
  })
}

/**
 * 生成脚本 meta hash 值
 * @param {*} routeName
 */
const generateMetaHash = async function (routeName = '', html = '') {
  try {
    const ampScriptsByRoute = require('../../script-amp')[routeName] || []
    const allFiles = []
    ampScriptsByRoute.forEach(s => allFiles.push(readFileLineByLine(resolve(`../../script-amp/ampScripts/${s}.js`))))
    if (ampScriptsByRoute.length === allFiles.length) {
      const fileDataList = await Promise.all(allFiles)
      let metaHash = ''
      let scriptTags = ''
      fileDataList.forEach((item, index) => {
        metaHash += calculateHash(item) + ' '
        const scriptId = ampScriptsByRoute[index]
        // .replace(/[A-Z]/g, $1 => '-' + $1.toLowerCase()) // 去除后缀，小驼峰转化为横线
        scriptTags += `<script id='${scriptId}' target="amp-script" type="text/plain">${item}</script>`
      })
      return { metaHash, html: html.replace(/\<\/body>/g, `${scriptTags}</body>`) }
    }
  } catch (error) {
    console.log(error, '*********generateMetaHash*********')
    return { metaHash: '', html }
  }
}

/**
 * 将 html 转化为 amp（删除 script 外链和脚本，添加默认配置）
 * @param {*} html
 */
const convertHtmlToAMP = async function ({ html = '', routeName = '', removeScriptLink = true, inlineCss = false, ampCustomEleScripts = [], routePath, hostType = 'main' }) {
  // console.trace('-----convertHtmlToAMP', routeName, isProd, inlineCss)
  if (!html) {
    return ''
  }
  const allCss = getAllCss(html, inlineCss) || ''

  // 【注意，在计算散列时包括前导和后导空白，并且必须与内联脚本中使用的空白精确匹配。】
  // https://www.npmjs.com/package/@ampproject/toolbox-script-csp
  // 生成脚本 meta hash 值
  let { metaHash = '', html: newHtml = '' } = await generateMetaHash(routeName, html)
  const genHtmlByRoute = replaceAmpHtmlByRoute[routeName]
  if (genHtmlByRoute) {
    newHtml = genHtmlByRoute(newHtml)
  }
  newHtml = newHtml
    .replace(/<(html[\s\S]+?)>/g, ($1, $2) => `<${$2} amp>`) // 添加 amp 标志
    .replace(/<style[\s\S]+?<\/style>/g, '') // 删除 style 标签
    .replace(/<link\s*rel="stylesheet"\s*href="([\s\S]*?)">/g, '') // 删除 link css 标签
    .replace(/<link\s+?rel="preload"[\s\S]+?>/g, '') // 删除 preload
    .replace(/<link\s+?rel="prefetch"[\s\S]+?>/g, '') // 删除 prefetch
    .replace(/amp\-template/g, 'template')
    .replace(
      /<\/head>/, // 添加 amp 所需内容
      `${ampCustomEleScripts.reduce((a, s) => a + s, '')}<script async src="https://cdn.ampproject.org/v0.js"></script>
    <meta name="amp-script-src" content="${metaHash}">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <style amp-custom type="text/css">${allCss}</style></head>`
    )
    .replace(/\!important/g, '') // 删除 !important
  if (removeScriptLink) { // 只有生产环境才执行的逻辑
    newHtml = newHtml
      .replace(/<script\s+?src[\s\S]*?<\/script>/g, '') // 开发环境不处理外链，生产环境删除外链
      // .replace(/<script>window\.__INITIAL_STATE__[\s\S]+?<\/script>/, '') // 删除window.__INITIAL_STATE__的内容
      .replace(/\<img(.*?)src\=\"(.*?)\"(.*?)\>/g, ($0, $1, $2, $3) => { // 把img标签转为amp-img
        if ($0.match(/layout/g)) {
          return `<amp-img${$1}src="${$2}"${$3}></amp-img>`
        }
        return `<amp-img${$1}src="${$2}" layout="fixed" ${$3}></amp-img>`// 如果img标签没有指定layout的话主动加上一个layout
      })
      .replace(/<script>[\s\S]*?<\/script>/g, '') // 删除内嵌 script，包括window.__INITIAL_STATE__的内容
    // await ampValidator(newHtml, routePath, hostType)
  }
  return newHtml
}

module.exports = convertHtmlToAMP
