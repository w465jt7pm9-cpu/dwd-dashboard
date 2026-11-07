const assert = require('assert')
const fs = require('fs')
const path = require('path')

const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
const topRightMatch = indexHtml.match(
  /<div class="dashboard__top-right">([\s\S]*?)<\/div>/
)

assert.ok(topRightMatch, 'The start-page forecast cards are missing')

const cards = Array.from(
  topRightMatch[1].matchAll(/<img\b([^>]*)>/g),
  ([, attributes]) => {
    const dataBase = attributes.match(/\bdata-base="([^"]+)"/)?.[1]
    const dataPath = attributes.match(/\bdata-path="([^"]+)"/)?.[1]
    const alt = attributes.match(/\balt="([^"]+)"/)?.[1]
    return { dataBase, dataPath, alt }
  }
)

assert.deepStrictEqual(cards, [
  {
    dataBase: 'WX_URL',
    dataPath: 'ico_tkboden_na_v36.png',
    alt: 'Europa +36h (12 Uhr Vortag)'
  },
  {
    dataBase: 'WX_URL',
    dataPath: 'ico_tkboden_na_036.png',
    alt: 'Europa +36h (00 UTC)'
  },
  {
    dataBase: 'WX_URL',
    dataPath: 'ico_tkboden_na_060.png',
    alt: 'Europa +60h'
  },
  {
    dataBase: 'WX_URL',
    dataPath: 'ico_tkboden_na_084.png',
    alt: 'Europa +84h'
  }
], 'US-015 forecast map sources, labels, and order must match the DWD horizons')

console.log('US-015 forecast-map regression checks passed')
