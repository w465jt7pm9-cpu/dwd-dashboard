#!/usr/bin/env node

const SOURCES = [
  {
    name: 'Maritime forecast feed',
    url: 'https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST',
    encoding: 'latin1',
    // DWD payload is framed by ASCII SOH (0x01) and ETX (0x03).
    frameStart: '\x01',
    frameEnd: '\x03',
    contentMarkers: ['Seewetterbericht', 'Vorhersage']
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
      'INHALTSVERZEICHNIS'
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

    let content = body
    if (source.frameStart || source.frameEnd) {
      const start = source.frameStart ? body.indexOf(source.frameStart) : 0
      const end = source.frameEnd ? body.indexOf(source.frameEnd, start + 1) : body.length
      if (start < 0 || end < 0 || end <= start) {
        findings.push(`${source.name}: invalid control-character frame`)
        return
      }
      content = body.slice(start + source.frameStart.length, end)
    }

    for (const marker of source.markers || []) {
      if (!content.includes(marker)) {
        findings.push(`${source.name}: missing marker ${JSON.stringify(marker)}`)
      }
    }
    for (const marker of source.contentMarkers || []) {
      if (!content.includes(marker)) {
        findings.push(`${source.name}: missing content ${JSON.stringify(marker)}`)
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
    const contentCount = (source.contentMarkers || []).filter(marker => content.includes(marker)).length
    const markerTotal = (source.markers || []).length + (source.markerAlternatives || []).length
    if (markerTotal) {
      report(`  markers: ${markerCount + alternativeCount}/${markerTotal}`)
    }
    if ((source.contentMarkers || []).length) {
      report(`  content: ${contentCount}/${source.contentMarkers.length}`)
    }
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
