const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

// Migrates the manual, browser-only "US-015 UTC Szenario-Test"
// (js/app.js, runBodenUtcScenarioTest, gated behind ?test=us015-utc)
// into an automated regression test.
function loadBodenRefreshCycleHelpers () {
  const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')

  const constantsMatch = source.match(
    /const BODEN_ANALYSIS_CYCLE_UTC_HOURS = \[[\s\S]*?const BODEN_FORECAST_RELEASE_UTC_HOURS = \{[\s\S]*?\n {2}\}/
  )
  const functionsMatch = source.match(
    /function padTimePart \([\s\S]*?function getActiveBodenForecastRunId \(now = new Date\(\)\) \{[\s\S]*?\n {2}\}/
  )

  if (!constantsMatch || !functionsMatch) {
    throw new Error('Could not extract Boden refresh-cycle helpers from app.js')
  }

  const context = vm.createContext({ Date, Math, Number, String })
  vm.runInContext(constantsMatch[0], context)
  vm.runInContext(functionsMatch[0], context)

  return {
    getActiveBodenAnalysisCycleId: context.getActiveBodenAnalysisCycleId,
    getActiveBodenForecastRunId: context.getActiveBodenForecastRunId
  }
}

const { getActiveBodenAnalysisCycleId, getActiveBodenForecastRunId } =
  loadBodenRefreshCycleHelpers()

const scenarios = [
  // Original US-015 UTC scenarios from runBodenUtcScenarioTest (js/app.js).
  {
    at: '2026-06-20T00:05:00Z',
    expectedAnalysis: '2026-06-20-00',
    expectedForecast: '2026-06-19-12'
  },
  {
    at: '2026-06-20T06:59:00Z',
    expectedAnalysis: '2026-06-20-00',
    expectedForecast: '2026-06-19-12'
  },
  {
    at: '2026-06-20T07:01:00Z',
    expectedAnalysis: '2026-06-20-00',
    expectedForecast: '2026-06-20-00'
  },
  {
    at: '2026-06-20T12:05:00Z',
    expectedAnalysis: '2026-06-20-12',
    expectedForecast: '2026-06-20-00'
  },
  {
    at: '2026-06-20T19:01:00Z',
    expectedAnalysis: '2026-06-20-12',
    expectedForecast: '2026-06-20-12'
  },
  // Additional exact-boundary scenarios (>= comparisons).
  {
    at: '2026-06-20T00:00:00Z',
    expectedAnalysis: '2026-06-20-00',
    expectedForecast: '2026-06-19-12'
  },
  {
    at: '2026-06-20T07:00:00Z',
    expectedAnalysis: '2026-06-20-00',
    expectedForecast: '2026-06-20-00'
  },
  {
    at: '2026-06-20T12:00:00Z',
    expectedAnalysis: '2026-06-20-12',
    expectedForecast: '2026-06-20-00'
  },
  {
    at: '2026-06-20T19:00:00Z',
    expectedAnalysis: '2026-06-20-12',
    expectedForecast: '2026-06-20-12'
  },
  // Day/month/year rollover: before 07 UTC, the forecast run must fall back
  // to the previous calendar day's 12 UTC run.
  {
    at: '2026-01-01T05:00:00Z',
    expectedAnalysis: '2026-01-01-00',
    expectedForecast: '2025-12-31-12'
  }
]

for (const { at, expectedAnalysis, expectedForecast } of scenarios) {
  const now = new Date(at)

  const analysisCycleId = getActiveBodenAnalysisCycleId(now)
  assert.strictEqual(
    analysisCycleId,
    expectedAnalysis,
    `Expected analysis cycle at ${at} to be ${expectedAnalysis}, got ${analysisCycleId}`
  )

  const forecastRunId = getActiveBodenForecastRunId(now)
  assert.strictEqual(
    forecastRunId,
    expectedForecast,
    `Expected forecast run at ${at} to be ${expectedForecast}, got ${forecastRunId}`
  )
}

console.log(
  `Boden refresh-cycle regression checks passed (${scenarios.length} scenarios checked)`
)
