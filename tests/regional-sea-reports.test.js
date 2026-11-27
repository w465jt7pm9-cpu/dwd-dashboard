const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

class FakeElement {
  constructor (html) {
    this.html = html
  }

  get textContent () {
    return this.html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&ouml;/gi, 'ö')
      .replace(/&auml;/gi, 'ä')
      .replace(/&uuml;/gi, 'ü')
      .replace(/&szlig;/gi, 'ß')
      .replace(/\s+/g, ' ')
      .trim()
  }

  querySelectorAll (selector) {
    const tags = selector.split(',').map(tag => tag.trim())
    if (!tags.every(tag => /^[a-z]+$/i.test(tag))) {
      return []
    }

    return tags.flatMap(tag => {
      const regex = new RegExp(
        `<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`,
        'gi'
      )
      return Array.from(this.html.matchAll(regex), match => new FakeElement(match[1]))
    })
  }
}

class FakeDOMParser {
  parseFromString (html) {
    const body = new FakeElement(html)
    return {
      body,
      querySelectorAll: selector => body.querySelectorAll(selector)
    }
  }
}

const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
const helpersMatch = source.match(
  /function normalizeInlineText \([\s\S]*?function fetchSeaTimeseriesPayload \([\s\S]*?\n {2}\}/
)
assert.ok(helpersMatch, 'Could not extract regional DWD parser helpers')

const context = vm.createContext({
  Array,
  Map,
  NORDATLANTIK_MAP_FORECAST_HOURS: [0, 36, 60, 84],
  HOUR_IN_MS: 60 * 60 * 1000,
  RegExp,
  String,
  DOMParser: FakeDOMParser
})
vm.runInContext(helpersMatch[0], context)

const northSeaFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures/dwd/regional-nordsee-forecast.html'),
  'utf8'
)
const mediterraneanFixture = fs.readFileSync(
  path.join(__dirname, 'fixtures/dwd/regional-mediterranean-forecast.html'),
  'utf8'
)

const regionalConfigs = [
  {
    key: 'nordsee',
    label: 'Nordsee',
    reportTitle: 'Seewettervorhersagen Nordsee',
    source: northSeaFixture
  },
  {
    key: 'ostsee',
    label: 'Ostsee',
    reportTitle: 'Seewettervorhersagen Ostsee',
    source: northSeaFixture
  },
  {
    key: 'mittelmeer-west',
    label: 'Westliches Mittelmeer',
    reportTitle: 'Seewettervorhersagen Mittelmeer Westteil',
    source: mediterraneanFixture
  },
  {
    key: 'mittelmeer-ost',
    label: 'Östliches Mittelmeer',
    reportTitle: 'Seewettervorhersagen Mittelmeer Ostteil',
    source: mediterraneanFixture
  }
]

for (const config of regionalConfigs) {
  const report = context.parseRegionalSeaForecastFromHtml(
    config.source,
    config
  )
  assert.strictEqual(report.reportTitle, config.reportTitle)
  assert.strictEqual(
    report.issuedAt,
    config.key.startsWith('mittelmeer')
      ? '27.11.2026, 09.00 UTC'
      : '27.11.2026, 11.00 UTC'
  )
  assert.strictEqual(report.forecastPeriod, 'Fr, 27.11.2026 00')
  assert.strictEqual(report.forecastStartAt, Date.UTC(2026, 10, 27, 0))
  assert.ok(report.weatherSituation.length > 0)
  assert.strictEqual(report.areas.length, 1)
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(report.areas[0].rows[0])),
    config.key.startsWith('mittelmeer')
      ? {
          slotKey: 'Fr00',
          day: 'Fr',
          hour: '00',
          windDirection: 'NW',
          windBft: '3',
          gustBft: '5',
          waveM: '1',
          weather: 'SH'
        }
      : {
          slotKey: 'Fr00',
          day: 'Fr',
          hour: '00',
          windDirection: 'E-SE',
          windBft: '4-5',
          gustBft: '6',
          waveM: '1',
          weather: 'RAIN'
        }
  )
}

const report = context.parseRegionalSeaForecastFromHtml(
  northSeaFixture,
  regionalConfigs[0]
)
const mapSlotPayload = {
  forecastStartAt: report.forecastStartAt,
  slots: Array.from({ length: 13 }, (_, index) => {
    const forecastAt = new Date(report.forecastStartAt + index * 6 * 60 * 60 * 1000)
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    const day = weekdays[forecastAt.getUTCDay()]
    const hour = String(forecastAt.getUTCHours()).padStart(2, '0')
    return { key: `${day}${hour}` }
  })
}
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(
    context.getSeaReportMapSlotMatches(mapSlotPayload, [0, 24, 48, 72])
  )),
  [
    { horizon: 0, slotIndex: 0 },
    { horizon: 24, slotIndex: 4 },
    { horizon: 48, slotIndex: 8 },
    { horizon: 72, slotIndex: 12 }
  ]
)

