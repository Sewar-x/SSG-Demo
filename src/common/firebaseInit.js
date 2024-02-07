import * as firebase from 'firebase/app'
import 'firebase/messaging'
import 'firebase/analytics'
import firebaseConfig from '@/config/firebase-config.js'
const lang = process.env.LANG || 'my-en'
const country = lang.split('-')[0]

firebase.initializeApp(firebaseConfig[country])
firebase.analytics()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    const publicKey = 'xxxxx'
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      const messaging = firebase.messaging()
      messaging.usePublicVapidKey(publicKey)
      messaging.useServiceWorker(registration)
      setTimeout(() => {
        const token = messaging.getToken() // 目前未存储 token
        console.log('*********firebase token*********', token)
      }, 10000)

      messaging.onMessage(payload => {
        // const notifyMsg = payload.notification;
        // const notification = new Notification(notifyMsg.title, {
        //     body: notifyMsg.body,
        //     icon: notifyMsg.icon
        // });
        // notification.onclick = function (e) { // 綁定點擊事件
        //     // console.log(payload.data.url)
        //     e.preventDefault(); // prevent the browser from focusing the Notification's tab
        //     window.open(payload.data.url);
        // }
      })
      // 开启该客户端的消息推送订阅功能
      return registration
    }).then(function (res) {
    }).catch(function (err) {
      console.log(err)
    })
  })
}
