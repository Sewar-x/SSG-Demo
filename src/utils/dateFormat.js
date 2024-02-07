const commonDateFormat = (timestamp, isHms = true) => {
  const nd = new Date(parseInt(timestamp))

  const globalDate = nd.toUTCString() // "Wed Jan 02 2019"
  // 之后的处理是一样的
  // const globalDateArray = globalDate.split(' ')
  const YY = nd.getFullYear()
  const MM = nd.toDateString().split(' ')[1]
  let dd = nd.getDate()
  if (dd < 10) {
    dd = '0' + dd
  }
  let hh = nd.getHours()
  const minutes = nd.getMinutes()
  const mm = ':' + (minutes < 10 ? '0' + minutes : minutes)
  const ss = ':' + nd.getSeconds()
  let str
  if (hh > 12) {
    hh -= 12
    if (hh < 10) {
      hh = '0' + hh
    }
    str = ' PM'
  } else {
    if (hh < 10) {
      hh = '0' + hh
    }
    str = ' AM'
  }
  let timeFormat = MM + ' ' + dd + ', ' + YY
  if (isHms) {
    timeFormat += ' ' + hh + mm + str
  }
  return timeFormat
}

export default {
  // en: commonDateFormat,
  'my-en': commonDateFormat,
  'in-en': commonDateFormat,
  'th-th': commonDateFormat,
  'ph-en': commonDateFormat,
  'id-id': (timestamp, isHms = true) => {
    function zone (num) {
      const str = `00${num}`
      return str.slice(-2)
    }
    const monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    // 弃用原先的时区逻辑
    // let date = new Date(parseInt(timestamp)).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    // // console.log(date)
    // let mdy = date.split(',')[0].split('/')
    // let hms = date.split(',')[1].trim().split(' ')[0].split(':')
    // let flag = date.split(',')[1].trim().split(' ')[1]
    // let dmy = `${mdy[1]} ${monthArr[mdy[0] - 1]} ${mdy[2]}`
    // let hm = `${flag === 'PM' ? hms[0] + 12 : zone(hms[0])}:${zone(hms[1])}`
    // const date = new Date(parseInt(timestamp)).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    // // console.log(date)
    // const mdy = date.split(',')[0].split('/')
    // const hms = date.split(',')[1].trim().split(' ')[0].split(':')
    // const flag = date.split(',')[1].split(' ')[1]
    // 改用从日期中直取的形式
    const date = new Date(parseInt(timestamp))
    const mdy = [date.getMonth() + 1, date.getDate(), date.getFullYear()]
    const hms = [date.getHours(), date.getMinutes(), date.getSeconds()]
    const dmy = `${mdy[1]} ${monthArr[mdy[0] - 1]}, ${mdy[2]}`
    const hm = `${zone(hms[0])}:${zone(hms[1])}`
    if (isHms) {
      return `${dmy} ${hm}`
    }
    return dmy
  }
}
