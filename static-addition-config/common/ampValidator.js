const amphtmlValidator = require('amphtml-validator')
const { buildNotice } = require('./dingding')
const { lang = 'my-en', env, secondLang } = require('yargs').argv
// const prodHostByLang = require('../../src/api/hostMap').production
const { ampNoticeHost } = require('../../src/config/urlMap')

module.exports = function (html = '', routePath = '', hostType = 'main') {
  return amphtmlValidator.getInstance().then(function (validator) {
    const result = validator.validateString(html)
    if (result.status !== 'PASS') {
      let msg = ''
      for (let ii = 0; ii < result.errors.length; ii++) {
        const error = result.errors[ii]
        msg += '(' + error.line + ': ' + error.col + ')' + ': ' + error.message
        if (error.specUrl !== null) {
          msg += ' (see ' + error.specUrl + ')'
        }
        msg += '\n\n'
      }
      const targetLang = secondLang || lang
      const url = ampNoticeHost[hostType][targetLang] + routePath
      console.log('url >>>>>>>>>', url)
      if (env === 'production') {
        msg += `amp测试链接：https://search.google.com/test/amp?url=${url}`
        buildNotice({
          type: lang,
          content: `【amp报警】\n${targetLang}\n${url}\n\n${msg}`
        })
      }
      throw new Error(msg)
    }
  })
}
