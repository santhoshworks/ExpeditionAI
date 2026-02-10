const CACHE_NAME = 'thoughtmap-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/favicon.svg',
  '/manifest.webmanifest',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API routes, auth, and external requests
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return
  if (url.origin !== self.location.origin) return

  // For navigation requests: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/dashboard') || caches.match('/'))
    )
    return
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff2?)$/))) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
