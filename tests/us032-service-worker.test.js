const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.resolve(__dirname, '..')
const SW_URL = 'https://dwd-dashboard.pages.dev/sw.js'
const APP_ORIGIN = 'https://dwd-dashboard.pages.dev'
const MAP_URL = 'https://www.dwd.de/DWD/wetter/wv_spez/seewetter/nordsa_24.png'

const swSource = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')
const appSource = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8')
const MAP_CACHE_NAME = swSource.match(/MAP_IMAGE_CACHE = '([^']+)'/)[1]

function toCacheKey (request) {
  return typeof request === 'string'
    ? new URL(request, SW_URL).href
    : request.url
}

class FakeCache {
  constructor () {
    this.entries = new Map()
  }

  async put (request, response) {
    this.entries.set(toCacheKey(request), response)
  }

  async match (request) {
    const response = this.entries.get(toCacheKey(request))
    return response ? response.clone() : undefined
  }
}

class FakeCacheStorage {
  constructor () {
    this.store = new Map()
  }

  async open (name) {
    if (!this.store.has(name)) {
      this.store.set(name, new FakeCache())
    }
    return this.store.get(name)
  }

  async keys () {
    return Array.from(this.store.keys())
  }

  async delete (name) {
    return this.store.delete(name)
  }

  async match (request) {
    for (const cache of this.store.values()) {
      const response = await cache.match(request)
      if (response) {
        return response
      }
    }
    return undefined
  }
}

function textResponse (body, contentType, status = 200) {
  return new Response(body, { status, headers: { 'content-type': contentType } })
}

function appShellResponse (url) {
  const { pathname } = new URL(url)
  if (pathname.endsWith('.css')) return textResponse('css', 'text/css; charset=utf-8')
  if (pathname.endsWith('.js')) return textResponse('js', 'application/javascript')
  if (pathname.endsWith('.png')) return textResponse('png', 'image/png')
  return textResponse('<html>', 'text/html; charset=utf-8')
}

function loadServiceWorker () {
  const listeners = {}
  const postedMessages = []
  const fetchCalls = []
  const caches = new FakeCacheStorage()
  let fetchImpl = async url => appShellResponse(url)

  const sandbox = {
    self: {
      location: new URL(SW_URL),
      addEventListener: (type, listener) => {
        listeners[type] = listener
      },
      skipWaiting: async () => {},
      clients: {
        claim: async () => {},
        get: async clientId =>
          clientId === 'client-1'
            ? { postMessage: message => postedMessages.push(message) }
            : undefined
      }
    },
    caches,
    fetch: (input, init) => {
      fetchCalls.push({ input, init })
      return fetchImpl(input, init)
    },
    URL,
    Response,
    Headers,
    console
  }

  vm.createContext(sandbox)
  vm.runInContext(swSource, sandbox, { filename: 'sw.js' })

  return {
    caches,
    fetchCalls,
    postedMessages,
    setFetch: impl => {
      fetchImpl = impl
    },
    async install () {
      let installPromise
      listeners.install({ waitUntil: promise => { installPromise = promise } })
      return installPromise
    },
    async activate () {
      let activatePromise
      listeners.activate({ waitUntil: promise => { activatePromise = promise } })
      return activatePromise
    },
    dispatchFetch (request) {
      let responsePromise = null
      const pending = []
      listeners.fetch({
        request: { method: 'GET', mode: 'no-cors', destination: '', ...request },
        clientId: 'client-1',
        respondWith: promise => { responsePromise = Promise.resolve(promise) },
        waitUntil: promise => pending.push(promise)
      })
      return {
        responsePromise,
        settled: async () => {
          const response = await responsePromise
          await Promise.all(pending)
          return response
        }
      }
    }
  }
}

function mapRequest (cacheBuster) {
  return { url: `${MAP_URL}?t=${cacheBuster}`, destination: 'image' }
}

function offlineFetch () {
  throw new TypeError('Failed to fetch')
}

async function getCurrentCache (sw) {
  const cacheName = (await sw.caches.keys()).find(name => name !== MAP_CACHE_NAME)
  return sw.caches.open(cacheName)
}

function getMapCache (sw) {
  return sw.caches.open(MAP_CACHE_NAME)
}

async function testRegistrationScope () {
  assert.ok(
    !fs.existsSync(path.join(ROOT, 'js', 'sw.js')),
    'Service Worker darf nicht unter /js/ liegen (Scope wäre /js/)'
  )
  assert.match(appSource, /serviceWorker\.register\('\.\/sw\.js'\)/)
  assert.doesNotMatch(appSource, /register\('\.\/js\/sw\.js'\)/)

  const swMessage = swSource.match(/IMAGE_CACHE_FALLBACK_MESSAGE = '([^']+)'/)
  const appMessage = appSource.match(
    /SERVICE_WORKER_IMAGE_FALLBACK_MESSAGE = '([^']+)'/
  )
  assert.ok(swMessage && appMessage)
  assert.strictEqual(appMessage[1], swMessage[1])
}

