// 是否字符串
const isString = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'String'
}
// 是否数字
const isNumber = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Number'
}
// 是否boolean
const isBoolean = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean'
}
// 是否函数
const isFunction = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Function'
}
// 是否为null
const isNull = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Null'
}
// 是否undefined
const isUndefined = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined'
}
// 是否对象
const isObj = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Object'
}
// 是否数组
const isArray = (o) => {
  return Object.prototype.toString.call(o).slice(8, -1) === 'Array'
}
module.exports = {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isNull,
  isUndefined,
  isObj,
  isArray
}
