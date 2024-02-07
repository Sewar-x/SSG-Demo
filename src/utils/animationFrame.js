/**
 * linear线性运动 f(x) = x
 * @param {*} frame
 * @param {*} start
 * @param {*} total
 * @param {*} duration
 */
function ease(frame, start, total, duration) {
  return total * frame / duration + start
}

/**
 * 缓动效果-缓出
 * @param {*} frame 当前处于的帧数值
 * @param {*} start 开始的数值
 * @param {*} total 开始和结束中间的数值长度 end - start
 * @param {*} duration 动画完成时间
 */
function easeOut(frame, start, total, duration) {
  frame /= duration
  return -total * frame * (frame - 2) + start
}

/**
 * 缓动效果-缓入缓出
 * @param {*} frame
 * @param {*} start
 * @param {*} total
 * @param {*} duration
 * f(x) = -xx+2x
 */
function easeInOut(frame, start, total, duration) {
  if ((frame /= duration / 2) < 1) {
    return total / 2 * frame * frame + start
  } else {
    return -total / 2 * ((--frame) * (frame - 2) - 1) + start
  }
}

/**
 * 缓入
 * @param {*} frame
 * @param {*} start
 * @param {*} total
 * @param {*} duration
 * f(x) =x * x
 */
function easeIn(frame, start, total, duration) {
  frame /= duration
  return total * frame * frame + start
}

/**
 * 帧动画数组
 * @param {*} start
 * @param {*} end
 * @param {*} duration
 */
function getFrameArray(start, end, duration = 1000) {
  const arr = []
  const len = duration * (60 / 1000) // 总帧数
  for (let i = 0; i <= len; i++) {
    arr.push(easeOut(i * (1000 / 60), start, end - start, duration))
  }
  return arr
}

/**
 * 获取帧动画
 * @param {*} start 开始计数的基值，不传则从0开始
 * @param {*} end 所要累加的值
 * @param {*} duration 动画持续时间，不传为2000ms
 * @param {*} callback 回调函数
 */
export default function getCount({ start = 0, end = 100, duration = 1000, callback }) {
  // 如果是小数，则保留一位小数
  const fixed = end % 1 !== 0 ? 1 : 0
  // 通过上面的方法获取帧数组,根据传入的目标值对小数位进行保留
  const arr = getFrameArray(start, end, duration).map(num => num.toFixed(fixed))
  console.log('arr >>>>>>>>>', arr)
  let contId = null

  function step() {
    const count = arr.shift()
    if (count === undefined) {
      return cancelAnimationFrame(contId)
    } else {
      callback(count)
      contId = window.requestAnimationFrame(step)
    }
  }

  window.requestAnimationFrame(step)
}
