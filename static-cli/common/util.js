const { exec, spawnSync } = require('child_process')
const path = require('path')
const fse = require('fs-extra')
const consola = require('consola')

const resolve = file => path.resolve(__dirname, file)

const execCmd = function () {
  return new Promise((resolve, reject) => {
    try {
      const cmd = [].shift.call(arguments)
      const argvs = [...arguments]
      exec(
        cmd,
        {
          maxBuffer: 1024 * 5000,
          cwd: process.cwd() // 工作目录默认项目根目录
        },
        function (error, stdout, stderr) {
          if (error) {
            return reject(error)
          }
          stdout && consola.success(`stdout: ${stdout}`)
          stderr && consola.error(`stderr: ${stderr}`)
          resolve(1)
        }
      )
    } catch (error) {
      return reject(error)
    }
  })
}

const execCmdSync = function (cmd = '', args = []) {
  const cmder = spawnSync(cmd, args, { encoding: 'utf-8' })
  if (cmder.stderr) {
    return cmder.stderr
  }
  return cmder.stdout
}

const readFileData = function (filePath) {
  return new Promise((resolve, reject) => {
    fse.readFile(filePath, {
      encoding: 'utf-8'
    }, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const writeFileData = function (filePath = '', data = '') {
  return new Promise((resolve, reject) => {
    fse.writeFile(filePath, data, {
      encoding: 'utf-8'
    }, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const copyData = function (src = '', dest = '') {
  return new Promise(async (resolve, reject) => {
    try {
      await fse.copy(src, dest)
      return resolve(`${src} cpoy to ${dest} succeed!`)
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = {
  execCmd,
  resolve,
  readFileData,
  writeFileData,
  copyData,
  execCmdSync
}
