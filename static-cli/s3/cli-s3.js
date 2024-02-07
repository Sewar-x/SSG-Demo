const s3 = require('s3')
const path = require('path')
const consola = require('consola')
const ora = require('ora')

// https://www.npmjs.com/package/s3
const client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  s3Options: {
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'region'
  }
})

function uploadToS3Handle({ lang = 'my-en', s3 = 'test' }) {
  return new Promise((resolve, reject) => {
    const params = {
      deleteRemoved: false, // default false, whether to remove s3 objects that have no corresponding local file.
      localDir: path.resolve(__dirname, `../../dist-static/${lang}/`), // 本地资源路径
      s3Params: { 
        Bucket: s3 === 'test' ? 'test-cdn-car-static' : 'cdn-car-static',  // S3 文件目录
        Prefix: `${lang}/`, // 文件前缀
        ACL: 'public-read'
      }
    }

    const uploader = client.uploadDir(params)
    uploader.on('error', function (err) {
      return reject(err)
    })

    uploader.on('end', function () {
      return resolve(true)
    })
  })
}

module.exports = {
  async uploadToS3({ lang = 'my-en', s3 = 'test' }) {
    const spinnerBuild = ora('>>>> S3 uploading...\n').start()
    try {
      await uploadToS3Handle({ lang, s3 })
      spinnerBuild.stop()
      consola.success('>>>> 静态资源上传到 s3 完成!')
      return Promise.resolve(true)
    } catch (error) {
      spinnerBuild.stop()
      return Promise.reject(error)
    } finally {
      spinnerBuild.stop()
    }
  }
}
