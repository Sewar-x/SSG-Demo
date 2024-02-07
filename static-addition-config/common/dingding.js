const request = require('request')
const { execCmdSync } = require('../../static-cli/common/util')
const DINGHOOK = {
  static: 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'my-en': 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'my-my': 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'my-zh': 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'id-id': 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'th-th': 'https://oapi.dingtalk.com/robot/send?access_token=access_token',
  'ph-en': 'https://oapi.dingtalk.com/robot/send?access_token=access_token'
}

module.exports = {
  /**
   * 钉钉报警
   * @param {String} type static = 静态化，my-en = 马来 amp 英语，my-my = 马来 amp 马来语, id-id = 印尼 amp, th-th = 泰国 amp
   * @param {String} content
   */
  buildNotice({ type = 'static', content = '' }) {
    const options = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      json: {
        msgtype: 'text',
        text: {
          content: `${content}\nname:${execCmdSync('git', ['config', 'user.name']) ||
            ''}\nemail:${execCmdSync('git', ['config', 'user.email'])}`
        },
        at: {
          atMobiles: [],
          isAtAll: false
        }
      }
    }
    request.post(DINGHOOK[type], options, function(error, response, body) {
      if (error) {
        throw new Error(error)
      }
      console.log(`response: ${JSON.stringify(body)}`)
    })
  }
}
