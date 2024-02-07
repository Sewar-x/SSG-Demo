/**
 * 生成一级索引站点地图
 * 需先生成所有二级站点地图
 * 测试/本地：node sitemap --env=test --lang=en --hostType=main
 * 线上：node sitemap --lang=en --hostType=main
 * hostType 默认为 main，马来还有 forum 的域名
 * 三个环境：local, test, production
 */

const fs = require('fs')
const fse = require('fs-extra')

const { lang = 'my-en', env = 'production', hostType = 'main' } = require('yargs').argv

const curEnv = env === 'production' ? 'production' : 'test'
const config = require('./config')[curEnv][lang]

const outputDir = (env === 'production' || env === 'test') ? `${config.output}/${hostType}` : `./local/${lang}/${hostType}`

let appHost = config.host
if (hostType === 'forum') {
  appHost = config.forumHost
}

const files = fs.readdirSync(`${outputDir}/sitemap`) // 读取二级站点地图的文件名

const xmlMap = `<?xml version="1.0" encoding="UTF-8"?>
     <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${files
       .map((fileName) => {
         if (fileName === 'sitemap.xml') return ''
         return `<sitemap>
                <loc>${appHost}/sitemap/${fileName}</loc>
                </sitemap>
            `
       })
       .join('')}
    </sitemapindex>`
fs.writeFile(`${outputDir}/sitemap.xml`, xmlMap, function(err) {
  if (err) {
    console.log('**********', err, '************')
    return
  }
  console.log(`${hostType} sitemap 索引文件生成成功`)
})