async function testPrecacheUsesRealShellUrls () {
  const sw = loadServiceWorker()
  await sw.install()

  const cache = await getCurrentCache(sw)
  const keys = Array.from(cache.entries.keys())
  assert.ok(keys.includes(`${APP_ORIGIN}/`))
  assert.ok(keys.includes(`${APP_ORIGIN}/css/layout.css`))
  assert.ok(keys.includes(`${APP_ORIGIN}/js/app.js`))
  assert.ok(!keys.some(key => key.includes('/js/index.html')))
  assert.ok(!keys.includes(`${APP_ORIGIN}/index.html`))
  assert.ok(sw.fetchCalls.every(({ init }) => init?.cache === 'reload'))
}

async function testPrecacheRejectsHtmlFallback () {
  const sw = loadServiceWorker()
  sw.setFetch(async url =>
    url.endsWith('/css/layout.css')
      ? textResponse('<html>', 'text/html; charset=utf-8')
      : appShellResponse(url)
  )
  await assert.rejects(sw.install(), /App-Shell-Ressource ungültig/)
  assert.deepStrictEqual(await sw.caches.keys(), [])
}

async function testPrecacheRejectsRedirectedShell () {
  const sw = loadServiceWorker()
  sw.setFetch(async url => {
    const response = appShellResponse(url)
    if (url === `${APP_ORIGIN}/`) {
      Object.defineProperty(response, 'redirected', { value: true })
    }
    return response
  })
  await assert.rejects(sw.install(), /App-Shell-Ressource ungültig/)
}

async function testActivateRemovesOutdatedCachesButKeepsMaps () {
  const sw = loadServiceWorker()
  await sw.caches.open('dwd-dashboard-release-1.8.1')
  await (await getMapCache(sw)).put(MAP_URL, textResponse('png', 'image/png'))
  await sw.install()
  await sw.activate()

  const keys = await sw.caches.keys()
  assert.strictEqual(keys.length, 2)
  assert.ok(!keys.includes('dwd-dashboard-release-1.8.1'))
  assert.ok((await getMapCache(sw)).entries.has(MAP_URL))
}

async function testMapImagesKeepLatestCopyAndServeOffline () {
  const sw = loadServiceWorker()
  await sw.install()

  sw.setFetch(async () => textResponse('png-1', 'image/png'))
  let response = await sw.dispatchFetch(mapRequest(1)).settled()
  assert.strictEqual(await response.text(), 'png-1')
  assert.strictEqual(sw.fetchCalls.at(-1).input, `${MAP_URL}?t=1`)
  assert.strictEqual(sw.fetchCalls.at(-1).init.mode, 'cors')

  sw.setFetch(async () => textResponse('png-2', 'image/png'))
  await sw.dispatchFetch(mapRequest(2)).settled()

  const cache = await getMapCache(sw)
  const mapKeys = Array.from(cache.entries.keys()).filter(key =>
    key.startsWith(MAP_URL)
  )
  assert.deepStrictEqual(mapKeys, [MAP_URL])
  assert.deepStrictEqual(sw.postedMessages, [])

  sw.setFetch(offlineFetch)
  response = await sw.dispatchFetch(mapRequest(3)).settled()
  assert.strictEqual(await response.text(), 'png-2')
  assert.deepStrictEqual(JSON.parse(JSON.stringify(sw.postedMessages)), [
    { type: 'dwd-image-cache-fallback', url: `${MAP_URL}?t=3` }
  ])
}

async function testMissingMapsAreNotReportedAsLoaded () {
  const sw = loadServiceWorker()
  await sw.install()

  sw.setFetch(async () => textResponse('missing', 'text/html', 404))
  const response = await sw.dispatchFetch(mapRequest(1)).settled()
  assert.strictEqual(response.status, 404)

  sw.setFetch(async () => textResponse('<html>', 'text/html'))
  await sw.dispatchFetch(mapRequest(2)).settled()

  const cache = await getMapCache(sw)
  assert.ok(!cache.entries.has(MAP_URL))

  sw.setFetch(offlineFetch)
  await assert.rejects(sw.dispatchFetch(mapRequest(3)).settled())
  assert.deepStrictEqual(sw.postedMessages, [])
}

