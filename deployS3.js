#!/usr/bin/env node

/**
 * 发布静态资源到 s3
 */
(async function() {
  try {
    const {
      lang = 'my-en',
      env = 'test'
    } = require('yargs').argv
    const { uploadToS3 } = require('./static-cli/s3/cli-s3')
    await uploadToS3({ lang, s3: env }) // 测试服上传静态资源到 s3
  } catch (error) {
    require('consola').fatal(error)
    require('exit')(2)
  }
})()
