const Argv = require('./argv/cli-argv') //处理命令行参数
const Builer = require('./builder/cli-builder') // 静态化构建脚本
const Generator = require('./generator/cli-generator')// 生成静态化页面
const consola = require('consola')

exports.run = async function () {
  try {
    const argvs = await Argv.run(require('yargs').argv) // 命令行参数处理
    consola.info(`>>>> 命令行参数:\n${JSON.stringify(argvs, null, 1)}`)
    if (argvs.webpack) {
      await require('./clean/cli-clean')(argvs) // 删除dist目录
      await Builer.run(argvs) // 执行 npm run build 脚本命令
    }
    await Generator.run(argvs) // 生成静态化页面
    if (argvs.env === 'test') {
      const { uploadToS3 } = require('./s3/cli-s3')
      await uploadToS3(argvs) // 测试服上传静态资源到 s3
    }
    consola.success('>>>> All Finish!')
  } catch (err) {
    return Promise.reject(err)
  }
}
