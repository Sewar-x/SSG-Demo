const ip = require('ip')
const express = require('express')
const app = express()
const { createProxyMiddleware } = require('http-proxy-middleware')
const { lang = 'my-en', port = 3000 } = require('yargs').argv

app.use(express.static(`html/${lang}`))
app.use(
  createProxyMiddleware('/v2', {
    target: 'http://demo-test/v2', // 测试
    changeOrigin: true,
    ws: true,
    withCredentials: true
  })
)
app.use(
  createProxyMiddleware('/v1', {
    target: 'http://demo-test/v1', // 测试
    changeOrigin: true,
    ws: true,
    withCredentials: true
  })
)
app.listen(port, function() {
  console.log(`Example app listening on:
>>>> localhost:${port}
>>>> 127.0.0.1:${port}
>>>> ${ip.address()}:${port}`)
})
