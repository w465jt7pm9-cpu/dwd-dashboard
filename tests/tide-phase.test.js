const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function loadTidePhaseHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
  const match = source.match(/const GEOZEIT_WEEKDAY_TO_UTC = \{[\s\S]*?function getAstronomicalTidePhaseForDate \(date\) \{[\s\S]*?return getTidePhaseByKey\('mid'\)\n  \}/)

  if (!match) {
    throw new Error('Could not extract tide phase helpers from app.js')
  }

  const context = vm.createContext({
    Date,
    Math,
    Number,
    console,
    getTidePhaseByKey: phaseKey => {
      if (phaseKey === 'spring') {
        return { key: 'spring', label: 'Springzeit', className: 'spring' }
      }
      if (phaseKey === 'neap') {
        return { key: 'neap', label: 'Nippzeit', className: 'neap' }
      }
      if (phaseKey === 'mid') {
        return { key: 'mid', label: 'Mittzeit', className: 'mid' }
      }
      return { key: 'unknown', label: 'Unbekannt', className: 'unknown' }
    }
  })

  vm.runInContext(match[0], context)

  return {
    getTideAgeDays: context.getTideAgeDays,
    getAstronomicalTidePhaseForDate: context.getAstronomicalTidePhaseForDate
  }
}

const { getAstronomicalTidePhaseForDate } = loadTidePhaseHelpers()

const referenceDates = [
  { date: '2026-08-09T00:00:00Z', expected: 'neap' },
  { date: '2026-08-11T00:00:00Z', expected: 'mid' },
  { date: '2026-08-12T00:00:00Z', expected: 'spring' }
]

for (const { date, expected } of referenceDates) {
  const phase = getAstronomicalTidePhaseForDate(new Date(date))
  assert.strictEqual(
    phase.key,
    expected,
    `Expected ${date} to resolve to ${expected}, got ${phase.key}`
  )
}

console.log('Tide phase regression checks passed')
