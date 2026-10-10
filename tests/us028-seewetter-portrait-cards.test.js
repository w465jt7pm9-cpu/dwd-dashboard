const assert = require('assert')
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8')
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
const defaultSeaRow = css.match(/\.sea-row,\s*\.upper-row\s*\{([^}]*)\}/)
const portraitRules = [...css.matchAll(
  /@media\s*\(max-width:\s*767px\)\s*and\s*\(orientation:\s*portrait\)\s*\{([\s\S]*?)\n\}/g
)].map(match => match[1]).join('\n')
const seaPage = html.match(/<main class="sea-grid">([\s\S]*?)<\/main>/)

assert.ok(portraitRules, 'Mobile portrait media query is missing')
assert.ok(seaPage, 'Seewetter page markup is missing')
assert.ok(defaultSeaRow, 'Default Seewetter row layout is missing')

const rows = [...seaPage[1].matchAll(/<section class="sea-row"[^>]*>([\s\S]*?)<\/section>/g)]
assert.strictEqual(rows.length, 3, 'Seewetter page must contain three card rows')
rows.forEach((row, index) => {
  const cards = [...row[1].matchAll(/<figure class="card">/g)]
  assert.strictEqual(cards.length, 4, `Seewetter row ${index + 1} must retain all four cards`)
})

assert.match(
  defaultSeaRow[1],
  /grid-template-columns:\s*repeat\(4,\s*1fr\)/,
  'Seewetter rows must retain four columns outside the portrait override'
)
assert.match(
  portraitRules,
  /\.page\[data-page=['"]1['"]\]\s+\.sea-row\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/,
  'Seewetter rows must use two columns in mobile portrait'
)
assert.match(
  portraitRules,
  /\.page\[data-page=['"]1['"]\]\s+\.sea-row\s+\.card:nth-child\(n \+ 3\)\s*\{\s*display:\s*none\s*;/,
  'Cards after the first two must be hidden on the Seewetter page in portrait'
)

console.log('US-028 Seewetter portrait card regression checks passed')
