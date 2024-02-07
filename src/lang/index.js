import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
const modulesFiles = require.context('./messages', true, /\.js$/)
/*
 *通过直接获取messages文件夹下的所有文件添加进入messages对象
 *回调函数参数：
 *messages：文件对象
 *modulePath：文件路径
 */
const languageMap = modulesFiles.keys().reduce((modules, modulePath) => {
  // 获取文件名称
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')

  // 获取路径保存在modulePath文件内容
  const value = modulesFiles(modulePath)

  // 修改modules对象
  modules[moduleName] = value.default
  return modules
}, {})

export default function i18n(lang = 'my-en') {
  return new VueI18n({
    locale: lang, // 设置地区
    messages: languageMap
  })
}

export { languageMap }
