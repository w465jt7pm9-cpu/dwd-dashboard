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
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&auml;/gi, 'ä')
      .replace(/&ouml;/gi, 'ö')
      .replace(/&uuml;/gi, 'ü')
      .replace(/&szlig;/gi, 'ß')
  }

  querySelectorAll (selector) {
    const tagNames = selector.split(',').map(tagName => tagName.trim())
    if (!tagNames.every(tagName => /^[a-z]+$/i.test(tagName))) {
      return []
    }

    return tagNames.flatMap(tagName => {
      const regex = new RegExp(
        `<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`,
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
assert.ok(helpersMatch, 'Could not extract DWD report parser helpers from app.js')

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

const fixture = fs.readFileSync(
  path.join(__dirname, 'fixtures/dwd/streckenwetterbericht.html'),
  'utf8'
)
const report = context.parseStreckenwetterberichtFromHtml(fixture)

assert.strictEqual(
  report.reportTitle,
  'Wettervorhersagen für die Strecke Engl. Kanal - Kanarische Inseln, herausgegeben vom Deutschen Wetterdienst, Seewetterdienst Hamburg'
)
assert.strictEqual(report.issuedAt, '07.11.2026, 09.00 UTC')
assert.strictEqual(
  report.weatherSituation,
  'Ein Hoch nördlich der Azoren wandert ostwärts. Ein Tief zieht zur Biskaya.'
)
assert.strictEqual(report.forecastPeriod, 'Sa, 07.11.2026 00')
assert.strictEqual(report.forecastStartAt, Date.UTC(2026, 10, 7, 0))
assert.deepStrictEqual(JSON.parse(JSON.stringify(report.slots)), [
  { key: 'Sa00', label: 'Sa 00' },
  { key: 'Sa06', label: 'Sa 06' }
])
assert.deepStrictEqual(JSON.parse(JSON.stringify(report.areas)), [{
  areaName: 'Westlich Engl. Kanal',
  position: '48.00N 10.00W',
  waterTemp: '16 C',
  rows: [
    {
      slotKey: 'Sa00',
      day: 'Sa',
      hour: '00',
      windDirection: 'W-SW',
      windBft: '5-6',
      gustBft: '7',
      waveM: '2.0',
      weather: 'SH'
    },
    {
      slotKey: 'Sa06',
      day: 'Sa',
      hour: '06',
      windDirection: 'SW',
      windBft: '6',
      gustBft: '8',
      waveM: '2.5',
      weather: 'RAIN'
    }
  ]
}], 'DWD route, time, wind, gust, wave, and weather fields must be retained')

const currentSlotPayload = {
  forecastStartAt: report.forecastStartAt,
  forecastPeriod: report.forecastPeriod,
  slots: report.slots
}
assert.strictEqual(
  context.getCurrentStreckenwetterSlotIndex(
    currentSlotPayload,
    Date.UTC(2026, 10, 7, 5, 59)
  ),
  0,
  'The last forecast time already reached remains active until the next slot'
)
assert.strictEqual(
  context.getCurrentStreckenwetterSlotIndex(
    currentSlotPayload,
    Date.UTC(2026, 10, 7, 6)
  ),
  1,
  'The active forecast column advances at its UTC forecast time'
)
assert.strictEqual(
  context.getCurrentStreckenwetterSlotIndex(
    { forecastPeriod: report.forecastPeriod, slots: report.slots },
    Date.UTC(2026, 10, 7, 6)
  ),
  1,
  'Previously cached reports without a stored timestamp still support the marker'
)
assert.strictEqual(
  context.getCurrentStreckenwetterSlotIndex(
    {
      forecastStartAt: report.forecastStartAt,
      slots: [
        { key: 'Sa18', label: 'Sa 18' },
        { key: 'So00', label: 'So 00' },
        { key: 'So06', label: 'So 06' }
      ]
    },
    Date.UTC(2026, 10, 8, 2)
  ),
  1,
  'The active column advances correctly across UTC midnight'
)
assert.strictEqual(
  context.getCurrentStreckenwetterSlotIndex(
    currentSlotPayload,
    Date.UTC(2026, 10, 6, 23, 59)
  ),
  -1,
  'No forecast column is marked before the report forecast begins'
)

const mapSlotPayload = {
  forecastStartAt: Date.UTC(2026, 10, 7, 0),
  slots: [
    'Sa00', 'Sa06', 'Sa12', 'Sa18',
    'So00', 'So06', 'So12', 'So18',
    'Mo00', 'Mo06', 'Mo12', 'Mo18',
    'Di00', 'Di06', 'Di12'
  ].map(key => ({ key }))
}
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(
    context.getNordatlantikMapSlotMatches(mapSlotPayload)
  )),
  [
    { horizon: 0, slotIndex: 0 },
    { horizon: 36, slotIndex: 6 },
    { horizon: 60, slotIndex: 10 },
    { horizon: 84, slotIndex: 14 }
  ],
  'Nominal map horizons must align with report slots from the report start'
)
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(
    context.getNordatlantikMapSlotMatches(currentSlotPayload)
  )),
  [{ horizon: 0, slotIndex: 0 }],
  'A nominal map horizon without a corresponding report slot must not be assigned'
)

