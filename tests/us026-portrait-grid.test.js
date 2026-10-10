const assert = require('assert')
const fs = require('fs')
const path = require('path')

const css = fs.readFileSync(path.join(__dirname, '../css/layout.css'), 'utf8')

assert.ok(
  /@media\s*\(max-width:\s*767px\)\s*and\s*\(orientation:\s*portrait\)/i.test(css),
  'Portrait mobile media query is missing'
)
assert.ok(
  /\.dashboard__top-right\s+\.card:nth-child\(n \+ 3\)/i.test(css),
  'Top-right card hiding rule for portrait is missing'
)
assert.ok(
  /\.dashboard__bottom\s+\.card:nth-child\(n \+ 4\)/i.test(css),
  'Bottom-row card hiding rule for portrait is missing'
)
assert.ok(
  /\.dashboard__bottom\s*\{\s*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)\s*;\s*\}/i.test(css),
  'Portrait bottom grid width reduction is missing'
)
assert.ok(
  /\.dashboard__top-right\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;\s*grid-template-rows:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;\s*\}/i.test(css),
  'Portrait top-right cards must stack vertically in two rows'
)

console.log('US-026 portrait grid regression checks passed')
