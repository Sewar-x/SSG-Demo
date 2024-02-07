import { getNewsList, getNewsDetail, getAllNews } from '../../src/api/news'
import { handleNewsList } from '../../src/transform/index'
import url from '../../src/config/url'
import { NewsAmp } from '../../src/views/amp/customElement'
import convertHtmlToAMP from '../../static-addition-config/common/convertHtmlToAMP'

export const NEWS_COMMON = {
  /**
   * 创建动态路由表
   * @param {*} options
   */
  async createDynamicRoutes(options = {}) {
    try {
      // 获取命令行参数
      const { params = '', host = '', lang = '', secondLang = '' } = options
      const languageCode = lang
      const countryCode = lang.split('-')[0]
      const isGenerateSingleRoutes = params !== 'all' && params !== null && params !== ''
      if (isGenerateSingleRoutes) { // 单个路由情况，从输入的参数无法直接得出资讯title，需要先实行一次请求详情
        //  根据新闻资讯 id 获取资讯详细内容
        const detailRes = await getNewsDetail({ host, countryCode, languageCode, id: params })
        const singleParams = {
          title: detailRes.data.data.title,
          id: params
        }
        return [
          // 创建单个路由
          await this.createSingleNewsRoute({
            languageCode,
            secondLang,
            params: singleParams
          })
        ]
      } else {
        // 创建所有新闻页面路由
        return await this.createAllNewsRoutes({ host, languageCode, secondLang, countryCode })
      }
    } catch (error) {
      console.log('error :>> ', error)
      return Promise.reject(error)
    }
  },
  async createPublishPath({ route }) {
    // route: "/news/how-is-this-possible-proton-x50-is-cheaper-than-taxfree-honda-hrv-7508"
    const getNewRouteRes = route.match(/(\/[^\/]*\/).*-(\d+)$/)
    if (getNewRouteRes && getNewRouteRes[1] && getNewRouteRes[2]) {
      // newRoute: "/news/7508"
      return `${getNewRouteRes[1]}${getNewRouteRes[2]}`
    }
    return route
  },
  /**
         * 创建全部路由
         * @param {*} host
         */
  async createAllNewsRoutes({ host = '', languageCode = '', secondLang = '', countryCode }) {
    try {
      const listParams = {
        host,
        countryCode,
        languageCode,
        secondLang: secondLang,
        pageNo: 1,
        pageSize: 99999,
        sortType: 1
      }
      const {
        list: newsList = []
      } = await getNewsList(listParams).then(res => handleNewsList(res.data))
      if (!newsList.length) {
        return []
      }
      const routeList = []
      for (let i = 0; i < newsList.length; i += 1) {
        const { title = '', id = '' } = newsList[i]
        const route = await this.createSingleNewsRoute({
          languageCode,
          secondLang,
          params: {
            title,
            id
          }
        })
        routeList.push(route)
      }
      return routeList
    } catch (error) {
      return Promise.reject(error)
    }
  },
  /**
   * 创建单个路由
   * @param {*} params carModelCode,brandCode
   */
  async createSingleNewsRoute({ languageCode = '', secondLang = '', params = { title: '', id: '' } }) {
    const useLang = (secondLang && secondLang !== '') ? secondLang : languageCode
    return url[useLang].news(params.title, params.id)
  }

}

export const NEWS_DRAFT_COMMON = {
  /**
     * 创建全部路由
     * @param {*} host
     */
  async createAllNewsRoutes({ host = '', languageCode = '', secondLang = '', countryCode }) {
    try {
      const unPublishState = [1, 2, 3, 4, 5]
      const draftNewsRes = await Promise.all(unPublishState.map(state => {
        return getAllNews({
          host,
          countryCode,
          languageCode,
          secondLang,
          releaseState: state
        }).then(res => res.data.data)
      }))
      const newsList = draftNewsRes.reduce((acc, val) => acc.concat(val), []) // flatten
      const routeList = []
      const listSecondLang = secondLang // 记录当前命令下的第二语言
      for (let i = 0; i < newsList.length; i += 1) {
        const { id = '', secondLang = '' } = newsList[i]
        if ((!listSecondLang && !secondLang) || (listSecondLang === secondLang)) {
          const route = await this.createSingleNewsRoute({
            languageCode,
            secondLang,
            params: {
              id
            }
          })
          routeList.push(route)
        }
      }
      return routeList
    } catch (error) {
      return Promise.reject(error)
    }
  },
  /**
     * 创建单个路由
     * @param {*} params carModelCode,brandCode
     */
  async createSingleNewsRoute({ languageCode = '', secondLang = '', params = { id: '' } }) {
    const useLang = secondLang || languageCode
    return url[useLang].newsDraft(params.id)
  },
  /**
     * 创建动态路由表
     * @param {*} options
     */
  async createDynamicRoutes(options = {}) {
    try {
      const { params = '', host = '', lang = '', secondLang = '' } = options
      const languageCode = lang
      const countryCode = lang.split('-')[0]
      const isGenerateSingleRoutes = params !== 'all' && params !== null && params !== ''
      return isGenerateSingleRoutes
        ? [
          await this.createSingleNewsRoute({
            languageCode,
            secondLang,
            params: {
              title: '',
              id: params
            }
          })
        ]
        : await this.createAllNewsRoutes({ host, languageCode, secondLang, countryCode })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export const NEWS_AMP_COMMON = {
  /**
     * 创建全部路由
     * @param {*} host
     */
  async createAllNewsRoutes({ host = '', languageCode = '', secondLang = '', countryCode }) {
    try {
      const listParams = {
        host,
        countryCode,
        languageCode,
        secondLang: secondLang,
        pageNo: 1,
        pageSize: 99999,
        sortType: 1
      }
      // 获取新闻资讯列表
      const {
        list: newsList = []
      } = await getNewsList(listParams).then(res => handleNewsList(res.data))
      if (!newsList.length) {
        return []
      }
      const routeList = []
      // 遍历新闻资讯列表，获取创建新闻资讯列表路由
      for (let i = 0; i < newsList.length; i += 1) {
        const { title = '', id = '' } = newsList[i]
        const route = await this.createSingleNewsRoute({
          languageCode,
          secondLang,
          params: {
            title,
            id
          }
        })
        routeList.push(route)
      }
      return routeList
    } catch (error) {
      return Promise.reject(error)
    }
  },
  /**
     * 创建单个路由
     * @param {*} params carModelCode,brandCode
     */
  async createSingleNewsRoute({ languageCode = '', secondLang = '', params = { title: '', id: '' } }) {
    const useLang = (secondLang && secondLang !== '') ? secondLang : languageCode
    return url[useLang].ampNews(params.id)
  },
  /**
     * 创建动态路由表
     * @param {*} options
     */
  async createDynamicRoutes(options = {}) {
    try {
      const { params = '', host = '', lang = '', secondLang = '' } = options
      const languageCode = lang
      const countryCode = lang.split('-')[0]
      const isGenerateSingleRoutes = params !== 'all' && params !== null && params !== ''
      return isGenerateSingleRoutes
        ? [
          await this.createSingleNewsRoute({
            languageCode,
            secondLang,
            countryCode,
            params: {
              id: params
            }
          })
        ]
        : await this.createAllNewsRoutes({ host, languageCode, secondLang, countryCode })
    } catch (error) {
      return Promise.reject(error)
    }
  },
  createHtml({ html = '', routeName = '', routePath }) {
    return convertHtmlToAMP({ html, routeName, ampCustomEleScripts: NewsAmp, routePath })
  }
}
