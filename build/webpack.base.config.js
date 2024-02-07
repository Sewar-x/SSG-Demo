const path = require('path')// 处理文件路径的Node.js模块。 
const px2rem = require('postcss-px2rem') //一个PostCSS插件，用于将像素值转换为rem。
const TerserPlugin = require('terser-webpack-plugin') //用于优化和压缩JavaScript代码的Webpack插件。
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin') //用于提供更友好的错误输出的Webpack插件。
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //用于将CSS文件提取到单独的文件中的Webpack插件。
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin') //用于在Webpack中检查TypeScript代码的Webpack插件。
const CopyPlugin = require('copy-webpack-plugin') //用于在Webpack构建过程中复制文件的插件。
const { VueLoaderPlugin } = require('vue-loader') //用于处理Vue.js文件的Webpack加载器
const commonTool = require('./common')

/**
   * get client webpack config
   * @param {String} lang 主要语言（第一语言），默认为 'my-en'
   * @param {String} env 开发环境，测服/正式服，默认测服
   * @param {Boolean} localDev 本地开发还是静态化打包。本地开发是为 true。默认为 false
   */
module.exports = function ({
  lang = 'my-en',
  env = 'development',
  localDev = false,
  staticSource = 's3'
}) {
  // 获取主题样式标识
  const styleLang = commonTool.getStyleVarByLang(lang)
  // 静态化页面静态资源在s3上，这里和ssr页面做一个区分
  const distPath = staticSource === 's3' ? 'dist-static' : 'dist-ssr'
  return {
    mode: localDev ? 'development' : 'production', // 发布环境
    devtool: localDev ? '#cheap-module-source-map' : false, // 本地开发环境下需要 sourceMap
    output: {
      // 输出文件路径
      path: path.resolve(__dirname, `../${distPath}/${lang}`),
      // 静态资源发布路径
      publicPath: !localDev && staticSource === 's3'
        ? commonTool.getPublishPath({ env, lang: lang })
        : `/${distPath}/${lang}/`,
      // 块文件名
      chunkFilename: 'common/[name].[chunkhash:8].js',
      // 文件名
      filename: 'common/[name].[chunkhash:8].js'
    },
    resolve: {
      // 文件扩展名
      extensions: ['.js', '.json', '.vue', '.scss', '.css'],
      // 别名
      alias: {
        public: path.resolve(__dirname, '../public'),
        '@': path.resolve(__dirname, '..', 'src')
      }
    },
    // 配置 webpack 的 optimization 属性，用于配置 webpack 的优化规则
    optimization: {
      minimize: !localDev,
      minimizer: [
        new TerserPlugin({ //插件用于在生产环境中对打包的 JavaScript 代码进行压缩优化。
          parallel: true,//并发处理,这样可以提高压缩效率。
          sourceMap: localDev, // 如果在生产环境中使用 source-maps，必须设置为 true
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            compress: {//配置压缩选项
              warnings: false,
              drop_console: env !== 'development',//在生产环境中删除控制台和调试代码。
              drop_debugger: env !== 'development'//在生产环境中删除控制台和调试代码。
            },
            output: {
              comments: false //禁用输出注释
            }
          },
          extractComments: false //不提取注释到source-maps
        })
      ],
      splitChunks: {//控制代码分
        cacheGroups: {//定义不同的分割规则
          vanUI: {
            name: 'vanUI',//分割后的chunk的名称prefix
            test: /[\\/]node_modules[\\/](.*vant.*)[\\/](lib)[\\/](toast|icon|popup|overlay|info|loading|style)[\\/]/,//正则表达式用于匹配vanUI组件的相关代码
            chunks: 'all',//这个属性表示将匹配到的所有代码都打包成一个chunk。如果设置为'async'，则只会将匹配到的代码打包成一个chunk，但这个chunk会异步加载，并不会影响页面的初始加载速度。
            enforce: true//当没有找到对应的chunk时，强制创建一个chunk
          }
        }
      }
    },
    module: {
      noParse: /es6-promise\.js$/, // avoid webpack shimming process
      rules: [
        {
          test: /\.(vue|js)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          enforce: 'pre',
          options: {
            fix: true
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              preserveWhitespace: false
            }
          }
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|eot|woff2?|ttf|otf)/,
          loader: 'url-loader',
          options: {
            limit: 1024,
            name: 'static/img/[name].[contenthash:8].[ext]'
          }
        },
        {
          test: /\.(ts|tsx)?$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/] // 为 script 有 lang='ts' 标识的脚本文件添加 ts 后缀
          }
        },

        {
          test: /\.(c|sa|sc)ss$/,
          use: [
            localDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { minimize: !localDev }
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    px2rem({
                      remUnit: 100
                    })
                  ]
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                // data: `@import '~@/assets/index.scss'; @import '~@/assets/scss/variables/${styleLang}.scss';`,
                data: `@import '~@/assets/scss/variables/${styleLang}.scss';`,
                outputStyle: 'expanded' // https://github.com/neilgao000/blog/issues/15
              }
            }
          ]
        }
      ]
    },
    performance: {
      hints: false //关闭 Webpack 的性能提示。
    },
    plugins: !localDev 
      ? [ // 生产环境下 webpack 插件
        new VueLoaderPlugin(), // Vue.js 加载器。
        new MiniCssExtractPlugin({ //使用 MiniCSS 插件来提取 CSS 文件。
          filename: 'common/[name].[contenthash:8].css',
          ignoreOrder: true
        }),
        new CopyPlugin({ //使用 CopyPlugin 插件来复制静态文件
          patterns: [
            {
              from: path.resolve(__dirname, `../public/`),
              to: path.resolve(__dirname, `../${distPath}/${lang}/public`)
            }
          ]
        })
      ]
      : [ // 开发环境下 webpack 插件
        new VueLoaderPlugin(), // Vue.js 加载器。
        new FriendlyErrorsPlugin(), //使用 FriendlyErrors 插件来处理错误。
        new ForkTsCheckerWebpackPlugin() //使用 ForkTsCheckerWebpack 插件来检查 TypeScript 文件。
      ]
  }
}
