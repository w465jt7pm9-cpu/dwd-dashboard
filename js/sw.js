const CACHE_VERSION = 'dwd-dashboard-release-1.1'

const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/utilities.css',
  './js/app.js',
  './images/icon-180.png',
  './images/icon-192.png',
  './images/icon-512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(precacheAppShell())
})

self.addEventListener('activate', event => {
  event.waitUntil(removeOutdatedCaches())
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
    return
  }

  event.respondWith(handleStaticRequest(request))
})

async function precacheAppShell () {
  const cache = await caches.open(CACHE_VERSION)
  await cache.addAll(APP_SHELL_ASSETS)
  await self.skipWaiting()
}

async function removeOutdatedCaches () {
  const cacheKeys = await caches.keys()
  const deleteTasks = cacheKeys
    .filter(cacheKey => cacheKey !== CACHE_VERSION)
    .map(cacheKey => caches.delete(cacheKey))

  await Promise.all(deleteTasks)
  await self.clients.claim()
}

function isNavigationRequest (request) {
  return request.mode === 'navigate'
}

function isImageRequest (request) {
  if (request.destination === 'image') {
    return true
  }

  const requestUrl = new URL(request.url)
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(requestUrl.pathname)
}

async function handleNavigationRequest (request) {
  try {
    const networkResponse = await fetch(request)
    await cacheResponse(request, networkResponse)
    return networkResponse
  } catch {
    const cachedResponse = await caches.match(request)
    return cachedResponse || caches.match('./index.html')
  }
}

async function handleImageRequest (request) {
  const cachedResponse = await caches.match(request)

  const networkRequest = fetch(request)
    .then(async networkResponse => {
      await cacheResponse(request, networkResponse)
      return networkResponse
    })
    .catch(() => cachedResponse)

  return cachedResponse || networkRequest
}

async function handleStaticRequest (request) {
  try {
    const networkResponse = await fetch(request)
    await cacheResponse(request, networkResponse)
    return networkResponse
  } catch {
    return caches.match(request)
  }
}

async function cacheResponse (request, response) {
  if (!response || response.status !== 200) {
    return
  }

  const cache = await caches.open(CACHE_VERSION)
  await cache.put(request, response.clone())
}
