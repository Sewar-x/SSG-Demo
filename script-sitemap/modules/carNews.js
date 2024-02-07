const fs = require('fs')
const url = require('../../src/config/url')
const { nowFormatFn, commonXMLGenerator } = require('../utils')
const nowFormat = nowFormatFn()

const { getAllSeoNews } = require('../api/common')
async function carNews({ lang = 'my-en', output = '', config = {} }) {
  const allNews = await getAllSeoNews().then(res => res.data.data).catch(err => console.log(err))
  const newsXML = commonXMLGenerator(allNews.map(item => {
    return `
        <url>
        <loc>${config.host}${url[lang].news(item.title, item.newsId)}</loc>
        <lastmod>${nowFormat}</lastmod>
        <priority>0.9</priority>
        </url>`
  }).join(''))

  const country = lang.split('-')[0]

  fs.writeFile(`${output}/car-news-${country}.xml`, newsXML, function (err) {
    if (err) {
      return console.error(err)
    }
    console.log(`资讯 carNews: ${output}/car-news-${country}.xml 站点地图生成成功！`)
  })
}
module.exports = carNews
