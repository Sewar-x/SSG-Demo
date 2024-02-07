/**
 *
 * @param x
 * @param y
 */
export const getSum = function (x: number, y: number): number {
  return x + y
}

/**
 *
 * @param obj 想要遍历的对象
 * @param op 想要对对象每个键做的操作（函数）
 * @param assignFlag op的返回值是否赋值给当前键
 */
export const Traversal = function (obj: any, op: any, assignFlag: string): void {
  for (const i in obj) {
    assignFlag ? (obj[i] = op(obj[i])) : op(obj[i])
    if (typeof obj[i] === 'object') {
      Traversal(obj[i], op, assignFlag)
    }
  }
}

/**
 * 清除双引号
 * @param str str
 */
export const replaceDoubleQuotes = function (str = ''): string {
  if (typeof str === 'string') {
    return str.replace(/\"/g, '')
  } else {
    return str
  }
}

/**
 * 获取一定范围的随机数（包含边界值）
 * @param min
 * @param max
 */
export const getRandomNum = function (min: number, max: number): number {
  const range = max - min
  const rand = Math.random()
  const num = min + Math.round(rand * range)
  return num
}

export default {
  getSum
}
