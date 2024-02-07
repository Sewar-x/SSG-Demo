/**
 * 价格格式化
 * @param {*} value 价格
 * @param {*} Vue vue实例
 */
import { languageMap } from '@/lang'
import day from 'dayjs'
import i18nF from '@/lang/index'
const lang = process.env.LANG || 'my-en'
export function filterNum(value) {
  if (!value) return languageMap[lang].common.TBC
  switch (lang) {
    case 'my-en':
    case 'ph-en':
      return parseInt(value).toLocaleString()
    case 'in-en':
      return value.toFixed(2) + ''
    case 'id-id':
      const valueString = (value / 1000).toFixed(2) + ''
      const valueArr = valueString.split('.')
      return valueArr[0].replace(/(\d)(?=(?:\d{3})+$)/g, '$1.') + (valueArr[1] ? ',' + valueArr[1] : '')
    default:
      return parseInt(value).toLocaleString()
  }
}
function isMily (price) {
  return price / 1000000 > 1000
}
function isJuta (price) {
  return price / 1000000 > 1
}
export function toolsPriceFilter(value) {
  if (!value) return languageMap[lang].common.TBC
  if (lang != 'id-id') {
    const num = parseFloat(value)
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  } else {
    value = parseFloat(value)
    let formatValue = (value / Math.pow(10, 6)) > 1 ? value / Math.pow(10, 6) : (value / 1000)// 减6个0
    formatValue = isMily(value) ? formatValue / 1000 : formatValue
    if (formatValue < 1) {
      const num = parseFloat(value).toFixed(2)
      const resutl = num && num.toString().replace(/\d+/, function(s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
      })
      return resutl.replace('.', '$').replace(',', '.').replace('$', ',')
    } else if (!isJuta(value)) {
      const num = parseFloat(value).toFixed(2)
      const resutl = num && num.toString().replace(/\d+/, function(s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
      })
      return resutl.replace('.', '$').replace(',', '.').replace('$', ',')
    }
    const valueString = formatValue.toFixed(2) + ''
    const valueArr = valueString.split('.')
    let result = valueArr[0].replace(/(\d)(?=(?:\d{3})+$)/g, '$1.') + (valueArr[1] ? ',' + valueArr[1] : '')
    // console.log('打印转化前的价格', result)
    result = result + (isMily(value) ? ' Milyar' : ' Juta')
    return result
  }
}

function timeDiff(dateDiff) {
  const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000))
  const leave1 = dateDiff % (24 * 3600 * 1000)
  const hours = Math.floor(leave1 / (3600 * 1000))
  const leave2 = leave1 % (3600 * 1000)
  const minutes = Math.floor(leave2 / (60 * 1000))
  const leave3 = leave2 % (60 * 1000)
  const seconds = Math.round(leave3 / 1000)
  return {
    day: dayDiff,
    hours,
    minutes,
    seconds
  }
}
const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function commentTime(value) {
  const lang = process.env.SECOND_LANG || process.env.LANG || 'my-en'
  const i18n = i18nF(lang)
  const time = day(value).toDate() // 使用 dayjs 处理 ios new Date 兼容问题
  const localTime = new Date()
  const diff = timeDiff(localTime.getTime() - time.getTime())
  if (diff.day >= 7) {
    return `${time.getDate()} ${monthMap[time.getMonth()]}`
  } else if (diff.day >= 2) {
    return i18n.t('comments.days', { num: diff.day })
  } else if (diff.day >= 1) {
    return i18n.t('comments.day', { num: diff.day })
  } else if (diff.hours >= 2) {
    return i18n.t('comments.hours', { num: diff.hours })
  } else if (diff.hours >= 1) {
    return i18n.t('comments.hour', { num: diff.hours })
  } else if (diff.minutes >= 10) {
    return i18n.t('comments.minutes', { num: diff.minutes })
  } else {
    return i18n.t('comments.justNow')
  }
}
