

const routeMap = require('../config/routeMap')

module.exports = function getRoutes({ lang = 'my-en' }) {
  const route = routeMap[lang] || {}

  return [// amp页面要放在最上面，以防被下面路由覆盖
    {
      path: `/:title(\\S*-?pt[a|t]+?[a-z0-9]+)`,
      name: 'Post',
      component: () => import(/* webpackChunkName: "post" */'@/views/post/index.vue')
    }
  ]
}
