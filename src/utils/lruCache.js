export function LRUCache(capacity) {
  this.cache = new Map()
  this.capacity = capacity
}

LRUCache.prototype.get = function(key) {
  if (this.cache.has(key)) {
    // 存在即更新
    const temp = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, temp)
    return temp
  }
  return -1
}

LRUCache.prototype.put = function(key, value) {
  if (this.cache.has(key)) {
    // 存在即更新（删除后加入）
    this.cache.delete(key)
  } else if (this.cache.size >= this.capacity) {
    // 不存在即加入
    // 缓存超过最大值，则移除最近没有使用的
    this.cache.delete(this.cache.keys().next().value)
  }
  this.cache.set(key, value)
}

LRUCache.prototype.save = function (prefix) {
  const keys = [...this.cache.keys()]
  const values = [...this.cache.values()]

  localStorage.setItem(`${prefix}-keys`, JSON.stringify(keys))
  localStorage.setItem(`${prefix}-values`, JSON.stringify(values))
}

LRUCache.prototype.getFromLocal = function (prefix) {
  let keys = localStorage.getItem(`${prefix}-keys`)
  let values = localStorage.getItem(`${prefix}-values`)

  if (!keys) return

  keys = JSON.parse(keys) || []
  values = JSON.parse(values) || []

  keys.forEach((k, i) => {
    this.put(k, values[i])
  })
}

LRUCache.prototype.toArray = function () {
  const value = [...this.cache.values()]
  value.reverse()
  return value
}
