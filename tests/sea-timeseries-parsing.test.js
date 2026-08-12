const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Minimal DOMParser test double: enough for parseSeaTimeseriesFromHtml, which
// only walks table > tr > (td|th) and reads textContent. Not a general HTML
// parser - assumes the simple, non-nested table layout the DWD source uses.
function extractTagBlocks (html, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi')
  const blocks = []
  let match
  while ((match = regex.exec(html))) {
    blocks.push(match[1])
  }
  return blocks
}

class FakeElement {
  constructor (innerHtml) {
    this.innerHtml = innerHtml
  }

  querySelectorAll (selector) {
    if (selector === 'table') {
      return extractTagBlocks(this.innerHtml, 'table').map(
        html => new FakeElement(html)
      )
    }
    if (selector === 'tr') {
      return extractTagBlocks(this.innerHtml, 'tr').map(
        html => new FakeElement(html)
      )
    }
    if (selector === 'td,th') {
      const cells = [
        ...extractTagBlocks(this.innerHtml, 'td'),
        ...extractTagBlocks(this.innerHtml, 'th')
      ]
      return cells.map(html => new FakeElement(html))
    }
    return []
  }

  get textContent () {
    return this.innerHtml
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
  }
}

class FakeDOMParser {
  parseFromString (html) {
    return new FakeElement(html)
  }
}

// Covers US-020 data ingestion: turning the raw DWD Seewetter-Zeitreihe
// HTML table markup into the { slots, areas } structure the timeseries UI renders.
function loadSeaTimeseriesParsingHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')

  const match = source.match(
    /function normalizeInlineText \([\s\S]*?function parseSeaTimeseriesFromHtml \(rawHtml, regionLabel = 'Ostsee'\) \{[\s\S]*?\n {2}\}/
  )

  if (!match) {
    throw new Error('Could not extract sea-timeseries parsing helpers from app.js')
  }

  const context = vm.createContext({
    String,
    RegExp,
    Array,
    Map,
    DOMParser: FakeDOMParser
  })
  vm.runInContext(match[0], context)

  return {
    normalizeInlineText: context.normalizeInlineText,
    extractSeaTimeseriesAreaHeader: context.extractSeaTimeseriesAreaHeader,
    parseSeaTimeseriesFromHtml: context.parseSeaTimeseriesFromHtml
  }
}

const {
  normalizeInlineText,
  extractSeaTimeseriesAreaHeader,
  parseSeaTimeseriesFromHtml
} = loadSeaTimeseriesParsingHelpers()

// --- normalizeInlineText ---

assert.strictEqual(normalizeInlineText('  a\n\tb   c  '), 'a b c')
assert.strictEqual(normalizeInlineText('a\u00a0b'), 'a b')
assert.strictEqual(normalizeInlineText(null), '')
assert.strictEqual(normalizeInlineText(undefined), '')

// --- extractSeaTimeseriesAreaHeader ---

const header = extractSeaTimeseriesAreaHeader(
  '  Westliche Ostsee   (54°N 12°E)   WT:   18 C  '
)
// vm-context objects aren't reference-equal to main-realm object literals,
// so compare a plain snapshot instead of using deepStrictEqual directly.
assert.deepStrictEqual(JSON.parse(JSON.stringify(header)), {
  areaName: 'Westliche Ostsee',
  position: '54°N 12°E',
  waterTemp: '18 C'
})
assert.strictEqual(
  extractSeaTimeseriesAreaHeader('Kein passendes Format'),
  null
)

// --- parseSeaTimeseriesFromHtml ---

const sampleHtml = `
  <table>
    <tr><td colspan="7">Westliche Ostsee (54°N 12°E) WT: 18 C</td></tr>
    <tr><td>Mo</td><td>06</td><td>SW</td><td>5</td><td>6</td><td>1.5</td><td>RAIN</td></tr>
    <tr><td>Mo</td><td>12</td><td>W</td><td>6</td><td>7</td><td>2.0</td><td>-</td></tr>
  </table>
  <table>
    <tr><td colspan="7">Suedliche Ostsee (55°N 13°E) WT: 17 C</td></tr>
    <tr><td>Mo</td><td>06</td><td>NW</td><td>4</td><td>5</td><td>1.0</td><td>-</td></tr>
  </table>
`

const payload = parseSeaTimeseriesFromHtml(sampleHtml, 'Ostsee')

assert.strictEqual(payload.areas.length, 2, 'Expected two parsed areas')
assert.strictEqual(payload.areas[0].areaName, 'Westliche Ostsee')
assert.strictEqual(payload.areas[0].position, '54°N 12°E')
assert.strictEqual(payload.areas[0].rows.length, 2)
assert.deepStrictEqual(JSON.parse(JSON.stringify(payload.areas[0].rows[0])), {
  slotKey: 'Mo06',
  day: 'Mo',
  hour: '06',
  windDirection: 'SW',
  windBft: '5',
  gustBft: '6',
  waveM: '1.5',
  weather: 'RAIN'
})
assert.strictEqual(payload.areas[1].areaName, 'Suedliche Ostsee')

// Slots are de-duplicated and ordered by first appearance across all areas.
assert.deepStrictEqual(JSON.parse(JSON.stringify(payload.slots)), [
  { key: 'Mo06', label: 'Mo 06' },
  { key: 'Mo12', label: 'Mo 12' }
])

assert.throws(
  () => parseSeaTimeseriesFromHtml('', 'Ostsee'),
  /Leere Ostsee-Zeitreihenquelle/,
  'Expected empty HTML input to throw'
)
assert.throws(
  () => parseSeaTimeseriesFromHtml('<p>Keine Tabelle</p>', 'Nordsee'),
  /Keine Nordsee-Zeitreihen im DWD-Quellformat gefunden/,
  'Expected HTML without a matching table/area to throw with the region label'
)

console.log('Sea-timeseries parsing regression checks passed')
