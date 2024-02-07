const fse = require('fs-extra')
const path = require('path')
const consola = require('consola')

/**
 * 删除 dist-srr/${lang} 目录
 * @param {String} lang
 */
module.exports = function ({
  lang = '',
  staticSource = 's3'
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!lang) {
        return resolve(true)
      }
      const distPath = staticSource === 's3' ? 'dist-static' : 'dist-ssr'
      const targetPath = path.resolve(__dirname, `../../${distPath}/${lang}`)
      // const targetPath = path.resolve(__dirname, `../../dist-ssr/${lang}`)
      fse.emptyDirSync(targetPath)
      fse.rmdirSync(targetPath)
      consola.success(`>>>> 删除 /${distPath}/${lang} 目录成功!`)
      return resolve(true)
    } catch (error) {
      return reject(error)
    }
  })
}
