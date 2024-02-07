
export function isAndroid() {
  const u = navigator.userAgent
  return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
}

export function isIOS() {
  const u = navigator.userAgent
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) || !!u.match(/FBAN|FBAV/)
}

/**
 * 判断是否安卓的webview打开
 */
export function isWebView() {
  // if(process.env.IS_SERVER) return false;
  const u = navigator.userAgent
  // return true;
  return u.indexOf('demo-WebView') > -1
}

export function debounce(func, delay) {
  let timeout
  return function(e) {
    clearTimeout(timeout)
    const context = this
    const args = arguments
    timeout = setTimeout(function() {
      func.apply(context, args)
    }, delay)
  }
};
