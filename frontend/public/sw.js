const CACHE = 'tododo-v1'
const PRECACHE = ['/', '/index.html', '/logo.svg', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  // Don't cache API calls or uploads
  if (e.request.url.includes('/api/') || e.request.url.includes('/uploads/')) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok && e.request.method === 'GET') {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
        }
        return res
      })
      return cached || network
    })
  )
})
