const CACHE_VERSION = 'dwd-dashboard-release-1.10'
// Maps survive app releases; each map keeps only its latest copy.
const MAP_IMAGE_CACHE = 'dwd-dashboard-map-images'
const IMAGE_CACHE_FALLBACK_MESSAGE = 'dwd-image-cache-fallback'
const APP_SHELL_ENTRY = './'

// Hosting redirects index.html to "/", so the shell is cached only as "./".
const APP_SHELL_ASSETS = [
  APP_SHELL_ENTRY,
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

const EXPECTED_CONTENT_TYPES = [
  { path: /\.css$/i, contentType: /^text\/css/i },
  { path: /\.m?js$/i, contentType: /(java|ecma)script/i },
  { path: /\.(png|jpe?g|gif|webp|svg|ico)$/i, contentType: /^image\//i },
  { path: /\.(json|webmanifest)$/i, contentType: /json/i }
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

  if (!isSameOrigin(request.url)) {
    if (isImageRequest(request)) {
      event.respondWith(handleMapImageRequest(event))
    }
    // DWD texts and reports bypass the SW cache; the app keeps its own copies.
    return
  }

  event.respondWith(handleStaticRequest(request))
})

async function precacheAppShell () {
  const responses = await Promise.all(
    APP_SHELL_ASSETS.map(async asset => {
      const assetUrl = toScopeUrl(asset)
      const response = await fetch(assetUrl, { cache: 'reload' })
      if (!isCacheableAppResponse(assetUrl, response)) {
        throw new Error(`App-Shell-Ressource ungültig: ${assetUrl}`)
      }
      return { assetUrl, response }
    })
  )

  const cache = await caches.open(CACHE_VERSION)
  await Promise.all(
    responses.map(({ assetUrl, response }) => cache.put(assetUrl, response))
  )
  await self.skipWaiting()
}

async function removeOutdatedCaches () {
  const cacheKeys = await caches.keys()
  const deleteTasks = cacheKeys
    .filter(cacheKey => cacheKey !== CACHE_VERSION && cacheKey !== MAP_IMAGE_CACHE)
    .map(cacheKey => caches.delete(cacheKey))

  await Promise.all(deleteTasks)
  await self.clients.claim()
}

function toScopeUrl (path) {
  return new URL(path, self.location.href).href
}

function isSameOrigin (url) {
  return new URL(url).origin === self.location.origin
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

function isCacheableAppResponse (url, response) {
  if (!response || response.status !== 200 || response.redirected) {
    return false
  }

  const { pathname } = new URL(url)
  const contentType = response.headers.get('content-type') || ''
  const expectation = EXPECTED_CONTENT_TYPES.find(({ path }) =>
    path.test(pathname)
  )

  if (expectation) {
    return expectation.contentType.test(contentType)
  }

  const isHtml = /^text\/html/i.test(contentType)
  const hasFileExtension = /\.[^/]+$/.test(pathname)
  return hasFileExtension ? !isHtml : isHtml
}

// Map URLs carry a "t" cache buster; one entry per map keeps the latest copy.
function getMapImageCacheKey (url) {
  const keyUrl = new URL(url)
  keyUrl.searchParams.delete('t')
  return keyUrl.href
}

async function handleNavigationRequest (request) {
  try {
    const networkResponse = await fetch(request)
    await cacheResponse(request, networkResponse)
    return networkResponse
  } catch {
    const cachedResponse = await caches.match(request)
    return cachedResponse || caches.match(toScopeUrl(APP_SHELL_ENTRY))
  }
}

async function handleMapImageRequest (event) {
  const { request } = event
  const cacheKey = getMapImageCacheKey(request.url)

  let networkResponse
  try {
    networkResponse = await fetch(request.url, {
      mode: 'cors',
      credentials: 'omit',
      cache: request.cache
    })
  } catch {
    const cache = await caches.open(MAP_IMAGE_CACHE)
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      await notifyImageCacheFallback(event.clientId, request.url)
      return cachedResponse
    }

    // Without CORS or a cached copy, fall back to the browser's own request.
    return fetch(request)
  }

  if (networkResponse.ok && isImageResponse(networkResponse)) {
    const cachePromise = cacheMapImage(cacheKey, networkResponse.clone())
    if (request.cache === 'no-cache') {
      await cachePromise
    } else {
      event.waitUntil(cachePromise)
    }
  }
  return networkResponse
}

function isImageResponse (response) {
  return /^image\//i.test(response.headers.get('content-type') || '')
}

async function cacheMapImage (cacheKey, response) {
  const cache = await caches.open(MAP_IMAGE_CACHE)
  await cache.put(cacheKey, response)
}

async function notifyImageCacheFallback (clientId, url) {
  if (!clientId) {
    return
  }

  const client = await self.clients.get(clientId)
  if (client) {
    client.postMessage({ type: IMAGE_CACHE_FALLBACK_MESSAGE, url })
  }
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
  if (!isCacheableAppResponse(request.url, response)) {
    return
  }

  const cache = await caches.open(CACHE_VERSION)
  await cache.put(request, response.clone())
}
