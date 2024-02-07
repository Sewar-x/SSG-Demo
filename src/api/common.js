import { get } from './index'


/**
 * 首页
 * @param {*} params
 */
export const getAdConfig = params => get('/v2/commercial', params)