assert.throws(
  () => context.parseRegionalSeaForecastFromHtml(
    northSeaFixture.replace('Vorhersagen von', 'Vorhersage ab'),
    regionalConfigs[0]
  ),
  /hat ein unbekanntes Format/
)
assert.throws(
  () => context.parseRegionalSeaForecastFromHtml(
    northSeaFixture.replace('Wetterlage und -entwicklung:', 'Wetter:'),
    regionalConfigs[0]
  ),
  /Wetterlage für Nordsee nicht gefunden/
)

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
for (const [pageIndex, region, paths] of [
  [7, 'nordsee', ['nordsa_00.png', 'nordsa_24.png', 'nordsa_48.png', 'nordsa_72.png']],
  [8, 'ostsee', ['ostsa_00.png', 'ostsa_24.png', 'ostsa_48.png', 'ostsa_72.png']],
  [9, 'mittelmeer-west', ['wmitme_00.png', 'wmitme_24.png', 'wmitme_48.png', 'wmitme_72.png']],
  [10, 'mittelmeer-ost', ['omitme_00.png', 'omitme_24.png', 'omitme_48.png', 'omitme_72.png']]
]) {
  const pageStart = html.indexOf(
    `<section\n            class="page"\n            data-page="${pageIndex}"`
  )
  const nextPageStart = html.indexOf(
    '<section\n            class="page"',
    pageStart + 1
  )
  assert.ok(pageStart >= 0, `Missing integrated ${region} page`)
  const page = html.slice(
    pageStart,
    nextPageStart < 0 ? html.length : nextPageStart
  )
  assert.deepStrictEqual(
    Array.from(page.matchAll(/data-path="([^"]+)"/g), ([, imagePath]) => imagePath),
    paths
  )
  assert.ok(
    page.includes(`id="regionalSeaReport-${region}"`),
    `Missing ${region} report panel`
  )
}

const interactionStart = source.indexOf(
  '  function isRegionalSeaReportInteraction ('
)
const interactionEnd = source.indexOf(
  '\n\n  function isSeaReportInteraction',
  interactionStart
)
assert.ok(interactionStart >= 0 && interactionEnd > interactionStart)
const interactionContext = vm.createContext({
  currentPageIndex: 7,
  getRegionalSeaReportConfigForPageIndex: pageIndex =>
    pageIndex === 7 ? regionalConfigs[0] : null
})
vm.runInContext(
  source.slice(interactionStart, interactionEnd),
  interactionContext
)
assert.strictEqual(
  interactionContext.isRegionalSeaReportInteraction({
    closest: selector =>
      selector ===
        '.sea-region-report__situation, .sea-region-report__timeseries .ostsee-ts-wrap'
        ? {}
        : null
  }),
  true
)
assert.strictEqual(
  interactionContext.isRegionalSeaReportInteraction({
    closest: () => null
  }),
  false
)
interactionContext.currentPageIndex = 6
assert.strictEqual(
  interactionContext.isRegionalSeaReportInteraction({
    closest: () => ({})
  }),
  false
)

function extractPrefetchFunction (name) {
  const match = source.match(
    new RegExp(`  (?:async )?function ${name} \\([\\s\\S]*?\\n  \\}`)
  )
  assert.ok(match, `Missing ${name}`)
  return match[0]
}

const prefetchFunctions = [
  'getLastRegionalSeaMapPrefetchWindow',
  'setLastRegionalSeaMapPrefetchWindow',
  'preloadRegionalSeaMapsInBackground',
  'preloadRegionalSeaDataInBackground'
]
  .map(extractPrefetchFunction)
  .join('\n')

