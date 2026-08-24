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
    }

  querySelectorAll (selector) {
    const tagNames = selector === 'td,th' ? ['td', 'th'] : [selector]
    if (!tagNames.every(tagName => /^[a-z]+$/.test(tagName))) {
      return []
    }

    const blocks = tagNames.flatMap(tagName => {
      const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi')
      return Array.from(this.html.matchAll(regex), match => new FakeElement(match[1]))
    })
    return blocks
  }
}

class FakeDOMParser {
  parseFromString (html) {
    return {
      body: new FakeElement(html),
      querySelectorAll: selector => new FakeElement(html).querySelectorAll(selector)
    }
  }
}

function loadParserHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
  const match = source.match(
    /function normalizeInlineText \([\s\S]*?function parseSeaTimeseriesFromHtml \(rawHtml, regionLabel = 'Ostsee'\) \{[\s\S]*?\n {2}\}/
  )
  const wetterlageMatch = source.match(
    /function normalizeWetterlageText \([\s\S]*?function extractRegionalWetterlageSection \(rawHtml\) \{[\s\S]*?\n {2}\}/
  )
  const feedMatch = source.match(
    /async function fetchWetterlageFromFeed \(\) \{[\s\S]*?\n {2}\}/
  )

  if (!match || !wetterlageMatch || !feedMatch) {
    throw new Error('Could not extract DWD parser helpers from app.js')
  }

  const latin1FeedBytes = Buffer.from(
    readFixture('maritime-feed.txt').replace('spaeter', 'später'),
    'latin1'
  )
  const context = vm.createContext({
    String,
    RegExp,
    Array,
    Map,
    DOMParser: FakeDOMParser,
    TextDecoder,
    DWD_MARITIME_FORECAST_URL: 'https://example.test/maritime-feed.txt',
    fetch: async () => ({
      ok: true,
      arrayBuffer: async () => latin1FeedBytes
    })
  })
  vm.runInContext(match[0], context)
  vm.runInContext(wetterlageMatch[0], context)
  vm.runInContext(feedMatch[0], context)

  return {
    parseSeaTimeseriesFromHtml: context.parseSeaTimeseriesFromHtml,
    extractWetterlageSection: context.extractWetterlageSection,
    extractSeewetterberichtSection: context.extractSeewetterberichtSection,
    extractRegionalWetterlageSection: context.extractRegionalWetterlageSection,
    fetchWetterlageFromFeed: context.fetchWetterlageFromFeed
  }
}

function readFixture (name, encoding = 'utf8') {
  return fs.readFileSync(path.join(__dirname, 'fixtures/dwd', name), encoding)
}

const {
  parseSeaTimeseriesFromHtml,
  extractWetterlageSection,
  extractSeewetterberichtSection,
  extractRegionalWetterlageSection,
  fetchWetterlageFromFeed
} = loadParserHelpers()

const feed = extractWetterlageSection(readFixture('maritime-feed.txt'))
assert.ok(feed.includes('Aktuelle Wetterlage'))
assert.ok(feed.includes('Vorhersage bis morgen frueh:'))
assert.ok(feed.includes('Wind: SW 6-7, spaeter 8.'))
assert.ok(!feed.includes('Deutscher Wetterdienst'))
assert.ok(!feed.includes('Copyright DWD'))
assert.ok(!feed.includes('$$'))

const report = extractSeewetterberichtSection(readFixture('seewetterbericht.html'))
assert.ok(report.includes('Ein Tief über der Nordsee bestimmt das Wetter.'))
assert.ok(!report.includes('Ergänzende Informationen'))
assert.ok(!report.includes('Impressum'))

for (const endMarker of [
  'Ergänzende Informationen',
  'Verwandte Leistungen',
  'INHATSVERZEICHNIS'
]) {
  const reportVariant = readFixture('seewetterbericht.html')
    .replace('Ergänzende Informationen', endMarker)
  const extractedReport = extractSeewetterberichtSection(reportVariant)
  assert.ok(extractedReport.includes('Wind: NW 5-6.'))
  assert.ok(!extractedReport.includes(endMarker))
}

for (const [region, expectedText] of [
  ['regional-nordsee.html', 'Nordsee: Ein Tief zieht ostwärts.'],
  ['regional-ostsee.html', 'Ostsee: Schwacher Wind aus Ost.']
]) {
  const section = extractRegionalWetterlageSection(readFixture(region))
  assert.ok(section.includes(expectedText))
  assert.ok(!section.includes('Vorhersagen von'))
  assert.ok(!section.includes('Ergänzende Informationen'))
}

for (const [fixture, regionLabel, expected] of [
  ['timeseries-ostsee.html', 'Ostsee', {
    slots: [{ key: 'Mo06', label: 'Mo 06' }, { key: 'Mo12', label: 'Mo 12' }],
    areas: [{
      areaName: 'Westliche Ostsee',
      position: '54°N 12°E',
      waterTemp: '18 C',
      rows: [
        { slotKey: 'Mo06', day: 'Mo', hour: '06', windDirection: 'SW', windBft: '5', gustBft: '6', waveM: '1.5', weather: 'RAIN' },
        { slotKey: 'Mo12', day: 'Mo', hour: '12', windDirection: 'W', windBft: '6', gustBft: '7', waveM: '2.0', weather: '-' }
      ]
    }]
  }],
  ['timeseries-nordsee.html', 'Nordsee', {
    slots: [{ key: 'Di06', label: 'Di 06' }, { key: 'Di12', label: 'Di 12' }],
    areas: [{
      areaName: 'Deutsche Bucht',
      position: '54°N 7°E',
      waterTemp: '17 C',
      rows: [
        { slotKey: 'Di06', day: 'Di', hour: '06', windDirection: 'NW', windBft: '4', gustBft: '5', waveM: '1.2', weather: 'SH' },
        { slotKey: 'Di12', day: 'Di', hour: '12', windDirection: 'W', windBft: '5', gustBft: '6', waveM: '1.8', weather: 'RAIN' }
      ]
    }, {
      areaName: 'Fischer',
      position: '56°N 3°E',
      waterTemp: '12 C',
      rows: [
        { slotKey: 'Di06', day: 'Di', hour: '06', windDirection: 'SW', windBft: '6', gustBft: '7', waveM: '2.4', weather: 'FOG' },
        { slotKey: 'Di12', day: 'Di', hour: '12', windDirection: 'S', windBft: '7', gustBft: '8', waveM: '2.9', weather: 'TS' }
      ]
    }]
  }]
]) {
  const timeseries = parseSeaTimeseriesFromHtml(readFixture(fixture), regionLabel)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(timeseries.slots)), expected.slots)
  assert.deepStrictEqual(JSON.parse(JSON.stringify(timeseries.areas)), expected.areas)
}

assert.strictEqual(
  extractWetterlageSection(readFixture('maritime-feed.txt').replace('Aktuelle Wetterlage', 'Aktuelle Lage')),
  '',
  'A changed feed heading must not produce a Wetterlage section'
)
assert.strictEqual(
  extractRegionalWetterlageSection(readFixture('regional-nordsee.html').replace('Wetterlage und -entwicklung:', 'Wetterlage:')),
  '',
  'A changed regional heading must not produce a Wetterlage section'
)
assert.throws(
  () => parseSeaTimeseriesFromHtml(
    readFixture('timeseries-ostsee.html').replace('WT:', 'Wassertemperatur:'),
    'Ostsee'
  ),
  /Keine Ostsee-Zeitreihen im DWD-Quellformat gefunden/
)

fetchWetterlageFromFeed().then(result => {
  assert.ok(result.text.includes('Wind: SW 6-7, später 8.'))
  console.log('DWD source-format contract checks passed')
}).catch(error => {
  console.error(error)
  process.exitCode = 1
})
