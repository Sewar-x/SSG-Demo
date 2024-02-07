const { post, get, put, del } = require('./api')


/**
 * 获取seo文章信息
 */
exports.getAllSeoNews = (params) => get('/v2/news/seo', params)

/**
 * 分页查询帖子列表
 * @param {*} params {pageNo , pageSize , topState , featureState , topicId , groupId , modelId}
 */
exports.getPostList = (params) => get('/v2/forumPost/list', params)
