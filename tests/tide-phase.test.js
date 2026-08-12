const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

function loadTidePhaseHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
  const match = source.match(
    /const GEOZEIT_WEEKDAY_TO_UTC = \{[\s\S]*?function buildMoonPhaseEventsForYears \(years\) \{[\s\S]*?return merged\n  \}/
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
    inferUtcDatesForTimeseriesSlots: context.inferUtcDatesForTimeseriesSlots,
    buildMoonPhaseEventsForYear: context.buildMoonPhaseEventsForYear
  }
}

const {
  getAstronomicalTidePhaseForDate,
  inferUtcDatesForTimeseriesSlots,
  buildMoonPhaseEventsForYear
} = loadTidePhaseHelpers()

const fixturePhaseMap = {
  M: 'mid',
  Sp: 'spring',
  Np: 'neap'
}

const referenceDates = [
  { date: '2026-08-07T00:00:00Z', expected: 'neap' },
  { date: '2026-08-10T00:00:00Z', expected: 'mid' },
  { date: '2026-08-14T00:00:00Z', expected: 'spring' }
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

// Validates the actual AdG generator (same moon-phase anchors used in production)
// against the official BSH reference data. The simplified synodic-cycle model is
// an orientation aid, not an exact ephemeris, so a minimum match rate is required
// instead of a per-day equality (see US-023: "ersetzt keine amtlichen ... Berechnungen").
const GENERATOR_MIN_MATCH_RATIO = 0.9

for (const fixtureFile of fixtureFiles) {
  const fixturePath = path.join(__dirname, fixtureFile)
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
  const yearMatch = fixtureFile.match(/adg[_-](\d{4})\.json$/)
  const year = Number(yearMatch && yearMatch[1])
  const moonPhaseEvents = buildMoonPhaseEventsForYear(year)

  let total = 0
  let mismatches = 0

  for (const [dateKey, expectedCode] of Object.entries(fixture)) {
    const date = new Date(`${dateKey}T00:00:00Z`)
    const expectedPhase = fixturePhaseMap[expectedCode]
    const generatorPhase = getAstronomicalTidePhaseForDate(date, {
      moonPhaseEvents
    })

    total += 1
    if (generatorPhase.key !== expectedPhase) {
      mismatches += 1
    }
  }

  const matchRatio = (total - mismatches) / total
  assert.ok(
    matchRatio >= GENERATOR_MIN_MATCH_RATIO,
    `Expected AdG generator to match at least ${(
      GENERATOR_MIN_MATCH_RATIO * 100
    ).toFixed(0)}% of ${fixtureFile}, got ${(matchRatio * 100).toFixed(
      1
    )}% (${mismatches}/${total} mismatches)`
  )

  console.log(
    `AdG generator matched ${(matchRatio * 100).toFixed(
      1
    )}% of ${fixtureFile} against BSH reference data`
  )
}

console.log(
  `Tide phase regression checks passed (${checkedEntries} fixture entries checked)`
)
