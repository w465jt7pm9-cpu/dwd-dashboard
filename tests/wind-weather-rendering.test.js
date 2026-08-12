const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Covers US-020 AK3 (Wind/Beaufort-Zelle) and AK5 (Wettersymbole inkl. Warnbadges).
function loadWindWeatherHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')

  const match = source.match(
    /function escapeHtml \([\s\S]*?function renderWeatherValueMarkup \(weatherCode\) \{[\s\S]*?\n {2}\}/
  )

  if (!match) {
    throw new Error('Could not extract wind/weather rendering helpers from app.js')
  }

  const context = vm.createContext({ String, Number, Math })
  vm.runInContext(match[0], context)

  return {
    getWindDirectionSymbol: context.getWindDirectionSymbol,
    renderBftValueMarkup: context.renderBftValueMarkup,
    renderGustBftValueMarkup: context.renderGustBftValueMarkup,
    getWeatherDisplayValue: context.getWeatherDisplayValue,
    renderWeatherValueMarkup: context.renderWeatherValueMarkup
  }
}

const {
  getWindDirectionSymbol,
  renderBftValueMarkup,
  renderGustBftValueMarkup,
  getWeatherDisplayValue,
  renderWeatherValueMarkup
} = loadWindWeatherHelpers()

// Wind direction symbols (backlog US-020: meteorologische Herkunftsrichtung).
const directionCases = [
  ['W', '→'],
  ['NW', '↘'],
  ['N', '↓'],
  ['SW', '↗'],
  ['O', '←'],
  ['S', '↑'],
  ['NE', '↙'],
  ['SE', '↖'],
  ['', '•'],
  ['XX', '•']
]

for (const [input, expected] of directionCases) {
  const actual = getWindDirectionSymbol(input)
  assert.strictEqual(
    actual,
    expected,
    `Expected wind direction "${input}" to render as "${expected}", got "${actual}"`
  )
}

// Beaufort cells: backlog example "↘6, →5, ↓4" plus AK strong-wind (6-7) / storm (8+) thresholds.
assert.strictEqual(renderBftValueMarkup('5'), '<span class="ostsee-ts-value">5</span>')
assert.strictEqual(
  renderBftValueMarkup('6'),
  '<span class="ostsee-ts-value weatherlage-bft weatherlage-bft--strong">6</span>'
)
assert.strictEqual(
  renderBftValueMarkup('7'),
  '<span class="ostsee-ts-value weatherlage-bft weatherlage-bft--strong">7</span>'
)
assert.strictEqual(
  renderBftValueMarkup('8'),
  '<span class="ostsee-ts-value weatherlage-bft weatherlage-bft--storm">8</span>'
)
assert.strictEqual(renderBftValueMarkup(''), '')

// Gust cells get a "B" prefix and use the same thresholds.
assert.strictEqual(renderGustBftValueMarkup('5'), '<span class="ostsee-ts-value">B5</span>')
assert.strictEqual(
  renderGustBftValueMarkup('9'),
  '<span class="ostsee-ts-value weatherlage-bft weatherlage-bft--storm">B9</span>'
)

// Weather symbols/codes (backlog US-020 AK5).
assert.strictEqual(getWeatherDisplayValue('RAIN'), '🌧')
assert.strictEqual(getWeatherDisplayValue('SH'), '🌦')
assert.strictEqual(getWeatherDisplayValue('TS'), '⛈')
assert.strictEqual(getWeatherDisplayValue(''), '·')

// Warning-badge weather codes (backlog US-020 table: TS/FOG/MIST get a red-warning glyph).
assert.strictEqual(
  renderWeatherValueMarkup('TS'),
  '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Gewitterwarnung" aria-label="Gewitterwarnung">⛈⚠</span>'
)
assert.strictEqual(
  renderWeatherValueMarkup('FOG'),
  '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Nebel" aria-label="Nebel">☰⚠</span>'
)
assert.strictEqual(
  renderWeatherValueMarkup('MIST'),
  '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Dunst / Leichter Nebel" aria-label="Dunst / Leichter Nebel">⚌⚠</span>'
)
assert.strictEqual(
  renderWeatherValueMarkup('RAIN'),
  '<span class="ostsee-ts-weather">🌧</span>'
)

console.log('Wind/weather rendering regression checks passed')
