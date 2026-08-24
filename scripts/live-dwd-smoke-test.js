#!/usr/bin/env node

const SOURCES = [
  {
    name: 'Maritime forecast feed',
    url: 'https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST',
    encoding: 'latin1',
    markers: [
      'Aktuelle Wetterlage',
      'Vorhersage',
      'Deutscher Wetterdienst',
      'Copyright',
      '$$'
    ]
  },
  {
    name: 'Seewetterbericht Nord- und Ostsee',
    url: 'https://www.dwd.de/DE/leistungen/seewetternordostsee/seewetternordostsee.html',
    markers: [
      'Aktuelle Wetterlage'
    ],
    markerAlternatives: [
      ['Seewetterbericht für Nord- und Ostsee', 'Seewetterbericht f&uuml;r Nord- und Ostsee']
    ],
    endMarkers: [
      'Ergänzende Informationen',
      'Verwandte Leistungen',
      'INHATSVERZEICHNIS'
    ]
  },
  {
    name: 'Nordsee forecast',
    url: 'https://www.dwd.de/DE/leistungen/seevorhersagenordsee/seevorhersagennordsee.html?nn=16102',
    markers: ['Wetterlage und -entwicklung:', 'Vorhersagen von']
  },
  {
    name: 'Ostsee forecast',
    url: 'https://www.dwd.de/DE/leistungen/seevorhersageostsee/seevorhersagenostsee.html?nn=16102',
    markers: ['Wetterlage und -entwicklung:', 'Vorhersagen von']
  }
]

const timeoutMs = 15000
const strict = process.argv.includes('--strict')
const findings = []

function report (message) {
  console.log(message)
}

async function fetchSource (source) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'user-agent': 'dwd-dashboard-live-smoke-test/1.0' }
    })
    const bytes = new Uint8Array(await response.arrayBuffer())
    const body = new TextDecoder(source.encoding || 'utf-8').decode(bytes)

    report(`\n${source.name}`)
    report(`  HTTP ${response.status} · ${bytes.byteLength} bytes`)

    if (!response.ok) {
      findings.push(`${source.name}: HTTP ${response.status}`)
      return
    }
    if (!body.trim()) {
      findings.push(`${source.name}: empty response`)
      return
    }

    for (const marker of source.markers || []) {
      if (!body.includes(marker)) {
        findings.push(`${source.name}: missing marker ${JSON.stringify(marker)}`)
      }
    }
    for (const alternatives of source.markerAlternatives || []) {
      if (!alternatives.some(marker => body.includes(marker))) {
        findings.push(`${source.name}: missing marker alternatives ${JSON.stringify(alternatives)}`)
      }
    }

    if (source.endMarkers) {
      const foundEndMarker = source.endMarkers.some(marker => body.includes(marker))
      if (!foundEndMarker) {
        findings.push(`${source.name}: no known HTML end marker found`)
      }
    }

    const markerCount = (source.markers || []).filter(marker => body.includes(marker)).length
    const alternativeCount = (source.markerAlternatives || []).filter(alternatives =>
      alternatives.some(marker => body.includes(marker))
    ).length
    report(`  markers: ${markerCount + alternativeCount}/${(source.markers || []).length + (source.markerAlternatives || []).length}`)
    if (source.encoding === 'latin1') {
      report('  decoding: latin1')
    }
  } catch (error) {
    const reason = error.name === 'AbortError' ? `timeout after ${timeoutMs} ms` : error.message
    findings.push(`${source.name}: ${reason}`)
    report(`\n${source.name}\n  ERROR ${reason}`)
  } finally {
    clearTimeout(timeout)
  }
}

async function main () {
  report(`DWD live smoke test${strict ? ' (strict)' : ''}`)
  await Promise.all(SOURCES.map(fetchSource))

  if (findings.length) {
    report('\nFindings:')
    findings.forEach(finding => report(`- ${finding}`))
    if (strict) {
      process.exitCode = 1
    }
    return
  }

  report('\nAll live DWD source checks passed.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
