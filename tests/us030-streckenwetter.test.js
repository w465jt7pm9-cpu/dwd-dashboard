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
  { separateGustRow: true, currentSlotIndex: 0 }
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
  /<tr class="ostsee-ts-area"><th scope="row" class="ostsee-ts-area__label">Testgebiet<span class="ostsee-ts-meta">48\.00N 10\.00W · WT 16 C<\/span><\/th><td(?: class="nordatlantik-current-slot")?><\/td><\/tr>/
)
assert.doesNotMatch(northAtlanticTimeseries, /colspan=/)
assert.match(northAtlanticTimeseries, /aria-current="time"/)
assert.match(northAtlanticTimeseries, /class="nordatlantik-now-marker">Jetzt<\/span>/)
assert.match(
  northAtlanticTimeseries,
  /<td class="nordatlantik-current-slot">/
)
assert.doesNotMatch(
  northAtlanticTimeseries.match(/<td class="nordatlantik-current-slot"[^>]*>/)?.[0] || '',
  /aria-current/
)

const existingTimeseries = rendererContext.buildSeaTimeseriesOverlayMarkup(
  highWindPayload
)
assert.doesNotMatch(existingTimeseries, /ostsee-ts-gust-row/)
assert.match(existingTimeseries, /<gust>B11-12<\/gust>/)
assert.match(existingTimeseries, /<tr class="ostsee-ts-area"><th colspan="2">Testgebiet/)

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
    northAtlanticPage[1].matchAll(/<figcaption class="nordatlantik-card__label">([^<]+)<\/figcaption>/g),
    ([, label]) => label
  ),
  ['+00h', '+36h', '+60h', '+84h']
)
assert.match(northAtlanticPage[1], /id="nordatlantikReport"/)

const css = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8')
assert.match(
  css,
  /\.nordatlantik-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/
)
assert.match(css, /\.nordatlantik-grid\s*\{[^}]*gap:\s*0;[^}]*padding:\s*0;/)
assert.match(css, /\.nordatlantik-grid\s+\.card\s*\{[^}]*border-radius:\s*0;/)
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