const updateCurrentColumnStart = source.indexOf(
  '  function updateNordatlantikCurrentTimeColumn () {'
)
const updateCurrentColumnEnd = source.indexOf(
  '\n\n  function ensureNordatlantikReportContent',
  updateCurrentColumnStart
)
assert.ok(updateCurrentColumnStart >= 0 && updateCurrentColumnEnd > updateCurrentColumnStart)

const createTestCell = () => {
  const classes = new Set()
  const attributes = new Map()
  return {
    classList: {
      toggle (className, enabled) {
        if (enabled) {
          classes.add(className)
        } else {
          classes.delete(className)
        }
      },
      contains: className => classes.has(className)
    },
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    getAttribute: name => attributes.get(name)
  }
}
const headerCells = Array.from({ length: 4 }, createTestCell)
const forecastCells = Array.from({ length: 3 }, createTestCell)
const reportTable = {
  querySelectorAll (selector) {
    if (selector === 'thead tr:first-child th[scope="col"]') {
      return headerCells
    }
    if (selector === 'tbody tr') {
      return [{
        classList: { contains: () => false },
        querySelectorAll: () => forecastCells
      }]
    }
    return []
  }
}
const currentColumnContext = vm.createContext({
  Array,
  nordatlantikReportElement: {
    querySelector: () => reportTable
  },
  nordatlantikReportPayload: currentSlotPayload,
  getCurrentStreckenwetterSlotIndex: () => 1
})
vm.runInContext(
  source.slice(updateCurrentColumnStart, updateCurrentColumnEnd),
  currentColumnContext
)
currentColumnContext.updateNordatlantikCurrentTimeColumn()
assert.deepStrictEqual(
  headerCells.map(cell => cell.classList.contains('nordatlantik-current-slot')),
  [false, false, true, false],
  'The timer must skip the empty corner header and highlight the matching forecast column'
)
assert.strictEqual(
  headerCells[2].getAttribute('aria-current'),
  'time',
  'The timer must keep aria-current on the active forecast header'
)
assert.deepStrictEqual(
  forecastCells.map(cell => cell.classList.contains('nordatlantik-current-slot')),
  [false, true, false],
  'The active body column must stay aligned with the forecast headers'
)

assert.throws(
  () => context.parseStreckenwetterberichtFromHtml(
    fixture.replace('Vorhersagen von Sa, 07.11.2026 00 UTC', 'Vorhersage ab Sa')
  ),
  /DWD-Vorhersagezeitraum hat ein unbekanntes Format/
)
assert.throws(
  () => context.parseStreckenwetterberichtFromHtml(
    fixture.replace('<b>Wetterlage:</b>', '<b>Wetter:</b>')
  ),
  /DWD-Abschnitt „Wetterlage“ nicht gefunden/
)
assert.throws(
  () => context.parseStreckenwetterberichtFromHtml(
    fixture.replace(
      'Vorhersagen von Sa, 07.11.2026 00 UTC',
      'Vorhersagen von So, 07.11.2026 00 UTC'
    )
  ),
  /Vorhersagebeginn hat ein unbekanntes oder ungültiges Format/
)

