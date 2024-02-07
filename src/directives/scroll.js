/** -----------------------------------------------------------------------
 * v-scroll 指令：
 *  1.功能： 当页面滚动时获取dom元，进行打点
 *  2.打点参数
 * value.date(打点参数),
 * value.space(打点间隔),
 * value.index(打点当前索引),v
 * value.length(打点长度)
 * value.infinite(是否无限)
 * value.threshold(默认值0.1,是否显示全部)
 * -----------------------------------------------------------------------
 */
import dot from '../lgs/dot'
function handleClick(el, binding) {
  // console.log("调用指令")
  // console.log(binding.value)
  // console.log(el)
  const {
    data,
    space,
    index,
    length,
    infinite = true,
    threshold = 0.1
  } = binding.value
  if (!binding.value) {
    // 如果value值不存在
    return
  }
  if (infinite) {
    if (index == 1 || index % space == 0) {
      // 每space的距离打一个点
      // console.log(binding.value)
      // console.log(el)
      // console.log("无限的默认")
      dot.scroll([data], [el], threshold)
    }
    if (length && index == length) {
      // 如果为最后一个值，则报type:end
      const endData = JSON.parse(JSON.stringify(data))
      endData.type = 'end'
      dot.scroll([endData], [el], threshold)
    }
  } else {
    dot.scroll([data], [el], threshold)
    // console.log(binding.value)
    // console.log(el)
    // console.log("单个的")
  }
}
export default {
  bind: function(el, binding) {
    handleClick(el, binding)
    // console.log(el)
  }
}
