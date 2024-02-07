/**
 * @param {*} el 所要观察的节点
 * @param {*} callback 回调函数
 */
export const intersectionObserver = function(el, callback) {
  const intersectionObserver = new IntersectionObserver(function(entries) {
    const eleHeight = entries[0].boundingClientRect.height
    const top = entries[0].intersectionRect.height

    if (entries[0].intersectionRatio <= 0) return
    if (top > eleHeight * 0.1) {
      callback()
      intersectionObserver.disconnect()
    }
  }, {
    threshold: [0.4]
  })
  intersectionObserver.observe(el)
}
