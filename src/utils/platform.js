
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
  const u = navigator.userAgent
  // return true;
  return u.indexOf('demo-WebView') > -1
}
