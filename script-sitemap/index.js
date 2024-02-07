/**
 * 有三个环境：local 是打包到本地，test打包到测试环境，production打包到正式环境
 * env 本地:local,也可传入非production和test的任意值; 测试：test; 生产：production,默认为生产
 * lang 语言：马来: my-en  印尼: id-id  泰国: th-th  菲律宾: ph-en
 * target 默认为all,打包全部，也可传入modules下的文件名，可多个传入，通过逗号分隔  --target="carNews,modelImage"
 *
 * 打包本地  node index --env=local --lang=my-en --target="modeules下文件名"  本地默认走测试服
 * 打包测试  node index --env=test --lang=my-en
 * 打包生产  node index --lang=my-en 默认为生产环境
 */
const fse = require('fs-extra')
const path = require('path')
const argv = require('yargs').argv
const { target = 'all', lang = 'my-en', env = 'production' } = argv

const curEnv = env === 'production' ? 'production' : 'test'
const config = require('./config')[curEnv][lang]

let output = ''; let forumOutput = ''
if (env === 'production' || env === 'test') {
  output = config.output + '/main/sitemap'
  forumOutput = config.output + '/forum/sitemap'
} else {
  output = `./local/${lang}/main/sitemap`
  forumOutput = `./local/${lang}/forum/sitemap`
}

// 确保有目录，如果没有则创建目录
fse.ensureDirSync(output)
fse.ensureDirSync(forumOutput)

// 读取modules文件目录下的所有文件名,转换为对象
const fileObj = fse.readdirSync(path.resolve(__dirname, './modules'))
  .map(item => item.replace(/\.js$/, ''))
  .reduce((t, v) => {
    t[v] = v
    return t
  }, {})

// 通过文件名获取文件中的方法
const buildXMLTypes = target.split(',')
if (buildXMLTypes[0] === 'all') {
  for (const type in fileObj) require(`./modules/${type}`)({ lang, output, forumOutput, config })
} else {
  buildXMLTypes.forEach((type) => {
    fileObj[type] && require(`./modules/${type}`)({ lang, output, forumOutput, config })
  })
}
