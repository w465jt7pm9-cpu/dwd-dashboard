const assert = require('assert')
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8')
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
const defaultUpperRow = css.match(/\.sea-row,\s*\.upper-row\s*\{([^}]*)\}/)
const portraitRules = [...css.matchAll(
  /@media\s*\(max-width:\s*767px\)\s*and\s*\(orientation:\s*portrait\)\s*\{([\s\S]*?)\n\}/g
)].map(match => match[1]).join('\n')
const upperairPage = html.match(/<main class="upperair-grid">([\s\S]*?)<\/main>/)

assert.ok(portraitRules, 'Mobile portrait media query is missing')
assert.ok(upperairPage, 'Höhenwetter page markup is missing')
assert.ok(defaultUpperRow, 'Default Höhenwetter row layout is missing')

const rows = [...upperairPage[1].matchAll(/<section class="upper-row"[^>]*>([\s\S]*?)<\/section>/g)]
assert.strictEqual(rows.length, 3, 'Höhenwetter page must contain three card rows')
rows.forEach((row, index) => {
  const cards = [...row[1].matchAll(/<figure class="card">/g)]
  assert.strictEqual(cards.length, 4, `Höhenwetter row ${index + 1} must retain all four cards`)
})

assert.match(
  defaultUpperRow[1],
  /grid-template-columns:\s*repeat\(4,\s*1fr\)/,
  'Höhenwetter rows must retain four columns outside the portrait override'
)
assert.match(
  portraitRules,
  /\.page\[data-page=['"]2['"]\]\s+\.upper-row\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/,
  'Höhenwetter rows must use two columns in mobile portrait'
)
assert.match(
  portraitRules,
  /\.page\[data-page=['"]2['"]\]\s+\.upper-row\s+\.card:nth-child\(n \+ 3\)\s*\{\s*display:\s*none\s*;/,
  'Cards after the first two must be hidden on the Höhenwetter page in portrait'
)

console.log('US-029 Höhenwetter portrait card regression checks passed')