async function testDwdTextAndReportRequestsBypassCache () {
  const sw = loadServiceWorker()
  const dataUrls = [
    'https://www.dwd.de/DE/leistungen/seewetternordostsee/seewetternordostsee.html',
    'https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST',
    'https://www.dwd.de/DE/leistungen/seevorhersagenordsee/seevorhersagennordsee.html?nn=16102',
    'https://www.dwd.de/DE/leistungen/seevorhersageostsee/seevorhersagenostsee.html?nn=16102',
    'https://www.dwd.de/DE/leistungen/seevorhersagemmwest/seewettermittelmeerwest.html',
    'https://www.dwd.de/DE/leistungen/seevorhersagemmost/seewettermittelmeerost.html',
    'https://www.dwd.de/DE/leistungen/streckenseewetterbericht/streckenseewetterbericht.html?nn=392762'
  ]

  dataUrls.forEach(url => {
    const { responsePromise } = sw.dispatchFetch({ url, mode: 'cors' })
    assert.strictEqual(responsePromise, null, `${url} muss am SW vorbeigehen`)
  })
}

async function testStaticAndNavigationOfflineFallback () {
  const sw = loadServiceWorker()
  await sw.install()

  sw.setFetch(async () => textResponse('<html>', 'text/html; charset=utf-8'))
  const fallbackResponse = await sw
    .dispatchFetch({ url: `${APP_ORIGIN}/css/missing.css`, mode: 'cors' })
    .settled()
  assert.strictEqual(fallbackResponse.status, 200)
  const cache = await getCurrentCache(sw)
  assert.ok(!cache.entries.has(`${APP_ORIGIN}/css/missing.css`))

  sw.setFetch(offlineFetch)
  const cssResponse = await sw
    .dispatchFetch({ url: `${APP_ORIGIN}/css/layout.css`, mode: 'cors' })
    .settled()
  assert.strictEqual(await cssResponse.text(), 'css')

  const navigationResponse = await sw
    .dispatchFetch({ url: `${APP_ORIGIN}/?page=3`, mode: 'navigate' })
    .settled()
  assert.strictEqual(await navigationResponse.text(), '<html>')
}

async function testAppMarksServiceWorkerCachedImagesOffline () {
  const blockStart = appSource.indexOf('  // The SW may report a cache fallback')
  const blockEnd = appSource.indexOf('  function cacheLoadedImagesThroughServiceWorker')
  assert.ok(blockStart > 0 && blockEnd > blockStart)

  const createImage = src => ({
    src,
    currentSrc: src,
    complete: false,
    naturalWidth: 0,
    classList: { add: () => {} }
  })
  const images = [1, 2, 3].map(cacheBuster => createImage(`${MAP_URL}?t=${cacheBuster}`))
  const states = new Map()
  const context = vm.createContext({
    IMAGE_ELEMENTS: images,
    serviceWorkerCachedImageUrls: new Set(),
    handledImageLoadUrls: new WeakMap(),
    navigator: { onLine: true },
    setLastKnownImageUrl: () => {},
    setCardState: (imageElement, state) => states.set(imageElement, state)
  })
  vm.runInContext(
    `${appSource.slice(blockStart, blockEnd)}
    this.api = { markServiceWorkerCachedImage, handleImageLoaded }`,
    context
  )
  const { markServiceWorkerCachedImage, handleImageLoaded } = context.api
  const [decodedBeforeLoad, loadedFirst, fromNetwork] = images

  // Race: image already decoded, but the load event has not run yet.
  Object.assign(decodedBeforeLoad, { complete: true, naturalWidth: 640 })
  markServiceWorkerCachedImage(decodedBeforeLoad.src)
  handleImageLoaded(decodedBeforeLoad)
  assert.strictEqual(states.get(decodedBeforeLoad), 'offline')

  handleImageLoaded(loadedFirst)
  assert.strictEqual(states.get(loadedFirst), 'ok')
  markServiceWorkerCachedImage(loadedFirst.src)
  assert.strictEqual(states.get(loadedFirst), 'offline')

  handleImageLoaded(fromNetwork)
  assert.strictEqual(states.get(fromNetwork), 'ok')
}

async function main () {
  await testRegistrationScope()
  await testPrecacheUsesRealShellUrls()
  await testPrecacheRejectsHtmlFallback()
  await testPrecacheRejectsRedirectedShell()
  await testActivateRemovesOutdatedCachesButKeepsMaps()
  await testMapImagesKeepLatestCopyAndServeOffline()
  await testMissingMapsAreNotReportedAsLoaded()
  await testDwdTextAndReportRequestsBypassCache()
  await testStaticAndNavigationOfflineFallback()
  await testAppMarksServiceWorkerCachedImagesOffline()
  console.log('US-032 service worker regression checks passed')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
