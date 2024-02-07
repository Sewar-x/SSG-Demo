import dateFormat from '@/utils/dateFormat.js'
import authorList from '@/views/author/author.js'

export function host (url) {
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const parts = host.split('.').slice(-3)
  if (parts[0] === 'www') parts.shift()
  return parts.join('.')
}

export function timeAgo (time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}

export function timeZoneParse (timestamp) { // 目前并没有用上时区，慎用该方法
  const nd = new Date(parseInt(timestamp))
  const globalDate = nd.toUTCString()
  const globalDateArray = globalDate.split(' ')
  const YY = nd.getFullYear()
  let dd = nd.getDate()
  if (dd < 10) {
    dd = '0' + dd
  }
  return globalDateArray[2] + ' ' + dd + ',' + YY
}

function pluralize (time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

export function relatedTimeZone (timestamp) {
  const lang = process.env.LANG || 'my-en'
  // return dateFormat[lang](timestamp);
  return dateFormat[lang] ? dateFormat[lang](timestamp) : dateFormat.en(timestamp)
}

export function authorAvatar (authorName) {
  let avatarFlag = false
  for (let i = 0; i < authorList.length; i++) {
    if (authorList[i].name === authorName) {
      avatarFlag = i
      break
    }
  }
  if (avatarFlag !== false) return require(`@/assets/images/authors/${authorList[avatarFlag].avatar}`)
  return require('@/assets/images/news/avator-default.jpg')
}
