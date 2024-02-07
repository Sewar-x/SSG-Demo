#!/usr/bin/env node

/**
 * #!/usr/bin/env node 为系统环境头，表示使用当前环境 node 的命令行脚本
 * 运行命令
 * 静态路由: node -r esm generate.js --target=index --lang=my-en --env=test --webpack=false
 * 动态路由: node -r esm generate.js --target=newsInfo --params=1234 --lang=my-en  --env=test --webpack=true
 * esm 文档：https://www.npmjs.com/package/esm
 */
// 立即执行函数
(function() {
  // 引入静态化脚手架对象，调用 run 方法开始静态化
  require('./static-cli/cli')
    .run()
    .catch((err) => {
      require('consola').fatal(err)
      require('exit')(2)
    })
})()
