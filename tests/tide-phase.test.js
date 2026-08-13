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
  getTideAgeDays,
  getAstronomicalTidePhaseForDate,
  inferUtcDatesForTimeseriesSlots,
  buildMoonPhaseEventsForYear
} = loadTidePhaseHelpers()

const fixturePhaseMap = {
  Mt: 'mid',
  Sp: 'spring',
  Np: 'neap'
}

// tests/gezeiten-bsh-helgoland-YYYY.json is the sole BSH reference source: a 1:1
// conversion of tests/gezeiten-bsh-helgoland-YYYY.txt (see its _meta.source/legend).
// Day-level Sp/Mt/Np classification and exact moon-phase UTC timestamps are both
// derived from it here, instead of maintaining separate hand-picked fixtures.
function loadGezeitenFixture (fileName) {
  const fixturePath = path.join(__dirname, fileName)
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
  const dayPhaseByDate = {}
  const moonPhaseEvents = []

  for (const event of fixture.events) {
    const dateKey = event.utc.slice(0, 10)
    if (!(dateKey in dayPhaseByDate)) {
      dayPhaseByDate[dateKey] = event.phase
    }
    if (event.moonPhase) {
      moonPhaseEvents.push({ utc: event.utc, phase: event.moonPhase })
    }
  }

  return { dayPhaseByDate, moonPhaseEvents }
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

const gezeitenFixtureFiles = fs
  .readdirSync(__dirname)
  .filter(fileName => /^gezeiten-bsh-helgoland-(2026|2027)\.json$/.test(fileName))
  .sort()

let checkedEntries = 0

for (const fixtureFile of gezeitenFixtureFiles) {
  const yearMatch = fixtureFile.match(/gezeiten-bsh-helgoland-(\d{4})\.json$/)
  const year = Number(yearMatch[1])
  const { dayPhaseByDate } = loadGezeitenFixture(fixtureFile)
  // getReferenceTidePhaseForDate expects the 'M'/'Sp'/'Np' codes used in app.js,
  // while the fixture stores the raw BSH label 'Mt' for the mid-tide phase.
  const referenceDataByYear = {
    [year]: Object.fromEntries(
      Object.entries(dayPhaseByDate).map(([dateKey, code]) => [
        dateKey,
        code === 'Mt' ? 'M' : code
      ])
    )
  }

  for (const [dateKey, rawCode] of Object.entries(dayPhaseByDate)) {
    const date = new Date(`${dateKey}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid fixture date ${dateKey} in ${fixtureFile}`)
    }

    const expectedPhase = fixturePhaseMap[rawCode]
    if (!expectedPhase) {
      throw new Error(
        `Unsupported fixture code ${rawCode} in ${fixtureFile}`
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

for (const fixtureFile of gezeitenFixtureFiles) {
  const yearMatch = fixtureFile.match(/gezeiten-bsh-helgoland-(\d{4})\.json$/)
  const year = Number(yearMatch[1])
  const { dayPhaseByDate } = loadGezeitenFixture(fixtureFile)
  const generatorMoonPhaseEvents = buildMoonPhaseEventsForYear(year)

  let total = 0
  let mismatches = 0

  for (const [dateKey, rawCode] of Object.entries(dayPhaseByDate)) {
    const date = new Date(`${dateKey}T00:00:00Z`)
    const expectedPhase = fixturePhaseMap[rawCode]
    const generatorPhase = getAstronomicalTidePhaseForDate(date, {
      moonPhaseEvents: generatorMoonPhaseEvents
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

// Precise New/First-Quarter/Full/Last-Quarter timestamps in UTC, taken from the
// moonPhase field in tests/gezeiten-bsh-helgoland-YYYY.json. Unlike the per-day
// Sp/Mt/Np fixtures above, this validates the actual UTC timing of the AdG
// generator's moon-phase anchors and the continuous tide-age value, not just the
// derived spring/neap/mid classification.
const SYNODIC_MONTH_DAYS = 29.530588853
const EXPECTED_AGE_DAYS_BY_PHASE = {
  new: 0,
  firstQuarter: SYNODIC_MONTH_DAYS / 4,
  full: SYNODIC_MONTH_DAYS / 2,
  lastQuarter: (SYNODIC_MONTH_DAYS * 3) / 4
}
// BSH attaches each moon-phase marker to the nearest NW/HW tide event rather than
// the exact astronomical moment, so an offset of up to roughly half a tide cycle
// (plus the generator's own approximation error) is expected, not a bug.
const MOON_PHASE_TIMESTAMP_TOLERANCE_HOURS = 30
const TIDE_AGE_TOLERANCE_DAYS = 2

function getCircularDistanceDays (valueA, valueB, periodDays) {
  const distance = Math.abs(valueA - valueB)
  return Math.min(distance, periodDays - distance)
}

let checkedMoonPhaseEvents = 0

for (const fixtureFile of gezeitenFixtureFiles) {
  const yearMatch = fixtureFile.match(/gezeiten-bsh-helgoland-(\d{4})\.json$/)
  const year = Number(yearMatch[1])
  const { moonPhaseEvents: fixtureMoonPhaseEvents } = loadGezeitenFixture(
    fixtureFile
  )
  const generatorMoonPhaseEvents = buildMoonPhaseEventsForYear(year)
  const datesByPhase = {
    new: generatorMoonPhaseEvents.newMoonDates,
    firstQuarter: generatorMoonPhaseEvents.firstQuarterDates,
    full: generatorMoonPhaseEvents.fullMoonDates,
    lastQuarter: generatorMoonPhaseEvents.lastQuarterDates
  }

  for (const { utc, phase } of fixtureMoonPhaseEvents) {
    const referenceDate = new Date(utc)
    if (Number.isNaN(referenceDate.getTime())) {
      throw new Error(`Invalid UTC timestamp ${utc} in ${fixtureFile}`)
    }

    const candidateDates = datesByPhase[phase]
    assert.ok(
      Array.isArray(candidateDates) && candidateDates.length > 0,
      `Expected generator moon-phase anchors for ${phase} in ${year}`
    )

    const closestDiffHours = candidateDates.reduce((closest, candidate) => {
      const diffHours =
        Math.abs(candidate.getTime() - referenceDate.getTime()) / 3600000
      return Math.min(closest, diffHours)
    }, Infinity)

    assert.ok(
      closestDiffHours <= MOON_PHASE_TIMESTAMP_TOLERANCE_HOURS,
      `Expected generator ${phase} anchor within ${MOON_PHASE_TIMESTAMP_TOLERANCE_HOURS}h of BSH ${utc} (${fixtureFile}), got ${closestDiffHours.toFixed(
        1
      )}h`
    )

    const ageDays = getTideAgeDays(referenceDate)
    const expectedAgeDays = EXPECTED_AGE_DAYS_BY_PHASE[phase]
    const ageDistanceDays = getCircularDistanceDays(
      ageDays,
      expectedAgeDays,
      SYNODIC_MONTH_DAYS
    )

    assert.ok(
      ageDistanceDays <= TIDE_AGE_TOLERANCE_DAYS,
      `Expected getTideAgeDays(${utc}) (${fixtureFile}) close to ${expectedAgeDays.toFixed(
        2
      )}d for ${phase}, got ${ageDays.toFixed(
        2
      )}d (distance ${ageDistanceDays.toFixed(2)}d)`
    )

    checkedMoonPhaseEvents += 1
  }
}

console.log(
  `AdG moon-phase UTC timestamp checks passed (${checkedMoonPhaseEvents} BSH reference events checked)`
)

console.log(
  `Tide phase regression checks passed (${checkedEntries} fixture entries checked)`
)
