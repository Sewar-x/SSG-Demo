function isAndroid() {
  const userAgent = navigator.userAgent
  if (/Android/.test(userAgent)) {
    return true
  }
  return false
}
function calculateTimeLimit() {
  const currentTime = (new Date()).getTime()
  const popupGuidanceCloseTime = localStorage.getItem('popupGuidanceCloseTime')
  const timeDiff = (currentTime - popupGuidanceCloseTime)
  const hourDiff = Math.floor(timeDiff / (60 * 60 * 1000))
  return !(!popupGuidanceCloseTime || hourDiff > 23)
}
const foldButton = document.querySelector('#unfold-button')
foldButton && foldButton.addEventListener('click', function() {
  if (isAndroid()) {
    AMP.setState({ isFold: true })
    if (!calculateTimeLimit()) {
      AMP.setState({ popupShow: true })
    }
  } else {
    AMP.setState({ isFold: false })
  }
})
const laterButton = document.querySelector('#later-button')
laterButton && laterButton.addEventListener('click', function() {
  if (isAndroid()) {
    const currentTime = (new Date()).getTime()
    localStorage.setItem('popupGuidanceCloseTime', currentTime)
  }
})
const popupCloseButton = document.querySelector('.close-img')
popupCloseButton && popupCloseButton.addEventListener('click', function() {
  AMP.setState({ popupShow: false })
  AMP.setState({ isFold: false })
})
const confirmButton = document.querySelector('.confirm-btn')
confirmButton && confirmButton.addEventListener('click', function() {
  AMP.setState({ popupShow: false })
  AMP.setState({ isFold: false })
})
