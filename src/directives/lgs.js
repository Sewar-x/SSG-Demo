/** -----------------------------------------------------------------------
 * v-lgs 指令：
 *  1.功能： 打点记录点击来源
 * -----------------------------------------------------------------------
 */
function handleClick(el, binding) {
  const value = binding.value
  if (!value) {
    return
  }
  function handle(e) {
    const paramStr = sessionStorage.getItem('lgs')
    if (paramStr) {
      const paramList = JSON.parse(paramStr)
      if (
        paramList.length > 0 &&
        paramList.filter(item => item.key === 'p0').length > 0
      ) {
        const p1 = paramList.filter(item => item.key === 'p0')[0].value
        value.push({
          key: 'p1',
          value: p1
        })
      }
    }
    value.forEach(item => {
      if (item.key === 'time') {
        item.value = new Date().getTime() - item.value
      }
      // 打点新逻辑，pg推source，target推pg的逻辑
      if (item.key === 'pg') {
        item.key = 'source_pg'
      }
      if (item.key === 'pg_id') {
        item.key = 'source_id'
      }
      if (item.key === 'target_type') {
        item.key = 'pg'
      }
      if (item.key === 'target_id') {
        item.key = 'pg_id'
      }
    })
    sessionStorage.setItem('lgs', JSON.stringify(value))
    // 在sessionStorage新增标志位
    sessionStorage.setItem('alreadyVLGS', true)
  }
  return handle
}
export default {
  bind: function(el, binding) {
    el.addEventListener('click', handleClick(el, binding), true)
  }
}