const rendererStart = source.indexOf(
  '  function buildSeaTimeseriesOverlayMarkup ('
)
const rendererEnd = source.indexOf(
  '\n  function getCachedNordatlantikReport ()',
  rendererStart
)
assert.ok(rendererStart >= 0 && rendererEnd > rendererStart)
const rendererContext = vm.createContext({
  Array,
  Map,
  String,
  escapeHtml: value => String(value).replace(/[&<>"']/g, ''),
  getWindDirectionSymbol: () => '→',
  renderBftValueMarkup: value => `<wind>${value}</wind>`,
  renderGustBftValueMarkup: value => value ? `<gust>B${value}</gust>` : '',
  renderWeatherValueMarkup: () => '·',
  formatTimestamp: () => 'test',
  getCachedWetterlageText: () => '',
  buildWetterlageOverlayMarkup: () => ''
})
vm.runInContext(source.slice(rendererStart, rendererEnd), rendererContext)

const highWindPayload = {
  slots: [{ key: 'Sa00', label: 'Sa 00' }],
  areas: [{
    areaName: 'Testgebiet',
    position: '48.00N 10.00W',
    waterTemp: '16 C',
    rows: [{
      slotKey: 'Sa00',
      windDirection: 'W',
      windBft: '8-9',
      gustBft: '11-12',
      waveM: '4.0',
      weather: 'RAIN'
    }]
  }]
}
const northAtlanticTimeseries = rendererContext.buildSeaTimeseriesOverlayMarkup(
  highWindPayload,
  {
    separateGustRow: true,
    currentSlotIndex: 0,
    mapSlotMatches: [{ horizon: 0, slotIndex: 0 }]
  }
)
const windRow = northAtlanticTimeseries.match(
  /<tr class="ostsee-ts-wind-row">([\s\S]*?)<\/tr>/
)
const gustRow = northAtlanticTimeseries.match(
  /<tr class="ostsee-ts-gust-row">([\s\S]*?)<\/tr>/
)
assert.ok(windRow && gustRow, 'Wind and gusts need separate labeled rows')
assert.match(windRow[1], /Wind \(Bft\)/)
assert.match(windRow[1], /<wind>8-9<\/wind>/)
assert.doesNotMatch(windRow[1], /11-12/)
assert.match(gustRow[1], /Böen \(Bft\)/)
assert.match(gustRow[1], /<gust>B11-12<\/gust>/)
assert.match(
  northAtlanticTimeseries,
  /<tr class="ostsee-ts-area"><th scope="row" class="ostsee-ts-area__label">Testgebiet<span class="ostsee-ts-meta">48\.00N 10\.00W · WT 16 C<\/span><\/th><td class="nordatlantik-current-slot nordatlantik-map-aligned-slot" data-map-horizon="0"><\/td><\/tr>/
)
assert.doesNotMatch(northAtlanticTimeseries, /colspan=/)
assert.match(northAtlanticTimeseries, /aria-current="time"/)
assert.match(northAtlanticTimeseries, /class="nordatlantik-now-marker">Jetzt<\/span>/)
assert.match(
  northAtlanticTimeseries,
  /<span class="nordatlantik-map-horizon" data-horizon="0" title="Nominaler Kartenhorizont; die Kartenfußzeile nennt die Gültigkeitszeit">\+00h<\/span>/
)
assert.match(
  northAtlanticTimeseries,
  /<th scope="col" class="nordatlantik-current-slot nordatlantik-map-aligned-slot" data-map-horizon="0" aria-current="time">/
)
assert.match(
  northAtlanticTimeseries,
  /<td class="nordatlantik-current-slot nordatlantik-map-aligned-slot" data-map-horizon="0">/
)
assert.doesNotMatch(
  northAtlanticTimeseries.match(/<td class="nordatlantik-current-slot nordatlantik-map-aligned-slot"[^>]*>/)?.[0] || '',
  /aria-current/
)

const existingTimeseries = rendererContext.buildSeaTimeseriesOverlayMarkup(
  highWindPayload
)
assert.doesNotMatch(existingTimeseries, /ostsee-ts-gust-row/)
assert.match(existingTimeseries, /<gust>B11-12<\/gust>/)
assert.match(existingTimeseries, /<tr class="ostsee-ts-area"><th colspan="2">Testgebiet/)
assert.doesNotMatch(existingTimeseries, /nordatlantik-map-horizon/)
assert.doesNotMatch(existingTimeseries, /nordatlantik-map-aligned-slot/)

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
const pageMatches = Array.from(
  html.matchAll(/<section class="page" data-page="(\d+)" aria-label="([^"]+)">/g),
  ([, index, label]) => ({ index: Number(index), label })
)
assert.deepStrictEqual(pageMatches.slice(2, 5), [
  { index: 2, label: 'Höhenwetter' },
  { index: 3, label: 'Seegang Nordatlantik' },
  { index: 4, label: 'Seegang Nordsee' }
])

const northAtlanticPage = html.match(
  /<section class="page" data-page="3" aria-label="Seegang Nordatlantik">([\s\S]*?)<section class="page" data-page="4"/
)
assert.ok(northAtlanticPage, 'Nordatlantik page or report container is missing')
assert.deepStrictEqual(
  Array.from(northAtlanticPage[1].matchAll(/data-path="(na_\d+\.png)"/g), ([, map]) => map),
  ['na_00.png', 'na_36.png', 'na_60.png', 'na_84.png']
)
assert.deepStrictEqual(
  Array.from(
    northAtlanticPage[1].matchAll(
      /<figcaption\s+class="nordatlantik-card__label"\s+data-horizon="(\d+)"\s*>\s*\+(\d+)h\s*<\/figcaption>/g
    ),
    ([, horizon, label]) => ({ horizon: Number(horizon), label: `+${label}h` })
  ),
  [
    { horizon: 0, label: '+00h' },
    { horizon: 36, label: '+36h' },
    { horizon: 60, label: '+60h' },
    { horizon: 84, label: '+84h' }
  ]
)
assert.match(northAtlanticPage[1], /id="nordatlantikReport"/)

const css = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8')
const componentsCss = fs.readFileSync(
  path.join(__dirname, '../css/components.css'),
  'utf8'
)
assert.match(
  css,
  /\.nordatlantik-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/
)
assert.match(css, /\.nordatlantik-grid\s*\{[^}]*gap:\s*0;[^}]*padding:\s*0;/)
assert.match(css, /\.nordatlantik-grid\s+\.card\s*\{[^}]*border-radius:\s*0;/)
assert.match(css, /\.nordatlantik-grid\s+\.card\s+img\s*\{[^}]*object-fit:\s*cover;/)
assert.match(css, /\.nordatlantik-map-horizon\s*\{[^}]*display:\s*inline-block/)
assert.match(css, /\.nordatlantik-map-alignment-note\s*\{[^}]*font-size:/)
assert.match(css, /\.nordatlantik-map-aligned-slot\s*\{[^}]*background-color:\s*rgba\(var\(--nordatlantik-map-accent\),\s*0\.08\);[^}]*box-shadow:/)
assert.match(
  css,
  /\.nordatlantik-current-slot\.nordatlantik-map-aligned-slot\s*\{[^}]*box-shadow:\s*inset 2px 0 rgba\(var\(--nordatlantik-map-accent\),\s*0\.9\)/
)
for (const horizon of [0, 36, 60, 84]) {
  assert.match(
    css,
    new RegExp(
      `\\.nordatlantik-card__label\\[data-horizon='${horizon}'\\][\\s\\S]*?\\.nordatlantik-map-horizon\\[data-horizon='${horizon}'\\]`
    )
  )
}
assert.match(
  css,
  /\.nordatlantik-page\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\);[^}]*overflow:\s*hidden;/
)
assert.match(css, /\.nordatlantik-page\s*\{[^}]*touch-action:\s*auto;/)
assert.match(css, /\.viewport\s*\{[^}]*touch-action:\s*auto;/)
assert.match(
  css,
  /\.nordatlantik-report\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto\s+auto\s+minmax\(0,\s*1fr\);[^}]*min-height:\s*0;/
)
assert.match(
  css,
  /\.nordatlantik-report__timeseries\s+\.ostsee-ts-wrap\s*\{[^}]*height:\s*100%;[^}]*overflow:\s*auto;/
)
assert.match(
  css,
  /@media\s*\(max-height:\s*600px\)\s*and\s*\(orientation:\s*landscape\)\s*\{[\s\S]*?\.nordatlantik-report__situation\s*\{[^}]*font-size:\s*0\.75rem;/
)
assert.match(
  componentsCss,
  /\.ostsee-ts-table\s+thead\s*\{\s*position:\s*sticky;\s*top:\s*0;/
)
const timeseriesInteractionStart = source.indexOf(
  '  function isNordatlantikTimeseriesInteraction ('
)
const timeseriesInteractionEnd = source.indexOf(
  '\n\n  function startPullRefresh',
  timeseriesInteractionStart
)
assert.ok(
  timeseriesInteractionStart >= 0 &&
    timeseriesInteractionEnd > timeseriesInteractionStart
)
const interactionContext = vm.createContext({
  currentPageIndex: 3,
  NORDATLANTIK_PAGE_INDEX: 3
})
vm.runInContext(
  source.slice(timeseriesInteractionStart, timeseriesInteractionEnd),
  interactionContext
)
assert.strictEqual(
  interactionContext.isNordatlantikTimeseriesInteraction({
    closest: selector => selector === '.nordatlantik-report__timeseries .ostsee-ts-wrap'
  }),
  true,
  'Touch and edge navigation gestures must not intercept table scrolling'
)
interactionContext.currentPageIndex = 2
assert.strictEqual(
  interactionContext.isNordatlantikTimeseriesInteraction({
    closest: () => true
  }),
  false,
  'Table gesture exclusions must be limited to the North Atlantic page'
)
assert.ok(
  (source.match(/isNordatlantikTimeseriesInteraction\(event\.target\)/g) || [])
    .length >= 4,
  'Touch, pointer, and click navigation handlers must ignore table interactions'
)
assert.match(
  css,
  /@media\s*\(max-width:\s*767px\)\s*and\s*\(orientation:\s*portrait\)\s*\{\s*\.page\[data-page='3'\]\s+\.nordatlantik-grid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/
)
assert.match(css, /\.page\[data-page='3'\]\s*\{\s*min-width:\s*0/)
assert.match(
  css,
  /\.nordatlantik-report__timeseries\s+\.ostsee-ts-table\s*\{\s*min-width:\s*1320px/
)
assert.match(css, /\.ostsee-ts-area__label\s*\{\s*background:/)
assert.match(
  css,
  /\.nordatlantik-report__timeseries\s+\.ostsee-ts-table\s+tbody\s+th\[scope='row'\]\s*\{\s*position:\s*sticky;\s*left:\s*0/
)
assert.match(
  css,
  /\.nordatlantik-report__timeseries\s+\.ostsee-ts-table\s+\.ostsee-ts-area__label\s+\.ostsee-ts-meta\s*\{\s*display:\s*block/
)
assert.match(css, /\.nordatlantik-report__scroll-hint\s*\{\s*display:\s*none/)
assert.match(source, /nordatlantik-report__scroll-hint/)
assert.match(css, /\.nordatlantik-current-slot\s*\{/)
assert.match(css, /\.nordatlantik-current-slot\s+\.nordatlantik-now-marker\s*\{\s*display:\s*block/)
assert.match(source, /NORDATLANTIK_CURRENT_SLOT_UPDATE_INTERVAL_MS = 60 \* 1000/)

console.log('US-030 Streckenwetter parser and page regression checks passed')
