// 这个文件用于把资讯正文里的第三方内容(fb,ins,youtube...)转成amp格式
const gaConfig = require('../../src/config/gaConfig.js')
function ga(htmlStr, lang) {
  const gaEmbedStr =
    `<amp-analytics type="googleanalytics" id="analytics1">
        <script type="application/json">
        {
          "vars": {
            "account": "${gaConfig[lang]}"
          },
          "triggers": {
            "trackPageview": {
              "on": "visible",
              "request": "pageview"
            },
            "facebookShare": {
              "on": "click",
              "selector": ".share-facebook",
              "request": "event",
              "vars": {
                "eventCategory": "content",
                "eventAction": "click",
                "eventLabel": "share_facebook",
                "eventValue": 1
              }
            },
            "whatsappShare": {
              "on": "click",
              "selector": ".share-whatsapp",
              "request": "event",
              "vars": {
                "eventCategory": "content",
                "eventAction": "click",
                "eventLabel": "share_whatsapp",
                "eventValue": 1
              }
            },
            "imageView": {
              "on": "click",
              "selector": ".new-img-container",
              "request": "event",
              "vars": {
                "eventCategory": "content",
                "eventAction": "click",
                "eventLabel": "imageView",
                "eventValue": 1
              }
            }
          }
        }        
        </script>
    </amp-analytics>`
  return htmlStr.replace(/\<\/body\>/, `${gaEmbedStr}</body>`)
}

function facebook(htmlStr) {
  const facebookVideo = htmlStr.match(/<div class\=\"fb\-video\".*?(?:\>|\/>)/gi)// facebook有post和video两种类型 要分开处理
  const facebookPost = htmlStr.match(/<div class\=\"fb\-post\".*?(?:\>|\/>)/gi)
  if (facebookVideo) {
    facebookVideo.forEach(item => {
      const dataHref = item.match(/\bdata\-href\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i)[1]
      // 获取data href填入amp组件
      const embedStr = `<amp-facebook width="476" height="260"
                                layout="responsive"
                                data-embed-as="video"
                                data-href=${dataHref}>
                            </amp-facebook>`
      // 将facebook生成的结构删除
      htmlStr = htmlStr.replace(/\<figure class\=\"facebook\-video\-embed\-figure" [^>]*>.*?/, embedStr)
        .replace(/\<\/figure>/, '')
        .replace(/\<div class\=\"fb\-video\" [^>]*>(.|\n)*?<\/div>/, '')
        .replace(/\<div class\=\"facebook\-video\-embed\-content\"[^>]*>(.|\n)*?<\/div>/, '')
    })
  }
  if (facebookPost) {
    facebookPost.forEach(item => {
      const dataHref = item.match(/\bdata\-href\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i)[1]
      const embedStr = `<amp-facebook width="345" height="260"
                                layout="responsive"
                                data-href=${dataHref}>
                            </amp-facebook>`
      htmlStr = htmlStr.replace(/\<figure class\=\"facebook\-post\-embed\-figure" [^>]*>.*?/, embedStr)
        .replace(/\<\/figure>/, '')
        .replace(/\<div class\=\"fb\-post\" [^>]*>(.|\n)*?<\/div>/, '')
        .replace(/\<div class\=\"facebook\-post\-embed\-content\"[^>]*>(.|\n)*?<\/div>/, '')
    })
  }
  return htmlStr
}

function instagram(htmlStr) {
  const insBlockStr = htmlStr.match(/<blockquote class\="instagram\-media\".*?(?:\>|\/>)/gi)
  const permalink = insShortCode = []
  if (insBlockStr) {
    insBlockStr.forEach(item => {
      permalink.push(item.match(/\bdata\-instgrm\-permalink\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/))
      insShortCode.push(permalink[permalink.length - 1][1].match(/(https?:\/\/www\.)?instagram\.com\/p\/(\w+?)\//)[2])
      const embedStr = `<amp-instagram
                            data-shortcode=${insShortCode[insShortCode.length - 1]}
                            data-captioned
                            width="200"
                            height="200"
                            layout="responsive"
                            >
                            </amp-instagram>`
      htmlStr = htmlStr.replace(/\<figure class\=\"instagram\-embed\-figure\"(.|\n)*?<\/figure>/, embedStr)
    })
  }
  return htmlStr
}

function twitter(htmlStr) {
  const twitterBlockStr = htmlStr.match(/<blockquote class\=\"twitter\-tweet\"(.|\n)*?<\/blockquote>/gi)
  const twitterHref = twitterId = []
  if (twitterBlockStr) {
    twitterBlockStr.forEach(item => {
      twitterHref.push(item.match(/(http|https):\/\/twitter.com\/([^\/]*)\/status\/([^\/]*)/g))
      twitterId.push(twitterHref[twitterHref.length - 1][0].match(/https?:\/\/twitter.com\/[a-zA-Z_]{1,20}\/status\/([0-9]*)/)[1])
      const embedStr = `<amp-twitter
                            width="200"
                            height="200"
                            layout="responsive"
                            data-tweetid=${twitterId[twitterId.length - 1]}
                            >
                            </amp-twitter>`
      htmlStr = htmlStr.replace(/\<figure class\=\"twitter\-embed\-figure\"(.|\n)*?<\/figure>/, embedStr)
        .replace(/\<figure class\=\"wp\-block\-embed\-twitter(.|\n)*?<\/figure>/, embedStr)
    })
  }
  return htmlStr
}

function youtube(htmlStr) {
  const iframeStr = htmlStr.match(/<iframe\b.*?(?:\>|\/>)/gi)
  const srcStr = ytbId = []
  // console.log(iframeStr)
  if (iframeStr) {
    iframeStr.forEach(item => {
      srcStr.push(item.match(/\bsrc\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i))
      ytbId.push(srcStr[srcStr.length - 1][1].match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/i)[7])
      htmlStr = htmlStr.replace(/\<iframe [^>]*>.*?/, `<amp-youtube width="340" height="200" layout="responsive" data-videoid=${ytbId[ytbId.length - 1]}> </amp-youtube>`)
        .replace(/\<\/iframe>/, '')
    })
  }
  return htmlStr
}

module.exports = {
  handleEmbed(htmlStr, lang) {
    htmlStr = ga(htmlStr, lang)
    htmlStr = facebook(htmlStr)
    htmlStr = instagram(htmlStr)
    htmlStr = twitter(htmlStr)
    htmlStr = youtube(htmlStr)
    return htmlStr
  }
}
