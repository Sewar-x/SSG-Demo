function getLocation(success, error, options) {
  // 获取当前位置的经纬度
  navigator.geolocation.getCurrentPosition(success, error, options)
}

function getDistance(pos1, pos2) {
  // 计算两个经纬度之间的距离 单位是千米
  const lat1 = pos1.lat
  const lat2 = pos2.lat
  const lng1 = pos1.lng
  const lng2 = pos2.lng
  var radLat1 = (lat1 * Math.PI) / 180.0
  var radLat2 = (lat2 * Math.PI) / 180.0
  var a = radLat1 - radLat2
  var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    )
  s = s * 6378.137 // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000
  return s
}
module.exports = {
  getLocation,
  getDistance
}
