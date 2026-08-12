const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Covers US-018 (Seewetter-Overlay: Struktur-Hervorhebung) and its key rule that
// Beaufort-highlighting must only apply to wind lines, never to wave heights in meters.
function loadSeewetterHighlightingHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')

  const escapeMatch = source.match(
    /function escapeHtml \([\s\S]*?function escapeRegExp \(value\) \{[\s\S]*?\n {2}\}/
  )
  const highlightMatch = source.match(
    /const WETTERLAGE_WEEKDAY_REGEX =[\s\S]*?function highlightBeaufortInWindLine \(lineText\) \{[\s\S]*?\n {2}\}/
  )
  const overlayMatch = source.match(
    /function buildWetterlageOverlayMarkup \(message\) \{[\s\S]*?\n {2}\}/
  )
  const normalizeMatch = source.match(
    /function normalizeWetterlageText \(text\) \{[\s\S]*?\n {2}\}/
  )

  if (!escapeMatch || !highlightMatch || !overlayMatch || !normalizeMatch) {
    throw new Error('Could not extract Seewetter highlighting helpers from app.js')
  }

  const context = vm.createContext({ String, RegExp })
  vm.runInContext(escapeMatch[0], context)
  vm.runInContext(highlightMatch[0], context)
  vm.runInContext(normalizeMatch[0], context)
  vm.runInContext(overlayMatch[0], context)

  return {
    highlightSeewetterKeywords: context.highlightSeewetterKeywords,
    highlightBeaufortInWindLine: context.highlightBeaufortInWindLine,
    buildWetterlageOverlayMarkup: context.buildWetterlageOverlayMarkup
  }
}

const {
  highlightSeewetterKeywords,
  highlightBeaufortInWindLine,
  buildWetterlageOverlayMarkup
} = loadSeewetterHighlightingHelpers()

// Weekdays and sea areas get highlighted anywhere in the text (US-018 AK "Struktur").
assert.strictEqual(
  highlightSeewetterKeywords('Am Montag Wind aus Deutsche Bucht'),
  'Am <span class="weatherlage-weekday">Montag</span> Wind aus <span class="weatherlage-sea-area">Deutsche Bucht</span>'
)

// 6-7 is Starkwind, 8+ is Sturmwarnung (US-018 AK).
assert.strictEqual(
  highlightBeaufortInWindLine('Wind: SW 6-7, spaeter 8'),
  'Wind: SW <span class="weatherlage-bft weatherlage-bft--strong">6</span>-<span class="weatherlage-bft weatherlage-bft--strong">7</span>, spaeter <span class="weatherlage-bft weatherlage-bft--storm">8</span>'
)
assert.strictEqual(
  highlightBeaufortInWindLine('Wind: W 4'),
  'Wind: W 4'
)

// End-to-end: Beaufort-highlighting must NOT trigger on wave-height lines in meters,
// only on lines starting with "Wind:" (US-018 AK: "Hervorhebung greift nur bei Windangaben").
const sampleReport = [
  'Aktuelle Wetterlage',
  'Ein Tief bestimmt das Wetter am Montag ueber der Deutsche Bucht.',
  '',
  'Vorhersage',
  'Wind: SW 6-7, spaeter 8',
  'Seegang: Wellenhoehe 6 bis 8 Meter',
  'Stand: 12.08.2026 06 UTC'
].join('\n')

const overlayMarkup = buildWetterlageOverlayMarkup(sampleReport)

assert.ok(
  overlayMarkup.startsWith('<span class="weatherlage-stand">Stand: 12.08.2026 06 UTC</span>'),
  'Expected the "Stand:" timestamp to be extracted to the top of the overlay'
)
assert.ok(
  overlayMarkup.includes(
    '<span class="weatherlage-wind-line">Wind: SW <span class="weatherlage-bft weatherlage-bft--strong">6</span>-<span class="weatherlage-bft weatherlage-bft--strong">7</span>, spaeter <span class="weatherlage-bft weatherlage-bft--storm">8</span></span>'
  ),
  'Expected the wind line to be Beaufort-highlighted'
)
assert.ok(
  overlayMarkup.includes('Seegang: Wellenhoehe 6 bis 8 Meter'),
  'Expected the wave-height line to remain unhighlighted plain text'
)
assert.ok(
  !overlayMarkup.includes('Wellenhoehe <span class="weatherlage-bft'),
  'Wave heights in meters must never receive Beaufort highlighting'
)
assert.ok(
  overlayMarkup.includes('<span class="weatherlage-section-title">Aktuelle Wetterlage</span>'),
  'Expected the "Aktuelle Wetterlage" heading to be highlighted as a section title'
)
assert.ok(
  overlayMarkup.includes('<span class="weatherlage-section-title">Vorhersage</span>'),
  'Expected the "Vorhersage" heading to be highlighted as a section title'
)

console.log('Seewetter highlighting regression checks passed')
