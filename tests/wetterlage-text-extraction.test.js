const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Minimal DOMParser test double: enough for extractSeewetterberichtSection,
// which only reads `document.body.textContent` after parsing. Not a general
// HTML parser - strips tags/scripts/styles and decodes the handful of
// entities the real DWD pages use.
class FakeDOMParser {
  parseFromString (html) {
    const withoutScripts = String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')

    return { body: { textContent: withoutScripts } }
  }
}

// Covers US-016/US-018 text extraction: pulling the "Aktuelle Wetterlage"
// section out of the raw DWD maritime feed and the Seewetterbericht page.
function loadWetterlageExtractionHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')

  const match = source.match(
    /function normalizeWetterlageText \([\s\S]*?function extractRegionalWetterlageSection \(rawHtml\) \{[\s\S]*?\n {2}\}/
  )

  if (!match) {
    throw new Error('Could not extract Wetterlage extraction helpers from app.js')
  }

  const context = vm.createContext({
    String,
    RegExp,
    DOMParser: FakeDOMParser
  })
  vm.runInContext(match[0], context)

  return {
    extractWetterlageSection: context.extractWetterlageSection,
    extractSeewetterberichtSection: context.extractSeewetterberichtSection,
    extractRegionalWetterlageSection:
      context.extractRegionalWetterlageSection
  }
}

const {
  extractWetterlageSection,
  extractSeewetterberichtSection,
  extractRegionalWetterlageSection
} = loadWetterlageExtractionHelpers()

// --- extractWetterlageSection (raw FQEN50-style text feed) ---

const maritimeFeedSample = [
  'FQEN50 EDZW 120500',
  'Seewetterbericht',
  '',
  'Aktuelle Wetterlage',
  'Ein kraeftiges Sturmtief ueber der Nordsee verlagert sich ostwaerts.',
  '',
  'Vorhersage bis morgen frueh:',
  'Wind: SW 6-7, spaeter 8.',
  '',
  'Deutscher Wetterdienst',
  'Copyright DWD 2026'
].join('\n')

const extractedFeedSection = extractWetterlageSection(maritimeFeedSample)
assert.ok(
  extractedFeedSection.startsWith('Aktuelle Wetterlage'),
  'Expected extraction to start at the "Aktuelle Wetterlage" heading'
)
assert.ok(
  extractedFeedSection.includes('Wind: SW 6-7, spaeter 8.'),
  'Expected the full forecast body to be included'
)
assert.ok(
  !extractedFeedSection.includes('Deutscher Wetterdienst'),
  'Expected the DWD footer to be cut off'
)
assert.ok(
  !extractedFeedSection.includes('Copyright'),
  'Expected the copyright footer to be cut off'
)

// Fallback pattern when the primary "Aktuelle Wetterlage" heading is missing.
const fallbackFeedSample = [
  'Wetter- und Warnlage:',
  'Kraeftiger Wind aus Suedwest.',
  '',
  'GEWITTER',
  'Vereinzelt moeglich.'
].join('\n')

const fallbackSection = extractWetterlageSection(fallbackFeedSample)
assert.ok(
  fallbackSection.includes('Kraeftiger Wind aus Suedwest.'),
  'Expected the fallback "Wetter- und Warnlage" pattern to be used'
)
assert.ok(
  !fallbackSection.includes('GEWITTER'),
  'Expected the fallback extraction to stop before the GEWITTER marker'
)

assert.strictEqual(
  extractWetterlageSection(''),
  '',
  'Expected empty input to yield an empty section'
)
assert.strictEqual(
  extractWetterlageSection('Keine relevanten Abschnitte hier.'),
  '',
  'Expected text without a recognizable heading to yield an empty section'
)

// --- extractSeewetterberichtSection (HTML page) ---

const seewetterberichtHtmlFull = `
  <html><body>
    <h1>Seewetterbericht für Nord- und Ostsee</h1>
    <nav>Navigation Unwichtig</nav>
    <h2>Aktuelle Wetterlage</h2>
    <p>Ein Tief ueber der Nordsee bestimmt das Wetter.</p>
    <p>Wind: NW 5-6.</p>
    <h2>Ergänzende Informationen</h2>
    <p>Impressum und Rechtliches.</p>
  </body></html>
`

const fullSection = extractSeewetterberichtSection(seewetterberichtHtmlFull)
assert.ok(
  fullSection.includes('Ein Tief ueber der Nordsee bestimmt das Wetter.'),
  'Expected the forecast body to be extracted from the full page layout'
)
assert.ok(
  !fullSection.includes('Ergänzende Informationen'),
  'Expected the trailing "Ergänzende Informationen" section to be excluded'
)
assert.ok(
  !fullSection.includes('Impressum'),
  'Expected content after the cutoff heading to be excluded'
)

// Compact layout without the leading "Seewetterbericht für ..." heading.
const seewetterberichtHtmlCompact = `
  <html><body>
    <h2>Aktuelle Wetterlage</h2>
    <p>Schwacher Wind aus Ost.</p>
    <h2>Verwandte Leistungen</h2>
    <p>Weitere Links.</p>
  </body></html>
`

const compactSection = extractSeewetterberichtSection(seewetterberichtHtmlCompact)
assert.ok(
  compactSection.includes('Schwacher Wind aus Ost.'),
  'Expected the compact-layout fallback to still extract the forecast body'
)
assert.ok(
  !compactSection.includes('Verwandte Leistungen'),
  'Expected the compact-layout extraction to stop before "Verwandte Leistungen"'
)

assert.strictEqual(
  extractSeewetterberichtSection(''),
  '',
  'Expected empty HTML input to yield an empty section'
)

// --- extractRegionalWetterlageSection (US-020 AK7) ---

const nordseeRegionalHtml = `
  <h1>Seewettervorhersagen Nordsee</h1>
  <b>Wetterlage und -entwicklung:</b><br />
  <p>Nordsee: Ein Tief zieht ostwaerts.</p>
  <p>Vorhersagen von Mi, 19.08.2026 12 UTC</p>
  <h1>Ergänzende Informationen</h1>
`

const ostseeRegionalHtml = `
  <h1>Seewettervorhersagen Ostsee</h1>
  <b>Wetterlage und -entwicklung:</b><br />
  <p>Ostsee: Schwacher Wind aus Ost.</p>
  <p>Vorhersagen von Mi, 19.08.2026 12 UTC</p>
  <h1>Ergänzende Informationen</h1>
`

const nordseeRegionalSection = extractRegionalWetterlageSection(
  nordseeRegionalHtml
)
const ostseeRegionalSection = extractRegionalWetterlageSection(
  ostseeRegionalHtml
)

assert.ok(nordseeRegionalSection.includes('Nordsee: Ein Tief zieht ostwaerts.'))
assert.ok(ostseeRegionalSection.includes('Ostsee: Schwacher Wind aus Ost.'))
assert.ok(!nordseeRegionalSection.includes('Ostsee:'))
assert.ok(!ostseeRegionalSection.includes('Nordsee: Ein Tief'))
assert.ok(
  !nordseeRegionalSection.includes('Vorhersagen von'),
  'Expected the North Sea forecast table to be excluded'
)

console.log('Wetterlage text-extraction regression checks passed')