function createRegionalPrefetchHarness ({
  activeWindow = '2026-11-27-07',
  online = true,
  failingPaths = new Set()
} = {}) {
  const configs = regionalConfigs.map((config, index) => ({
    ...config,
    pageIndex: index + 7,
    mapForecastHours: [0, 24, 48, 72]
  }))
  const imagesByPage = new Map(
    configs.map(config => [
      config.pageIndex,
      config.mapForecastHours.map(hour => ({
        dataset: {
          base: 'WX_SEE',
          path: `${config.key}-${hour}.png`
        }
      }))
    ])
  )
  const storage = new Map()
  const reportCalls = []
  const mapCalls = []
  const warnings = []
  const context = vm.createContext({
    URL,
    IMAGE_BASE_URLS: {
      WX_SEE: 'https://www.dwd.de/DWD/wetter/wv_spez/seewetter'
    },
    REGIONAL_SEA_MAP_PREFETCH_WINDOW_KEY:
      'dwdRegionalSeaMapPrefetchWindow',
    REGIONAL_SEA_REPORT_CONFIGS: configs,
    regionalSeaMapPrefetchRequest: null,
    lastRegionalSeaMapPrefetchWindow: null,
    navigator: { onLine: online },
    localStorage: {
      getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value)
    },
    getActiveSeegangRefreshWindowId: () => activeWindow,
    getPageImages: pageIndex => imagesByPage.get(pageIndex) || [],
    ensureRegionalSeaReportContent: async (config, force) => {
      reportCalls.push({ key: config.key, force })
    },
    fetch: async (url, options) => {
      mapCalls.push({ url, options })
      if (failingPaths.has(url)) {
        throw new Error(`Network failure for ${url}`)
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'image/png' },
        blob: async () => ({})
      }
    },
    console: {
      warn: (...args) =>
        warnings.push(args.map(value => value?.message || value))
    }
  })
  vm.runInContext(prefetchFunctions, context)
  return { context, mapCalls, reportCalls, storage, warnings }
}

async function testRegionalDataPrefetchPolicy () {
  const harness = createRegionalPrefetchHarness()
  await harness.context.preloadRegionalSeaDataInBackground(true)

  assert.deepStrictEqual(
    harness.reportCalls.map(({ key, force }) => [key, force]),
    regionalConfigs.map(({ key }) => [key, true]),
    JSON.stringify(harness.warnings)
  )
  assert.strictEqual(
    harness.mapCalls.length,
    16,
    JSON.stringify(harness.warnings)
  )
  assert.ok(
    harness.mapCalls.every(
      ({ url, options }) =>
        !url.includes('?') &&
        options.cache === 'no-cache' &&
        options.credentials === 'omit' &&
        options.mode === 'cors'
    )
  )
  assert.strictEqual(
    harness.storage.get('dwdRegionalSeaMapPrefetchWindow'),
    '2026-11-27-07'
  )

  await harness.context.preloadRegionalSeaMapsInBackground()
  assert.strictEqual(harness.mapCalls.length, 16)

  const outsideWindow = createRegionalPrefetchHarness({ activeWindow: null })
  await outsideWindow.context.preloadRegionalSeaDataInBackground()
  assert.strictEqual(outsideWindow.reportCalls.length, 4)
  assert.strictEqual(outsideWindow.mapCalls.length, 0)

  const offline = createRegionalPrefetchHarness({ online: false })
  await offline.context.preloadRegionalSeaDataInBackground(true)
  assert.strictEqual(offline.reportCalls.length, 0)
  assert.strictEqual(offline.mapCalls.length, 0)

  const failingPath =
    'https://www.dwd.de/DWD/wetter/wv_spez/seewetter/nordsee-0.png'
  const partialFailure = createRegionalPrefetchHarness({
    failingPaths: new Set([failingPath])
  })
  await partialFailure.context.preloadRegionalSeaMapsInBackground()
  assert.strictEqual(partialFailure.mapCalls.length, 16)
  assert.strictEqual(
    partialFailure.storage.has('dwdRegionalSeaMapPrefetchWindow'),
    false
  )
  assert.strictEqual(partialFailure.warnings.length, 1)
}

function testRegionalPrefetchTriggers () {
  const pullRefreshStart = source.indexOf('  function finishPullRefresh (')
  const pullRefreshEnd = source.indexOf(
    '\n\n  IMAGE_ELEMENTS.forEach',
    pullRefreshStart
  )
  assert.ok(pullRefreshStart >= 0 && pullRefreshEnd > pullRefreshStart)
  assert.ok(
    source
      .slice(pullRefreshStart, pullRefreshEnd)
      .includes('void preloadRegionalSeaDataInBackground(true)')
  )

  const onlineStart = source.indexOf("window.addEventListener('online'")
  const offlineStart = source.indexOf(
    "\n\n  window.addEventListener('offline'",
    onlineStart
  )
  assert.ok(onlineStart >= 0 && offlineStart > onlineStart)
  assert.ok(
    source
      .slice(onlineStart, offlineStart)
      .includes('void preloadRegionalSeaDataInBackground(true)')
  )
  assert.match(
    source,
    /goToPage\(0\)\s+void preloadRegionalSeaDataInBackground\(true\)/
  )
  assert.strictEqual(
    (source.match(/void preloadRegionalSeaDataInBackground\(true\)/g) || [])
      .length,
    3
  )
}

Promise.resolve()
  .then(testRegionalDataPrefetchPolicy)
  .then(testRegionalPrefetchTriggers)
  .then(() =>
    console.log(
      'Regional sea report parsing, page contracts and background prefetch passed'
    )
  )
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
