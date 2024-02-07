import Vue from 'vue'
export default {
  bind: function(el, binding, vnode) {
    const isA = binding.modifiers.a
    const value = binding.value.split(',')
    const href = el.href
    if (!value[0]) return
    el.addEventListener('click', e => {
      const params = {
        eventCategory: value[0],
        eventAction: value[1],
        eventLabel: value[2],
        eventValue: parseInt(value[3])
      }

      if (isA) {
        e.preventDefault()
        params.transport = 'beacon'
      }
      Vue.$ga.event(params)
      if (href) {
        setTimeout(() => {
          location.href = href
        }, 300)
      }
    })
  }
}
