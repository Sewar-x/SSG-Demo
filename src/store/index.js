import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)
//  require.context返回modules文件夹下所有的文件对象,参考https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)
/*
*通过直接获取modules文件夹下的所有文件添加进入modules对象
*回调函数参数：
*modules：文件对象
*modulePath：文件路径
*/
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // 获取文件名称
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')

  // 获取路径保存在modulePath文件内容
  const value = modulesFiles(modulePath)

  // 修改modules对象
  modules[moduleName] = value.default

  return modules
}, {})

export function createStore () {
  return new Vuex.Store({
    modules,
    state: {

    },
    mutations: {

    },
    getters,
    actions: {

    }
  })
}
