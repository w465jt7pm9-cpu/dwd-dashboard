const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function loadTidePhaseHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
  const match = source.match(
    /const GEOZEIT_WEEKDAY_TO_UTC = \{[\s\S]*?function getAstronomicalTidePhaseForDate \(date(?:, options = \{\})?\) \{[\s\S]*?return getTidePhaseByKey\('mid'\)\n  \}/
  )

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
    getAstronomicalTidePhaseForDate: context.getAstronomicalTidePhaseForDate,
    inferUtcDatesForTimeseriesSlots: context.inferUtcDatesForTimeseriesSlots
  }
}

const { getAstronomicalTidePhaseForDate, inferUtcDatesForTimeseriesSlots } =
  loadTidePhaseHelpers()

const fixturePhaseMap = {
  M: 'mid',
  Sp: 'spring',
  Np: 'neap'
}

function deriveBlockStartDates (fixture, targetCode) {
  const dates = Object.keys(fixture).sort()
  const blockStarts = []
  let previousCode = null

  for (const dateKey of dates) {
    const code = fixture[dateKey]
    if (code === targetCode && previousCode !== targetCode) {
      blockStarts.push(new Date(`${dateKey}T00:00:00Z`))
    }
    previousCode = code
  }

  return blockStarts
}

function deriveMoonPhaseEventsFromFixture (fixture) {
  return {
    newMoonDates: deriveBlockStartDates(fixture, 'Sp'),
    fullMoonDates: [],
    firstQuarterDates: deriveBlockStartDates(fixture, 'Np'),
    lastQuarterDates: []
  }
}

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

const referenceDateWithOffset = new Date('2026-08-09T00:30:00+02:00')
const [slotDate] = inferUtcDatesForTimeseriesSlots(
  [{ label: 'SO 00' }],
  referenceDateWithOffset
)
assert.strictEqual(
  slotDate.toISOString(),
  '2026-08-09T00:00:00.000Z',
  'Expected the slot date to be anchored to the local calendar day rather than the UTC day'
)

const fixtureFiles = fs
  .readdirSync(__dirname)
  .filter(fileName => /^adg_(2026|2027)\.json$/.test(fileName))
  .sort()

let checkedEntries = 0

for (const fixtureFile of fixtureFiles) {
  const fixturePath = path.join(__dirname, fixtureFile)
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
  const yearMatch = fixtureFile.match(/adg[_-](\d{4})\.json$/)
  const year = Number(yearMatch && yearMatch[1])
  const referenceDataByYear = year ? { [year]: fixture } : null

  for (const [dateKey, expectedCode] of Object.entries(fixture)) {
    const date = new Date(`${dateKey}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid fixture date ${dateKey} in ${fixtureFile}`)
    }

    const expectedPhase = fixturePhaseMap[expectedCode]
    if (!expectedPhase) {
      throw new Error(
        `Unsupported fixture code ${expectedCode} in ${fixtureFile}`
      )
    }

    const referencePhase = getAstronomicalTidePhaseForDate(date, {
      referenceDataByYear
    })
    assert.strictEqual(
      referencePhase.key,
      expectedPhase,
      `Expected ${fixtureFile} ${dateKey} to resolve to ${expectedPhase} via reference data, got ${referencePhase.key}`
    )

    checkedEntries += 1
  }
}

console.log(
  `Tide phase regression checks passed (${checkedEntries} fixture entries checked)`
)
