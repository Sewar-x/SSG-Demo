const PRECACHE = 'test-th'
const filesToCache = []

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(filesToCache)).catch((e) => { console.log(e) })
  )
})

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE]
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName))
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete)
      }))
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('push', function (event) {
  console.log('Received a push message', event)

  const notification = event.data.json().notification
  console.log(notification)
  const title = notification.title || 'test-th'
  const body = notification.body || 'test-th message.'
  // var icon = notification.icon;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/avatar_144px.png',
      // badge: '/logo/avatar_144px.png',
      data: event.data.json().data,
      image: notification.image
    })
  )
})

self.addEventListener('notificationclick', event => {
  console.log(event)
  const clickedNotification = event.notification
  clickedNotification.close()
  const examplePage = event.notification.data.url
  const urlToOpen = new URL(examplePage, self.location.origin).href

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
    .then(windowClients => {
      let matchingClient = null

      for (let i = 0, max = windowClients.length; i < max; i++) {
        const windowClient = windowClients[i]
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient
          break
        }
      }

      return matchingClient
        ? matchingClient.focus()
        : clients.openWindow(urlToOpen)
    })
  event.waitUntil(promiseChain)
})

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      const request = e.request.clone()
      return fetch(request).then(function (httpRes) {
        if (!httpRes || httpRes.status !== 200) {
          return httpRes
        }
        if (request.method !== 'POST') {
          const responseClone = httpRes.clone()
          caches.open(PRECACHE).then(function (cache) {
            cache.put(e.request, responseClone)
          })
        }
        return httpRes
      })
    })
  )
})
