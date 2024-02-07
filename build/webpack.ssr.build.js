const consola = require('consola')
const ora = require('ora')
const argvs = require('yargs').argv
const path = require('path')
const { execCmd } = require('../static-cli/common/util')

async function run () {
  const spinnerBuild = ora(
    `>>>> Build${argvs.env === 'development' ? ' development ' : ' '}bundles...\n`
  ).start()
  try {
    await require('../static-cli/clean/cli-clean')(argvs) // 删除dist目录
    await runWebpackBuild('client')
    await runWebpackBuild('server')
    // await Promise.all([runWebpackBuild('client'), runWebpackBuild('server')])
    spinnerBuild.stop()
    consola.success(`>>>> Build${argvs.env === 'development' ? ' development ' : ' '}bundles successfully!`)
  } catch (error) {
    spinnerBuild.stop()
    return Promise.reject(error)
  } finally {
    spinnerBuild.stop()
  }
}

async function runWebpackBuild(platform = '') {
  return new Promise(async (resolve, reject) => {
    try {
      const builderPath = path.resolve(__dirname, `./webpack.${platform}.build.js`)
      const nodeCmd = `node ${builderPath} --lang=${argvs.lang || 'my-en'} --secondLang=${argvs.secondLang || ''} --env=${argvs.env} --staticSource=${argvs.staticSource}`
      // consola.info(`>>>> 执行命令: ${nodeCmd}`)
      await execCmd(nodeCmd)
      return resolve(true)
    } catch (error) {
      return reject(error)
    }
  })
}

run()
