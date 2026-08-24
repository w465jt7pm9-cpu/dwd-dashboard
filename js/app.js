document.addEventListener('DOMContentLoaded', () => {
  const IMAGE_BASE_URLS = {
    WX_URL: 'https://www.dwd.de/DWD/wetter/wv_spez/hobbymet/wetterkarten',
    WX_ROOT: 'https://www.dwd.de/DWD/wetter',
    WX_SEE: 'https://www.dwd.de/DWD/wetter/wv_spez/seewetter'
  }

  const REFRESH_INTERVAL_MS = 5 * 60 * 1000
  const LONG_PRESS_DURATION_MS = 600
  const INFO_OVERLAY_DURATION_MS = 4500
  const EDGE_TAP_ZONE_PX = 26
  const NORDSEE_PAGE_INDEX = 3
  const OSTSEE_PAGE_INDEX = 4
  const TEXT_PAGE_INDEX = 5
  const SEEGANG_REFRESH_WINDOW_UTC_HOURS = [7, 19]
  const SEEGANG_REFRESH_WINDOW_SPAN_MINUTES = 90
  const BODEN_ANALYSIS_CYCLE_UTC_HOURS = [0, 12]
  const BODEN_FORECAST_RELEASE_UTC_HOURS = {
    RUN_00: 7,
    RUN_12: 19
  }
  const ENABLE_BODEN_UTC_SCENARIO_TEST =
    new URLSearchParams(window.location.search).get('test') === 'us015-utc'

  const LIGHTBOX_MIN_SCALE = 1
  const LIGHTBOX_MAX_SCALE = 4
  const LIGHTBOX_WHEEL_STEP = 0.18
  const LIGHTBOX_DOUBLE_TAP_SCALE = 2
  const LIGHTBOX_NAV_HIDE_DELAY_MS = 1800
  const LIGHTBOX_DOUBLE_TAP_DELAY_MS = 300
  const LIGHTBOX_PAGE_SWIPE_MIN_DISTANCE_PX = 40
  const LIGHTBOX_PAGE_SWIPE_MAX_DURATION_MS = 800
  const LIGHTBOX_CLOSE_SWIPE_MIN_DISTANCE_PX = 80
  const LIGHTBOX_CLOSE_SWIPE_MAX_DURATION_MS = 700
  const LIGHTBOX_IMAGE_SHIFT_PX = 18
  const LIGHTBOX_IMAGE_SHIFT_DURATION_MS = 220
  const LIGHTBOX_ELASTIC_MAX_PX = 36
  const LIGHTBOX_ELASTIC_RESISTANCE = 0.35
  const LIGHTBOX_SNAPBACK_DURATION_MS = 180
  const LIGHTBOX_PAN_MIN_SCALE = 1.01
  const LIGHTBOX_PAN_GESTURE_THRESHOLD_PX = 6

  const PAGE_SWIPE_MIN_DISTANCE_PX = 50
  const PAGE_SWIPE_MAX_DURATION_MS = 800

  const LAST_SUCCESSFUL_REFRESH_KEY = 'dwdLastSuccessfulRefresh'
  const SEEGANG_LAST_WINDOW_REFRESH_KEY = 'dwdSeegangLastWindowRefresh'
  const BODEN_LAST_ANALYSIS_REFRESH_KEY = 'dwdBodenLastAnalysisRefresh'
  const BODEN_LAST_FORECAST_RUN_REFRESH_KEY = 'dwdBodenLastForecastRunRefresh'
  const WETTERLAGE_TEXT_CACHE_KEY = 'dwdWetterlageText'
  const WETTERLAGE_RUN_CACHE_KEY = 'dwdWetterlageModelRun'
  const WETTERLAGE_SOURCE_CACHE_KEY = 'dwdWetterlageSource'
  const WETTERLAGE_UPDATED_AT_CACHE_KEY = 'dwdWetterlageUpdatedAt'
  const OSTSEE_TS_CACHE_KEY = 'dwdOstseeTimeseriesCache'
  const OSTSEE_TS_UPDATED_AT_CACHE_KEY = 'dwdOstseeTimeseriesUpdatedAt'
  const NORDSEE_TS_CACHE_KEY = 'dwdNordseeTimeseriesCache'
  const NORDSEE_TS_UPDATED_AT_CACHE_KEY = 'dwdNordseeTimeseriesUpdatedAt'
  const REGIONAL_WETTERLAGE_CACHE_KEYS = {
    nordsee: {
      text: 'dwdNordseeWetterlageText',
      run: 'dwdNordseeWetterlageModelRun',
      source: 'dwdNordseeWetterlageSource',
      updatedAt: 'dwdNordseeWetterlageUpdatedAt'
    },
    ostsee: {
      text: 'dwdOstseeWetterlageText',
      run: 'dwdOstseeWetterlageModelRun',
      source: 'dwdOstseeWetterlageSource',
      updatedAt: 'dwdOstseeWetterlageUpdatedAt'
    }
  }
  const DWD_SEEWETTERBERICHT_URL =
    'https://www.dwd.de/DE/leistungen/seewetternordostsee/seewetternordostsee.html'
  const DWD_MARITIME_FORECAST_URL =
    'https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST'
  const DWD_OSTSEE_3DAY_URL =
    'https://www.dwd.de/DE/leistungen/seevorhersageostsee/seevorhersagenostsee.html?nn=16102'
  const DWD_NORDSEE_3DAY_URL =
    'https://www.dwd.de/DE/leistungen/seevorhersagenordsee/seevorhersagennordsee.html?nn=16102'
  const OSTSEE_TS_CACHE_TTL_MS = 3 * 60 * 60 * 1000
  const WETTERLAGE_STALE_AFTER_MS = 24 * 60 * 60 * 1000
  const LAST_KNOWN_IMAGE_URL_KEY_PREFIX = 'dwdImageLastKnownUrl:'
  const THEME_STORAGE_KEY = 'dwdTheme'

  const PAGE_NAMES = [
    'Land',
    'See / Seegang',
    'Höhenwetter',
    'Seegang Nordsee',
    'Seegang Ostsee',
    'Seewetter Texte'
  ]
  const IMAGE_ELEMENTS = Array.from(
    document.querySelectorAll('img[data-base][data-path]')
  )
  const PAGE_STATE_BY_IMAGE = new Map()

  const viewportElement = document.getElementById('viewport')
  const carouselElement = document.getElementById('carousel')
  const offlineBannerElement = document.getElementById('offlineBanner')
  const offlineStampElement = document.getElementById('offlineStamp')
  const installHintElement = document.getElementById('installHint')
  const installHintCloseButton = document.getElementById('installHintClose')
  const lightboxElement = document.getElementById('lightbox')
  const lightboxImageElement = document.getElementById('lightboxImg')
  const lightboxWeatherlageElement = document.getElementById(
    'lightboxWeatherlage'
  )
  const lightboxPeekPreviousElement =
    document.getElementById('lightboxPeekPrev')
  const lightboxPeekNextElement = document.getElementById('lightboxPeekNext')
  const lightboxPreviousButton = document.getElementById('lbPrev')
  const lightboxNextButton = document.getElementById('lbNext')

  let currentPageIndex = 0
  let lightboxImageList = []
  let currentLightboxImageIndex = -1
  let isLightboxOpen = false
  let lightboxHideTimerId = null

  let lightboxScale = 1
  let lightboxOffsetX = 0
  let lightboxOffsetY = 0
  let pinchStartDistance = 0
  let pinchStartScale = 1
  let panStartOffsetX = 0
  let panStartOffsetY = 0
  let didRunPinchGesture = false
  let lastTapTimestamp = 0
  let isDraggingLightboxImage = false
  let dragOriginX = 0
  let dragOriginY = 0
  let lightboxSwipeStartX = null
  let lightboxSwipeStartY = null
  let lightboxSwipeStartTimestamp = 0
  let lightboxImageShiftX = 0
  let lightboxAnimationTimerId = null
  let lightboxSnapbackTimerId = null
  let isLightboxPanning = false
  let didLightboxPanInGesture = false
  let lightboxPanStartX = 0
  let lightboxPanStartY = 0

  let pageSwipeStartX = null
  let pageSwipeStartY = null
  let pageSwipeStartTimestamp = 0

  let pullRefreshStartY = null
  let pullRefreshStartTimestamp = 0

  let longPressTimerId = null
  let didTriggerLongPress = false
  let lastImageStatesBeforeOffline = new Map()

  function getCurrentTimeLabel () {
    return new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  function formatTimestamp (timestamp) {
    if (!timestamp) {
      return '-'
    }

    try {
      return new Date(Number(timestamp)).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  function getWetterlageSourceTimestamp (text, fallbackTimestamp = null) {
    const publicationMatch = String(text || '').match(
      /\bam\s+(\d{1,2})\.(\d{1,2})\.(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(MESZ|MEZ|UTC|GMT)?/i
    )
    if (!publicationMatch) {
      return fallbackTimestamp
    }

    const [, day, month, year, hour, minute, timezone = 'UTC'] = publicationMatch
    const timezoneOffsetHours =
      timezone.toUpperCase() === 'MESZ'
        ? 2
        : timezone.toUpperCase() === 'MEZ'
          ? 1
          : 0
    const timestamp = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - timezoneOffsetHours,
      Number(minute)
    )

    return Number.isFinite(timestamp) ? timestamp : fallbackTimestamp
  }

  function formatWetterlageStand (timestamp) {
    const formattedTimestamp = formatTimestamp(timestamp)
    const numericTimestamp = Number(timestamp)

    if (!Number.isFinite(numericTimestamp)) {
      return `Stand: ${formattedTimestamp}`
    }

    const ageMs = Math.max(0, Date.now() - numericTimestamp)
    if (ageMs < WETTERLAGE_STALE_AFTER_MS) {
      return `Stand: ${formattedTimestamp}`
    }

    const ageHours = Math.floor(ageMs / (60 * 60 * 1000))
    const ageLabel =
      ageHours >= 48
        ? `${Math.floor(ageHours / 24)} Tage alt`
        : `${ageHours} Stunden alt`

    return `Stand: ${formattedTimestamp} · VERALTET (${ageLabel})`
  }

  function getLastSuccessfulRefresh () {
    try {
      return localStorage.getItem(LAST_SUCCESSFUL_REFRESH_KEY)
    } catch {
      return null
    }
  }

  function setLastSuccessfulRefresh (timestamp) {
    try {
      localStorage.setItem(LAST_SUCCESSFUL_REFRESH_KEY, String(timestamp))
    } catch {
      // localStorage is optional here.
    }
  }

  function getLastSeegangWindowRefresh () {
    try {
      return localStorage.getItem(SEEGANG_LAST_WINDOW_REFRESH_KEY)
    } catch {
      return null
    }
  }

  function setLastSeegangWindowRefresh (windowId) {
    try {
      localStorage.setItem(SEEGANG_LAST_WINDOW_REFRESH_KEY, windowId)
    } catch {
      // localStorage is optional here.
    }
  }

  function getLastBodenAnalysisRefresh () {
    try {
      return localStorage.getItem(BODEN_LAST_ANALYSIS_REFRESH_KEY)
    } catch {
      return null
    }
  }

  function setLastBodenAnalysisRefresh (cycleId) {
    try {
      localStorage.setItem(BODEN_LAST_ANALYSIS_REFRESH_KEY, cycleId)
    } catch {
      // localStorage is optional here.
    }
  }

  function getLastBodenForecastRunRefresh () {
    try {
      return localStorage.getItem(BODEN_LAST_FORECAST_RUN_REFRESH_KEY)
    } catch {
      return null
    }
  }

  function setLastBodenForecastRunRefresh (runId) {
    try {
      localStorage.setItem(BODEN_LAST_FORECAST_RUN_REFRESH_KEY, runId)
    } catch {
      // localStorage is optional here.
    }
  }

  function getWetterlageCacheKeys (regionKey) {
    return REGIONAL_WETTERLAGE_CACHE_KEYS[regionKey] || {
      text: WETTERLAGE_TEXT_CACHE_KEY,
      run: WETTERLAGE_RUN_CACHE_KEY,
      source: WETTERLAGE_SOURCE_CACHE_KEY,
      updatedAt: WETTERLAGE_UPDATED_AT_CACHE_KEY
    }
  }

  function getCachedWetterlageText (regionKey) {
    const cacheKeys = getWetterlageCacheKeys(regionKey)
    try {
      return normalizeWetterlageText(localStorage.getItem(cacheKeys.text))
    } catch {
      return null
    }
  }

  function getCachedWetterlageRun (regionKey) {
    const cacheKeys = getWetterlageCacheKeys(regionKey)
    try {
      return localStorage.getItem(cacheKeys.run)
    } catch {
      return null
    }
  }

  function getCachedWetterlageUpdatedAt (regionKey) {
    const cacheKeys = getWetterlageCacheKeys(regionKey)
    try {
      return localStorage.getItem(cacheKeys.updatedAt)
    } catch {
      return null
    }
  }

  function getCachedSeaTimeseriesPayload (regionKey) {
    const cacheKey =
      regionKey === 'nordsee' ? NORDSEE_TS_CACHE_KEY : OSTSEE_TS_CACHE_KEY

    try {
      const serializedPayload = localStorage.getItem(cacheKey)
      if (!serializedPayload) {
        return null
      }

      return JSON.parse(serializedPayload)
    } catch {
      return null
    }
  }

  function getCachedSeaTimeseriesUpdatedAt (regionKey) {
    const updatedAtCacheKey =
      regionKey === 'nordsee'
        ? NORDSEE_TS_UPDATED_AT_CACHE_KEY
        : OSTSEE_TS_UPDATED_AT_CACHE_KEY

    try {
      const updatedAt = Number(localStorage.getItem(updatedAtCacheKey))
      if (!Number.isFinite(updatedAt)) {
        return null
      }

      return updatedAt
    } catch {
      return null
    }
  }

  function setCachedSeaTimeseriesPayload (regionKey, payload) {
    const cacheKey =
      regionKey === 'nordsee' ? NORDSEE_TS_CACHE_KEY : OSTSEE_TS_CACHE_KEY
    const updatedAtCacheKey =
      regionKey === 'nordsee'
        ? NORDSEE_TS_UPDATED_AT_CACHE_KEY
        : OSTSEE_TS_UPDATED_AT_CACHE_KEY

    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload))
      localStorage.setItem(
        updatedAtCacheKey,
        String(payload.updatedAt || Date.now())
      )
    } catch {
      // localStorage is optional here.
    }
  }

  function setCachedWetterlagePayload (payload, regionKey) {
    const cacheKeys = getWetterlageCacheKeys(regionKey)
    try {
      localStorage.setItem(cacheKeys.text, payload.text)
      localStorage.setItem(cacheKeys.run, payload.modelRunId)
      localStorage.setItem(cacheKeys.source, payload.sourceUrl)
      localStorage.setItem(
        cacheKeys.updatedAt,
        String(payload.updatedAt)
      )
    } catch {
      // localStorage is optional here.
    }
  }

  function getLastKnownImageUrlStorageKey (imageElement) {
    const baseKey = imageElement.dataset.base
    const imagePath = imageElement.dataset.path
    if (!baseKey || !imagePath) {
      return null
    }

    return `${LAST_KNOWN_IMAGE_URL_KEY_PREFIX}${baseKey}:${imagePath}`
  }

  function getLastKnownImageUrl (imageElement) {
    const storageKey = getLastKnownImageUrlStorageKey(imageElement)
    if (!storageKey) {
      return null
    }

    try {
      return localStorage.getItem(storageKey)
    } catch {
      return null
    }
  }

  function setLastKnownImageUrl (imageElement, imageUrl) {
    const storageKey = getLastKnownImageUrlStorageKey(imageElement)
    if (!storageKey || !imageUrl) {
      return
    }

    try {
      localStorage.setItem(storageKey, imageUrl)
    } catch {
      // localStorage is optional here.
    }
  }

  function getPageImages (pageIndex) {
    return IMAGE_ELEMENTS.filter(imageElement => {
      const pageElement = imageElement.closest('.page')
      return pageElement && Number(pageElement.dataset.page) === pageIndex
    })
  }

  function isSeegangPage (pageIndex) {
    return getPageImages(pageIndex).some(
      imageElement => imageElement.dataset.base === 'WX_SEE'
    )
  }

  function isPullToRefreshEnabledPage (pageIndex) {
    return pageIndex !== TEXT_PAGE_INDEX && getPageImages(pageIndex).length > 0
  }

  function padTimePart (value) {
    return String(value).padStart(2, '0')
  }

  function getActiveSeegangRefreshWindowId (now = new Date()) {
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const utcDate = now.getUTCDate()

    for (const hour of SEEGANG_REFRESH_WINDOW_UTC_HOURS) {
      const windowDate = new Date(
        Date.UTC(utcYear, utcMonth - 1, utcDate, hour, 0, 0, 0)
      )
      const minutesDiff = Math.abs(now.getTime() - windowDate.getTime()) / 60000

      if (minutesDiff <= SEEGANG_REFRESH_WINDOW_SPAN_MINUTES) {
        return `${utcYear}-${padTimePart(utcMonth)}-${padTimePart(
          utcDate
        )}-${padTimePart(hour)}`
      }
    }

    return null
  }

  function shouldSkipSeegangRefresh (pageIndex, pageImages) {
    if (!isSeegangPage(pageIndex)) {
      return false
    }

    const hasUnloadedImages = pageImages.some(imageElement => !imageElement.src)
    if (hasUnloadedImages) {
      return false
    }

    const activeWindowId = getActiveSeegangRefreshWindowId()
    if (!activeWindowId) {
      return true
    }

    return getLastSeegangWindowRefresh() === activeWindowId
  }

  function getUtcDateId (dateValue) {
    return `${dateValue.getUTCFullYear()}-${padTimePart(
      dateValue.getUTCMonth() + 1
    )}-${padTimePart(dateValue.getUTCDate())}`
  }

  function getActiveBodenAnalysisCycleId (now = new Date()) {
    const cycleHour =
      now.getUTCHours() >= BODEN_ANALYSIS_CYCLE_UTC_HOURS[1]
        ? BODEN_ANALYSIS_CYCLE_UTC_HOURS[1]
        : BODEN_ANALYSIS_CYCLE_UTC_HOURS[0]

    return `${getUtcDateId(now)}-${padTimePart(cycleHour)}`
  }

  function getActiveBodenForecastRunId (now = new Date()) {
    const currentUtcHour = now.getUTCHours()
    const runDate = new Date(now.getTime())
    let runHour = 12

    if (currentUtcHour >= BODEN_FORECAST_RELEASE_UTC_HOURS.RUN_12) {
      runHour = 12
    } else if (currentUtcHour >= BODEN_FORECAST_RELEASE_UTC_HOURS.RUN_00) {
      runHour = 0
    } else {
      runDate.setUTCDate(runDate.getUTCDate() - 1)
      runHour = 12
    }

    return `${getUtcDateId(runDate)}-${padTimePart(runHour)}`
  }

  function getActiveSeewetterCycleId (now = new Date()) {
    const cycleHour = now.getUTCHours() >= 12 ? 12 : 0
    return `${getUtcDateId(now)}-${padTimePart(cycleHour)}`
  }

  function getBodenRefreshKind (imageElement) {
    const baseKey = imageElement.dataset.base
    const imagePath = imageElement.dataset.path || ''

    if (baseKey !== 'WX_URL') {
      return null
    }

    if (imagePath === 'bwk_bodendruck_na_ana.png') {
      return 'analysis'
    }

    if (imagePath.startsWith('ico_tkboden_na_')) {
      return 'forecast'
    }

    return null
  }

  function shouldSkipBodenRefreshForImage (imageElement, activeCycles) {
    const refreshKind = getBodenRefreshKind(imageElement)

    if (!refreshKind || !imageElement.src) {
      return false
    }

    if (refreshKind === 'analysis') {
      return getLastBodenAnalysisRefresh() === activeCycles.analysisCycleId
    }

    if (refreshKind === 'forecast') {
      return getLastBodenForecastRunRefresh() === activeCycles.forecastRunId
    }

    return false
  }

  function isBodenAnalysisImageElement (imageElement) {
    return (
      imageElement?.dataset?.base === 'WX_URL' &&
      imageElement?.dataset?.path === 'bwk_bodendruck_na_ana.png'
    )
  }

  function getImagePageIndex (imageElement) {
    const pageElement = imageElement?.closest('.page')
    if (!pageElement) {
      return -1
    }

    return Number(pageElement.dataset.page)
  }

  function getSeaTimeseriesConfigForPageIndex (pageIndex) {
    if (pageIndex === NORDSEE_PAGE_INDEX) {
      return {
        key: 'nordsee',
        label: 'Nordsee',
        pageIndex: NORDSEE_PAGE_INDEX,
        sourceUrl: DWD_NORDSEE_3DAY_URL,
        loadingLabel: 'Nordsee-Zeitreihe wird geladen ...',
        offlineLabel:
          'Offline: Keine gespeicherte Nordsee-Zeitreihe verfügbar.',
        unavailableLabel: 'Nordsee-Zeitreihe derzeit nicht verfügbar.'
      }
    }

    if (pageIndex === OSTSEE_PAGE_INDEX) {
      return {
        key: 'ostsee',
        label: 'Ostsee',
        pageIndex: OSTSEE_PAGE_INDEX,
        sourceUrl: DWD_OSTSEE_3DAY_URL,
        loadingLabel: 'Ostsee-Zeitreihe wird geladen ...',
        offlineLabel: 'Offline: Keine gespeicherte Ostsee-Zeitreihe verfügbar.',
        unavailableLabel: 'Ostsee-Zeitreihe derzeit nicht verfügbar.'
      }
    }

    return null
  }

  function getSeaTimeseriesConfigForImageElement (imageElement) {
    return getSeaTimeseriesConfigForPageIndex(getImagePageIndex(imageElement))
  }

  function isSeaTimeseriesImageElement (imageElement) {
    return Boolean(getSeaTimeseriesConfigForImageElement(imageElement))
  }

  function getCurrentLightboxImageElement () {
    if (
      !lightboxImageList.length ||
      currentLightboxImageIndex < 0 ||
      currentLightboxImageIndex >= lightboxImageList.length
    ) {
      return null
    }

    return lightboxImageList[currentLightboxImageIndex]
  }

  function escapeHtml (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function escapeRegExp (value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function normalizeInlineText (text) {
    return String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[\t\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function extractSeaTimeseriesAreaHeader (headerText) {
    const normalizedHeader = normalizeInlineText(headerText)
    const headerMatch = normalizedHeader.match(
      /^(.*?)\s*\(([^)]+)\)\s*WT:\s*([^\s]+\s*[CF]?)/i
    )
    if (!headerMatch) {
      return null
    }

    return {
      areaName: normalizeInlineText(headerMatch[1]),
      position: normalizeInlineText(headerMatch[2]),
      waterTemp: normalizeInlineText(headerMatch[3]).replace(/\s+/g, ' ')
    }
  }

  function parseSeaTimeseriesFromHtml (rawHtml, regionLabel = 'Ostsee') {
    if (!rawHtml) {
      throw new Error(`Leere ${regionLabel}-Zeitreihenquelle`)
    }

    const parsedDocument = new DOMParser().parseFromString(rawHtml, 'text/html')
    const allTables = Array.from(parsedDocument.querySelectorAll('table'))
    const allAreas = []
    const slotOrderMap = new Map()

    allTables.forEach(tableElement => {
      const rowElements = Array.from(tableElement.querySelectorAll('tr'))
      if (!rowElements.length) {
        return
      }

      let currentArea = null

      const flushCurrentArea = () => {
        if (currentArea && currentArea.rows.length) {
          allAreas.push(currentArea)
        }
      }

      rowElements.forEach(rowElement => {
        const cellElements = Array.from(rowElement.querySelectorAll('td,th'))
        if (!cellElements.length) {
          return
        }

        if (cellElements.length === 1) {
          const areaHeader = extractSeaTimeseriesAreaHeader(
            cellElements[0].textContent
          )
          if (areaHeader?.areaName) {
            flushCurrentArea()
            currentArea = {
              ...areaHeader,
              rows: []
            }
          }
          return
        }

        if (!currentArea || cellElements.length < 7) {
          return
        }

        const cellTexts = cellElements.map(cellElement =>
          normalizeInlineText(cellElement.textContent)
        )

        const day = cellTexts[0]
        const hour = cellTexts[1]

        if (!/^(Mo|Di|Mi|Do|Fr|Sa|So)$/i.test(day) || !/^\d{2}$/.test(hour)) {
          return
        }

        const slotKey = `${day}${hour}`
        if (!slotOrderMap.has(slotKey)) {
          slotOrderMap.set(slotKey, slotOrderMap.size)
        }

        currentArea.rows.push({
          slotKey,
          day,
          hour,
          windDirection: cellTexts[2] || '',
          windBft: cellTexts[3] || '',
          gustBft: cellTexts[4] || '',
          waveM: cellTexts[5] || '',
          weather: cellTexts[6] || ''
        })
      })

      flushCurrentArea()
    })

    if (!allAreas.length) {
      throw new Error(
        `Keine ${regionLabel}-Zeitreihen im DWD-Quellformat gefunden`
      )
    }

    const slots = Array.from(slotOrderMap.entries())
      .sort((left, right) => left[1] - right[1])
      .map(([slotKey]) => ({
        key: slotKey,
        label: `${slotKey.slice(0, 2)} ${slotKey.slice(2)}`
      }))

    return {
      slots,
      areas: allAreas
    }
  }

  async function fetchSeaTimeseriesPayload (config) {
    const response = await fetch(config.sourceUrl, {
      cache: 'no-cache'
    })
    if (!response.ok) {
      throw new Error(`${config.label}-Zeitreihe nicht erreichbar`)
    }

    const htmlText = await response.text()
    const parsedTimeseries = parseSeaTimeseriesFromHtml(htmlText, config.label)

    return {
      ...parsedTimeseries,
      sourceUrl: config.sourceUrl,
      updatedAt: Date.now()
    }
  }

  function getWindDirectionSymbol (windDirection) {
    const normalizedDirection = String(windDirection || '')
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace('O', 'E')

    const directionMap = {
      W: '→',
      NW: '↘',
      N: '↓',
      NE: '↙',
      E: '←',
      SE: '↖',
      S: '↑',
      SW: '↗'
    }

    const directionParts = normalizedDirection
      .split('-')
      .map(part => part.trim())
      .filter(Boolean)

    if (!directionParts.length) {
      return '•'
    }

    return directionParts.map(part => directionMap[part] || '•').join('')
  }

  function getBeaufortLevelClassName (value) {
    const values = String(value || '')
      .match(/\d+/g)
      ?.map(Number)
      .filter(Number.isFinite)

    if (!values?.length) {
      return ''
    }

    const maxValue = Math.max(...values)
    if (maxValue >= 8) {
      return 'weatherlage-bft weatherlage-bft--storm'
    }

    if (maxValue >= 6) {
      return 'weatherlage-bft weatherlage-bft--strong'
    }

    return ''
  }

  function getGustBeaufortLevelClassName (value) {
    const values = String(value || '')
      .match(/\d+/g)
      ?.map(Number)
      .filter(Number.isFinite)

    if (!values?.length) {
      return ''
    }

    const maxValue = Math.max(...values)
    if (maxValue >= 8) {
      return 'weatherlage-bft weatherlage-bft--storm'
    }

    if (maxValue >= 6) {
      return 'weatherlage-bft weatherlage-bft--strong'
    }

    return ''
  }

  function renderBftValueMarkup (value) {
    const normalizedValue = String(value || '').trim()
    if (!normalizedValue) {
      return ''
    }

    const levelClassName = getBeaufortLevelClassName(normalizedValue)
    if (!levelClassName) {
      return `<span class="ostsee-ts-value">${escapeHtml(
        normalizedValue
      )}</span>`
    }

    return `<span class="ostsee-ts-value ${levelClassName}">${escapeHtml(
      normalizedValue
    )}</span>`
  }

  function renderGustBftValueMarkup (value) {
    const normalizedValue = String(value || '').trim()
    if (!normalizedValue) {
      return ''
    }

    const levelClassName = getGustBeaufortLevelClassName(normalizedValue)
    const valueWithPrefix = `B${normalizedValue}`
    if (!levelClassName) {
      return `<span class="ostsee-ts-value">${escapeHtml(
        valueWithPrefix
      )}</span>`
    }

    return `<span class="ostsee-ts-value ${levelClassName}">${escapeHtml(
      valueWithPrefix
    )}</span>`
  }

  function getWeatherDisplayValue (weatherCode) {
    const normalizedCode = String(weatherCode || '')
      .toUpperCase()
      .trim()
    if (!normalizedCode) {
      return '·'
    }

    const tokenList = normalizedCode
      .split(/[\s,;/|+-]+/)
      .map(token => token.trim())
      .filter(Boolean)

    const hasAnyCode = codes =>
      codes.some(
        code => tokenList.includes(code) || normalizedCode.includes(code)
      )

    if (hasAnyCode(['TS', 'TSTORM', 'THUNDER', 'THUNDERSTORM'])) {
      return '⛈'
    }

    if (hasAnyCode(['SH', 'SHOWER', 'SHOWERS'])) {
      return '🌦'
    }

    if (hasAnyCode(['RAIN', 'RA'])) {
      return '🌧'
    }

    if (hasAnyCode(['DZ', 'DRIZZLE'])) {
      return '💧'
    }

    return normalizedCode
  }

  function renderWeatherValueMarkup (weatherCode) {
    const normalizedCode = String(weatherCode || '')
      .toUpperCase()
      .trim()

    if (/\bTS\b|THUNDER|TSTORM/.test(normalizedCode)) {
      return '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Gewitterwarnung" aria-label="Gewitterwarnung">⛈⚠</span>'
    }

    if (/\bFOG\b/.test(normalizedCode)) {
      return '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Nebel" aria-label="Nebel">☰⚠</span>'
    }

    if (/\bMIST\b|\bBR\b/.test(normalizedCode)) {
      return '<span class="ostsee-ts-weather ostsee-ts-weather--thunderstorm" title="Dunst / Leichter Nebel" aria-label="Dunst / Leichter Nebel">⚌⚠</span>'
    }

    return `<span class="ostsee-ts-weather">${escapeHtml(
      getWeatherDisplayValue(normalizedCode)
    )}</span>`
  }

  const GEOZEIT_WEEKDAY_TO_UTC = {
    SO: 0,
    MO: 1,
    DI: 2,
    MI: 3,
    DO: 4,
    FR: 5,
    SA: 6
  }

  const GEOZEIT_UTC_WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const GEOZEIT_MOON_CYCLE_DAYS = 29.530588853
  const GEOZEIT_REFERENCE_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0)
  const GEOZEIT_DAY_MS = 24 * 60 * 60 * 1000
  // Meeus (Astronomical Algorithms, ch. 49) new-moon anchor: JDE at cycle k=0 and the JD/UTC epoch.
  const GEOZEIT_MEEUS_REFERENCE_JDE = 2451550.09766
  const GEOZEIT_JULIAN_DAY_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0)
  // Thresholds derived analytically for a 4-day spring/neap window (cos/sin of 2 days on the 29.53d cycle).
  const GEOZEIT_SPRING_THRESHOLD = 0.91
  const GEOZEIT_NEAP_THRESHOLD = 0.41
  const GEOZEIT_SPRING_RETARDATION_DAYS = 1

  // Embedded BSH AdG reference data (Sp/M/Np per UTC calendar day) for AK2.
  const GEOZEIT_ADG_REFERENCE_DATA_BY_YEAR = {}

  function getTidePhaseByKey (phaseKey) {
    if (phaseKey === 'spring') {
      return {
        key: 'spring',
        label: 'Springzeit',
        className: 'ostsee-ts-tide--spring'
      }
    }

    if (phaseKey === 'neap') {
      return {
        key: 'neap',
        label: 'Nippzeit',
        className: 'ostsee-ts-tide--neap'
      }
    }

    if (phaseKey === 'mid') {
      return {
        key: 'mid',
        label: 'Mittzeit',
        className: 'ostsee-ts-tide--mid'
      }
    }

    return {
      key: 'unknown',
      label: 'Unbekannt',
      className: 'ostsee-ts-tide--unknown'
    }
  }

  function getCircularDistance (valueA, valueB, period) {
    const absoluteDistance = Math.abs(valueA - valueB)
    return Math.min(absoluteDistance, period - absoluteDistance)
  }

  function degreesToRadians (degrees) {
    return (degrees * Math.PI) / 180
  }

  function normalizeDegrees (degrees) {
    return ((degrees % 360) + 360) % 360
  }

  // Truncated Meeus (Astronomical Algorithms, ch. 49) periodic correction for
  // New/Full Moon timing. A pure fixed synodic period drifts by up to ~0.4 days
  // per cycle against the real (elliptical-orbit) Moon; this correction removes
  // most of that drift and noticeably improves the match against BSH reference data.
  function getMeeusMoonPhaseCorrectionDays (cycleIndex) {
    const centuries = cycleIndex / 1236.85
    const eccentricityFactor =
      1 - 0.002516 * centuries - 0.0000074 * centuries * centuries
    const sunMeanAnomaly = degreesToRadians(
      normalizeDegrees(2.5534 + 29.1053567 * cycleIndex)
    )
    const moonMeanAnomaly = degreesToRadians(
      normalizeDegrees(201.5643 + 385.81693528 * cycleIndex)
    )
    const moonArgumentOfLatitude = degreesToRadians(
      normalizeDegrees(160.7108 + 390.67050284 * cycleIndex)
    )

    return (
      -0.4072 * Math.sin(moonMeanAnomaly) +
      0.17241 * eccentricityFactor * Math.sin(sunMeanAnomaly) +
      0.01608 * Math.sin(2 * moonMeanAnomaly) +
      0.01039 * Math.sin(2 * moonArgumentOfLatitude) +
      0.00739 *
        eccentricityFactor *
        Math.sin(moonMeanAnomaly - sunMeanAnomaly) -
      0.00514 *
        eccentricityFactor *
        Math.sin(moonMeanAnomaly + sunMeanAnomaly) +
      0.00208 *
        eccentricityFactor *
        eccentricityFactor *
        Math.sin(2 * sunMeanAnomaly)
    )
  }

  // UTC timestamp (ms) of the moon phase at cycleIndex (0 = new moon anchor;
  // add 0.25/0.5/0.75 for first quarter/full moon/last quarter).
  function getMeeusMoonPhaseTimeMs (cycleIndex) {
    const centuries = cycleIndex / 1236.85
    const meanJulianEphemerisDay =
      GEOZEIT_MEEUS_REFERENCE_JDE +
      GEOZEIT_MOON_CYCLE_DAYS * cycleIndex +
      0.00015437 * centuries * centuries
    const correctedJulianEphemerisDay =
      meanJulianEphemerisDay + getMeeusMoonPhaseCorrectionDays(cycleIndex)

    return (
      GEOZEIT_JULIAN_DAY_EPOCH_MS +
      (correctedJulianEphemerisDay - 2451545.0) * GEOZEIT_DAY_MS
    )
  }

  function getNearestMoonPhaseLabel (ageDays) {
    const phaseAnchors = [
      { ageDays: 0, label: 'Neumond' },
      { ageDays: GEOZEIT_MOON_CYCLE_DAYS / 4, label: 'Erstes Viertel' },
      { ageDays: GEOZEIT_MOON_CYCLE_DAYS / 2, label: 'Vollmond' },
      {
        ageDays: (GEOZEIT_MOON_CYCLE_DAYS * 3) / 4,
        label: 'Letztes Viertel'
      }
    ]

    let nearestPhase = phaseAnchors[0]
    let nearestDistance = Number.POSITIVE_INFINITY

    phaseAnchors.forEach(anchor => {
      const distance = getCircularDistance(
        ageDays,
        anchor.ageDays,
        GEOZEIT_MOON_CYCLE_DAYS
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestPhase = anchor
      }
    })

    return nearestPhase.label
  }

  function parseSeaTimeseriesSlot (slot) {
    const candidates = [
      String(slot?.label || '').trim(),
      String(slot?.key || '').trim()
    ]

    for (const candidate of candidates) {
      const match = candidate.match(/^([A-Za-zÄÖÜäöü]{2})\s?(\d{2})$/)
      if (!match) {
        continue
      }

      const weekdayToken = match[1].toUpperCase()
      const utcWeekday = GEOZEIT_WEEKDAY_TO_UTC[weekdayToken]
      const hourUtc = Number(match[2])

      if (!Number.isFinite(utcWeekday) || !Number.isFinite(hourUtc)) {
        continue
      }

      return {
        weekdayToken,
        utcWeekday,
        hourUtc
      }
    }

    return null
  }

  function findClosestUtcDateForSlot (slotInfo, referenceDate) {
    const referenceDayStartUtc = Date.UTC(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
      0,
      0,
      0,
      0
    )

    let bestCandidate = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (let offsetDays = -2; offsetDays <= 9; offsetDays += 1) {
      const candidate = new Date(
        referenceDayStartUtc + offsetDays * GEOZEIT_DAY_MS
      )
      if (candidate.getUTCDay() !== slotInfo.utcWeekday) {
        continue
      }

      candidate.setUTCHours(slotInfo.hourUtc, 0, 0, 0)
      const distance = Math.abs(candidate.getTime() - referenceDate.getTime())

      if (distance < bestDistance) {
        bestCandidate = candidate
        bestDistance = distance
      }
    }

    return bestCandidate
  }

  function inferUtcDatesForTimeseriesSlots (slots, referenceDate = new Date()) {
    if (!Array.isArray(slots) || !slots.length) {
      return []
    }

    const slotDates = []
    let previousDate = null

    slots.forEach(slot => {
      const slotInfo = parseSeaTimeseriesSlot(slot)
      if (!slotInfo) {
        slotDates.push(null)
        return
      }

      if (!previousDate) {
        const initialDate = findClosestUtcDateForSlot(slotInfo, referenceDate)
        slotDates.push(initialDate)
        previousDate = initialDate
        return
      }

      let nextDate = null
      const previousDayStartUtc = Date.UTC(
        previousDate.getUTCFullYear(),
        previousDate.getUTCMonth(),
        previousDate.getUTCDate(),
        0,
        0,
        0,
        0
      )

      for (let offsetDays = 0; offsetDays <= 9; offsetDays += 1) {
        const candidate = new Date(
          previousDayStartUtc + offsetDays * GEOZEIT_DAY_MS
        )
        if (candidate.getUTCDay() !== slotInfo.utcWeekday) {
          continue
        }

        candidate.setUTCHours(slotInfo.hourUtc, 0, 0, 0)
        if (candidate.getTime() > previousDate.getTime()) {
          nextDate = candidate
          break
        }
      }

      slotDates.push(nextDate)
      if (nextDate) {
        previousDate = nextDate
      }
    })

    return slotDates
  }

  function normalizeUtcDate (date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null
    }

    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    )
  }

  function getUtcDateKey (date) {
    const normalizedDate = normalizeUtcDate(date)
    if (!normalizedDate) {
      return null
    }

    const year = String(normalizedDate.getUTCFullYear())
    const month = String(normalizedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(normalizedDate.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function getReferenceTidePhaseForDate (date, referenceDataByYear) {
    if (!referenceDataByYear) {
      return null
    }

    const normalizedDate = normalizeUtcDate(date)
    if (!normalizedDate) {
      return null
    }

    const year = normalizedDate.getUTCFullYear()
    const yearData =
      referenceDataByYear[year] || referenceDataByYear[String(year)]
    if (!yearData) {
      return null
    }

    const dateKey = getUtcDateKey(normalizedDate)
    const referenceCode = yearData[dateKey]
    if (referenceCode === 'Sp') {
      return getTidePhaseByKey('spring')
    }
    if (referenceCode === 'Np') {
      return getTidePhaseByKey('neap')
    }
    if (referenceCode === 'M') {
      return getTidePhaseByKey('mid')
    }

    return null
  }

  function getGeneratorTidePhaseForDate (date, moonPhaseEvents = {}) {
    // firstQuarterDates/lastQuarterDates are accepted for AK3 input compatibility;
    // neap is derived by exclusion from the spring-anchor distance below.
    const { newMoonDates = [], fullMoonDates = [] } = moonPhaseEvents
    const springAnchors = [...newMoonDates, ...fullMoonDates]

    const normalizedDate = normalizeUtcDate(date)
    if (!normalizedDate || !springAnchors.length) {
      return getTidePhaseByKey('mid')
    }

    const distanceDays = springAnchors.reduce((closest, anchor) => {
      const shiftedAnchorMs =
        anchor.getTime() + GEOZEIT_SPRING_RETARDATION_DAYS * GEOZEIT_DAY_MS
      const diffDays =
        (normalizedDate.getTime() - shiftedAnchorMs) / GEOZEIT_DAY_MS
      return Math.abs(diffDays) < Math.abs(closest) ? diffDays : closest
    }, Infinity)

    const angle = (2 * Math.PI * distanceDays) / GEOZEIT_MOON_CYCLE_DAYS
    const springness = Math.abs(Math.cos(angle))

    if (springness >= GEOZEIT_SPRING_THRESHOLD) {
      return getTidePhaseByKey('spring')
    }

    if (springness <= GEOZEIT_NEAP_THRESHOLD) {
      return getTidePhaseByKey('neap')
    }

    return getTidePhaseByKey('mid')
  }

  function getTideAgeDays (date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null
    }

    const elapsedDays =
      (date.getTime() - GEOZEIT_REFERENCE_NEW_MOON_UTC_MS) / GEOZEIT_DAY_MS
    const normalizedAge =
      ((elapsedDays % GEOZEIT_MOON_CYCLE_DAYS) + GEOZEIT_MOON_CYCLE_DAYS) %
      GEOZEIT_MOON_CYCLE_DAYS

    return normalizedAge
  }

  function getAstronomicalTidePhaseForDate (date, options = {}) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return getTidePhaseByKey('unknown')
    }

    const referencePhase = getReferenceTidePhaseForDate(
      date,
      options.referenceDataByYear
    )
    if (referencePhase) {
      return referencePhase
    }

    if (options.moonPhaseEvents) {
      return getGeneratorTidePhaseForDate(date, options.moonPhaseEvents)
    }

    // No explicit anchors supplied: derive them from the same Meeus-based
    // generator so there is a single source of truth for the phase logic
    // (instead of a separate, less accurate age-modulo-cycle approximation).
    const fallbackYear = date.getUTCFullYear()
    const fallbackMoonPhaseEvents = buildMoonPhaseEventsForYears([
      fallbackYear - 1,
      fallbackYear,
      fallbackYear + 1
    ])
    return getGeneratorTidePhaseForDate(date, fallbackMoonPhaseEvents)
  }

  // Computes synthetic new/full/quarter-moon anchors for one calendar year
  // (with a small margin) from the same synodic-cycle constants as the fallback.
  function buildMoonPhaseEventsForYear (year) {
    if (!Number.isFinite(year)) {
      return {
        newMoonDates: [],
        fullMoonDates: [],
        firstQuarterDates: [],
        lastQuarterDates: []
      }
    }

    const yearStartMs = Date.UTC(year, 0, 1)
    const yearEndMs = Date.UTC(year + 1, 0, 1)
    const marginMs = 5 * GEOZEIT_DAY_MS
    const startCycleIndex =
      Math.floor(
        (yearStartMs - GEOZEIT_REFERENCE_NEW_MOON_UTC_MS) /
          (GEOZEIT_MOON_CYCLE_DAYS * GEOZEIT_DAY_MS)
      ) - 1

    const events = {
      newMoonDates: [],
      fullMoonDates: [],
      firstQuarterDates: [],
      lastQuarterDates: []
    }

    let cycleIndex = startCycleIndex
    while (true) {
      const newMoonMs = getMeeusMoonPhaseTimeMs(cycleIndex)
      if (newMoonMs > yearEndMs) {
        break
      }

      const candidates = [
        [events.newMoonDates, newMoonMs],
        [events.firstQuarterDates, getMeeusMoonPhaseTimeMs(cycleIndex + 0.25)],
        [events.fullMoonDates, getMeeusMoonPhaseTimeMs(cycleIndex + 0.5)],
        [events.lastQuarterDates, getMeeusMoonPhaseTimeMs(cycleIndex + 0.75)]
      ]

      candidates.forEach(([targetArray, eventMs]) => {
        if (
          eventMs >= yearStartMs - marginMs &&
          eventMs <= yearEndMs + marginMs
        ) {
          targetArray.push(new Date(eventMs))
        }
      })

      cycleIndex += 1
    }

    return events
  }

  function buildMoonPhaseEventsForYears (years) {
    const merged = {
      newMoonDates: [],
      fullMoonDates: [],
      firstQuarterDates: [],
      lastQuarterDates: []
    }

    Array.from(new Set(years)).forEach(year => {
      const yearEvents = buildMoonPhaseEventsForYear(year)
      merged.newMoonDates.push(...yearEvents.newMoonDates)
      merged.fullMoonDates.push(...yearEvents.fullMoonDates)
      merged.firstQuarterDates.push(...yearEvents.firstQuarterDates)
      merged.lastQuarterDates.push(...yearEvents.lastQuarterDates)
    })

    return merged
  }

  function formatUtcSlotLabel (date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return 'Zeitstufe unbekannt'
    }

    const weekday = GEOZEIT_UTC_WEEKDAY_LABELS[date.getUTCDay()] || '--'
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = String(date.getUTCFullYear())
    const hour = String(date.getUTCHours()).padStart(2, '0')

    return `${weekday} ${day}.${month}.${year} ${hour} UTC`
  }

  function buildNordseeTideIndicatorHeaderRowMarkup (slots) {
    if (!Array.isArray(slots) || !slots.length) {
      return ''
    }

    const slotDates = inferUtcDatesForTimeseriesSlots(slots)
    const slotYears = slotDates
      .filter(
        slotDate =>
          slotDate instanceof Date && !Number.isNaN(slotDate.getTime())
      )
      .map(slotDate => slotDate.getUTCFullYear())
    const moonPhaseEvents = buildMoonPhaseEventsForYears(slotYears)
    const tideCellsMarkup = slots
      .map((slot, slotIndex) => {
        const slotDate = slotDates[slotIndex]
        const ageDays = getTideAgeDays(slotDate)
        const phase = getAstronomicalTidePhaseForDate(slotDate, {
          referenceDataByYear: GEOZEIT_ADG_REFERENCE_DATA_BY_YEAR,
          moonPhaseEvents
        })
        const moonPhaseLabel = Number.isFinite(ageDays)
          ? getNearestMoonPhaseLabel(ageDays)
          : 'Unbekannt'
        const visibleAgeLabel =
          phase.key === 'spring'
            ? 'Spring'
            : phase.key === 'neap'
            ? 'Nipp'
            : phase.key === 'mid'
            ? 'Mitt'
            : '·'
        const compactLabel =
          phase.key === 'spring'
            ? 'Sp'
            : phase.key === 'neap'
            ? 'Np'
            : phase.key === 'mid'
            ? 'Mt'
            : '·'
        const tooltipLabel = `${formatUtcSlotLabel(
          slotDate
        )}\nMondphase: ${moonPhaseLabel}\nPhase: ${phase.label}`

        return `<td class="ostsee-ts-tide-cell"><span class="ostsee-ts-tide-segment ${
          phase.className
        }" title="${escapeHtml(tooltipLabel)}" aria-label="${escapeHtml(
          tooltipLabel
        )}" tabindex="0" data-label-full="${escapeHtml(
          visibleAgeLabel
        )}" data-label-compact="${escapeHtml(compactLabel)}">${escapeHtml(
          visibleAgeLabel
        )}</span></td>`
      })
      .join('')

    return `<tr class="ostsee-ts-tide-row"><th scope="row" class="ostsee-ts-tide-label" aria-label="AdG-Zeile"></th>${tideCellsMarkup}</tr>`
  }

  function buildSeaTimeseriesOverlayMarkup (
    payload,
    { regionLabel = 'Ostsee', regionKey = 'ostsee' } = {}
  ) {
    const slots = Array.isArray(payload?.slots) ? payload.slots : []
    const areas = Array.isArray(payload?.areas) ? payload.areas : []
    if (!slots.length || !areas.length) {
      return ''
    }

    const getSlotDisplayLabel = slot => {
      const normalizedLabel = String(slot?.label || '').trim()
      if (/^[A-Za-z]{2}\s\d{2}$/.test(normalizedLabel)) {
        return normalizedLabel
      }

      const key = String(slot?.key || '').trim()
      if (/^[A-Za-z]{2}\d{2}$/.test(key)) {
        return `${key.slice(0, 2)} ${key.slice(2)}`
      }

      if (/^[A-Za-z]{2}\d{2}$/.test(normalizedLabel)) {
        return `${normalizedLabel.slice(0, 2)} ${normalizedLabel.slice(2)}`
      }

      return normalizedLabel || key || '·'
    }

    const tableHeaderMarkup = slots
      .map(
        slot => `<th scope="col">${escapeHtml(getSlotDisplayLabel(slot))}</th>`
      )
      .join('')

    const tideHeaderRowMarkup =
      regionKey === 'nordsee'
        ? buildNordseeTideIndicatorHeaderRowMarkup(slots)
        : ''

    const tableBodyMarkup = areas
      .map(area => {
        const rowsBySlot = new Map(area.rows.map(row => [row.slotKey, row]))

        const windCells = slots
          .map(slot => {
            const row = rowsBySlot.get(slot.key)
            if (!row) {
              return '<td>·</td>'
            }

            const directionSymbol = getWindDirectionSymbol(row.windDirection)
            const windValueMarkup = renderBftValueMarkup(row.windBft)
            const gustMarkup = renderGustBftValueMarkup(row.gustBft)
            const combinedValueMarkup = gustMarkup
              ? `${windValueMarkup}${gustMarkup}`
              : windValueMarkup

            return `<td><span class="ostsee-ts-wind"><span class="ostsee-ts-dir">${directionSymbol}</span>${combinedValueMarkup}</span></td>`
          })
          .join('')

        const waveCells = slots
          .map(slot => {
            const row = rowsBySlot.get(slot.key)
            const waveValue = row?.waveM ? `${row.waveM}m` : '·'
            return `<td>${escapeHtml(waveValue)}</td>`
          })
          .join('')

        const weatherCells = slots
          .map(slot => {
            const row = rowsBySlot.get(slot.key)
            return `<td>${renderWeatherValueMarkup(row?.weather || '')}</td>`
          })
          .join('')

        const areaMeta = area.waterTemp
          ? `${area.position} · WT ${area.waterTemp}`
          : area.position

        return [
          `<tr class="ostsee-ts-area"><th colspan="${
            slots.length + 1
          }">${escapeHtml(
            area.areaName
          )}<span class="ostsee-ts-meta">${escapeHtml(
            areaMeta
          )}</span></th></tr>`,
          `<tr><th scope="row">⇢</th>${windCells}</tr>`,
          `<tr><th scope="row">≈</th>${waveCells}</tr>`,
          `<tr><th scope="row">☀</th>${weatherCells}</tr>`
        ].join('')
      })
      .join('')

    const updatedLabel = formatTimestamp(payload.updatedAt)
    const cachedWetterlageText = getCachedWetterlageText(regionKey)
    const wetterlageMarkup = cachedWetterlageText
      ? buildWetterlageOverlayMarkup(cachedWetterlageText)
      : ''

    return [
      `<span class="weatherlage-stand">DWD ${escapeHtml(
        regionLabel
      )} Zeitreihe · Stand ${escapeHtml(updatedLabel)}</span>`,
      wetterlageMarkup
        ? `<section class="ostsee-ts-weatherlage" aria-label="Textuelle Wetterlage">${wetterlageMarkup}</section>`
        : '',
      '<div class="ostsee-ts-wrap">',
      '<table class="ostsee-ts-table">',
      `<thead><tr><th scope="col"></th>${tableHeaderMarkup}</tr>${tideHeaderRowMarkup}</thead>`,
      `<tbody>${tableBodyMarkup}</tbody>`,
      '</table>',
      '</div>'
    ].join('')
  }

  async function ensureSeaTimeseriesOverlayContent (config) {
    const cachedPayload = getCachedSeaTimeseriesPayload(config.key)
    const cachedUpdatedAt = getCachedSeaTimeseriesUpdatedAt(config.key)
    const isCacheFresh =
      cachedPayload &&
      cachedUpdatedAt &&
      Date.now() - cachedUpdatedAt <= OSTSEE_TS_CACHE_TTL_MS
    const wetterlageRefreshPromise = navigator.onLine
      ? refreshWetterlageCacheIfNeeded({ regionKey: config.key }).catch(
          () => null
        )
      : Promise.resolve(null)

    const rerenderCachedTimeseries = () => {
      const latestPayload = getCachedSeaTimeseriesPayload(config.key)
      if (!latestPayload || !isLightboxOpen) {
        return
      }

      const currentImageElement = getCurrentLightboxImageElement()
      const activeConfig =
        getSeaTimeseriesConfigForImageElement(currentImageElement)
      if (!activeConfig || activeConfig.key !== config.key) {
        return
      }

      renderWetterlageOverlay(
        buildSeaTimeseriesOverlayMarkup(latestPayload, {
          regionLabel: config.label,
          regionKey: config.key
        }),
        {
          visible: true,
          useRawMarkup: true,
          mode: 'ostsee-timeseries'
        }
      )
    }

    if (cachedPayload) {
      renderWetterlageOverlay(
        buildSeaTimeseriesOverlayMarkup(cachedPayload, {
          regionLabel: config.label,
          regionKey: config.key
        }),
        {
          visible: true,
          useRawMarkup: true,
          mode: 'ostsee-timeseries'
        }
      )
    } else {
      renderWetterlageOverlay(config.loadingLabel, {
        visible: true,
        mode: 'ostsee-timeseries'
      })
    }

    if (!navigator.onLine || isCacheFresh) {
      await wetterlageRefreshPromise
      rerenderCachedTimeseries()

      if (!cachedPayload && !navigator.onLine) {
        renderWetterlageOverlay(config.offlineLabel, {
          visible: true,
          mode: 'ostsee-timeseries'
        })
      }
      return
    }

    try {
      const freshPayload = await fetchSeaTimeseriesPayload(config)
      setCachedSeaTimeseriesPayload(config.key, freshPayload)

      if (!isLightboxOpen) {
        return
      }

      const currentImageElement = getCurrentLightboxImageElement()
      const activeConfig =
        getSeaTimeseriesConfigForImageElement(currentImageElement)
      if (!activeConfig || activeConfig.key !== config.key) {
        return
      }

      renderWetterlageOverlay(
        buildSeaTimeseriesOverlayMarkup(freshPayload, {
          regionLabel: config.label,
          regionKey: config.key
        }),
        {
          visible: true,
          useRawMarkup: true,
          mode: 'ostsee-timeseries'
        }
      )

      await wetterlageRefreshPromise
      rerenderCachedTimeseries()
    } catch {
      if (!cachedPayload) {
        renderWetterlageOverlay(config.unavailableLabel, {
          visible: true,
          mode: 'ostsee-timeseries'
        })
      }
    }
  }

  const WETTERLAGE_WEEKDAY_REGEX =
    /\b(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\b/gi

  const WETTERLAGE_SEA_AREAS = [
    'Südwestliche Nordsee',
    'Deutsche Bucht',
    'Fischer',
    'Skagerrak',
    'Kattegat',
    'Belte und Sund',
    'Westliche Ostsee',
    'Südliche Ostsee',
    'Südöstliche Ostsee'
  ]

  const WETTERLAGE_SEA_AREA_REGEX = new RegExp(
    WETTERLAGE_SEA_AREAS.slice()
      .sort((left, right) => right.length - left.length)
      .map(escapeRegExp)
      .join('|'),
    'gi'
  )

  function highlightSeewetterKeywords (escapedLine) {
    return escapedLine
      .replace(
        WETTERLAGE_WEEKDAY_REGEX,
        '<span class="weatherlage-weekday">$1</span>'
      )
      .replace(
        WETTERLAGE_SEA_AREA_REGEX,
        '<span class="weatherlage-sea-area">$&</span>'
      )
  }

  function highlightBeaufortInWindLine (lineText) {
    const chunks = lineText.split(/(\b(?:1[0-2]|[0-9])\b)/g)

    return chunks
      .map(chunk => {
        if (!/^\d+$/.test(chunk)) {
          return escapeHtml(chunk)
        }

        const beaufortValue = Number(chunk)
        if (beaufortValue >= 8) {
          return `<span class="weatherlage-bft weatherlage-bft--storm">${beaufortValue}</span>`
        }

        if (beaufortValue >= 6) {
          return `<span class="weatherlage-bft weatherlage-bft--strong">${beaufortValue}</span>`
        }

        return escapeHtml(chunk)
      })
      .join('')
  }

  function buildWetterlageOverlayMarkup (message) {
    const normalizedMessage = normalizeWetterlageText(message)
    if (!normalizedMessage) {
      return ''
    }

    const standMatch = normalizedMessage.match(/\n\s*Stand:\s*([^\n]+)\s*$/i)
    const standText = standMatch?.[1] || ''
    const textBody = standMatch
      ? normalizedMessage.slice(0, standMatch.index).trimEnd()
      : normalizedMessage

    const textLines = textBody.split('\n')
    const weatherlageTitleIndex = textLines.findIndex(line =>
      /^(Aktuelle\s+)?Wetterlage(?:\s+und\s+-?entwicklung)?\s*:?\s*$/i.test(
        line.trim()
      )
    )
    const forecastTitleIndex = textLines.findIndex(
      (line, index) =>
        index > weatherlageTitleIndex &&
        /^Vorhersage(?:\s+f[uü]r.*)?\s*:?\s*$/i.test(line.trim())
    )

    const hasCompactWeatherlageTitle =
      weatherlageTitleIndex >= 0 &&
      /Wetterlage\s+und\s+-?entwicklung/i.test(
        textLines[weatherlageTitleIndex]
      )

    if (hasCompactWeatherlageTitle) {
      const weatherlageEndIndex =
        forecastTitleIndex >= 0 ? forecastTitleIndex : textLines.length
      const compactWeatherlageText = textLines
        .slice(weatherlageTitleIndex + 1, weatherlageEndIndex)
        .map(line => line.trim())
        .filter(Boolean)
        .join(' ')

      textLines.splice(
        weatherlageTitleIndex,
        weatherlageEndIndex - weatherlageTitleIndex,
        [textLines[weatherlageTitleIndex].trim(), compactWeatherlageText]
          .filter(Boolean)
          .join(' ')
      )
    }

    const renderedLines = textLines
      .map((line, index, lines) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) {
          let lookaheadIndex = index + 1
          while (
            lookaheadIndex < lines.length &&
            !String(lines[lookaheadIndex]).trim()
          ) {
            lookaheadIndex += 1
          }

          const nextContentLine = lines[lookaheadIndex] || ''
          if (/^Sicht\s*\/\s*Wetter\s*:/i.test(nextContentLine.trim())) {
            return null
          }

          return ''
        }

        const compactWeatherlageMatch = trimmedLine.match(
          /^((?:Aktuelle\s+)?Wetterlage(?:\s+und\s+-?entwicklung)?)\s*:\s*(.+)$/i
        )
        if (compactWeatherlageMatch) {
          return `<span class="weatherlage-section-title">${escapeHtml(
            compactWeatherlageMatch[1]
          )}:</span> ${highlightSeewetterKeywords(
            escapeHtml(compactWeatherlageMatch[2])
          )}`
        }

        if (
          /^(Aktuelle\s+)?Wetterlage(?:\s+und\s+-?entwicklung)?\s*:?\s*$/i.test(
            trimmedLine
          )
        ) {
          return `<span class="weatherlage-section-title">${escapeHtml(
            trimmedLine
          )}</span>`
        }

        if (/^Vorhersage(?:\s+f[uü]r.*)?\s*:?\s*$/i.test(trimmedLine)) {
          return `<span class="weatherlage-section-title">${escapeHtml(
            trimmedLine
          )}</span>`
        }

        if (/^Wind\s*:/i.test(trimmedLine)) {
          return `<span class="weatherlage-wind-line">${highlightSeewetterKeywords(
            highlightBeaufortInWindLine(line)
          )}</span>`
        }

        return highlightSeewetterKeywords(escapeHtml(line))
      })
      .filter(line => line !== null)
      .join('\n')

    if (!standText) {
      return renderedLines
    }

    return `<span class="weatherlage-stand">Stand: ${escapeHtml(
      standText
    )}</span>\n${renderedLines}`
  }

  function setOstseeTimeseriesToggleState (isCollapsed) {
    const shellElement =
      lightboxWeatherlageElement?.querySelector('.ostsee-ts-shell')
    const toggleButton = shellElement?.querySelector('.ostsee-ts-toggle')

    if (!shellElement) {
      return false
    }

    shellElement.classList.toggle('is-collapsed', isCollapsed)
    lightboxWeatherlageElement?.classList.toggle('is-collapsed', isCollapsed)

    if (toggleButton) {
      toggleButton.setAttribute('aria-expanded', String(!isCollapsed))
      toggleButton.textContent = isCollapsed
        ? 'Zeitreihe öffnen'
        : 'Zeitreihe schließen'
    }

    return isCollapsed
  }

  function renderWetterlageOverlay (
    message,
    { visible = false, useRawMarkup = false, mode = 'default' } = {}
  ) {
    if (!lightboxWeatherlageElement) {
      return
    }

    if (!visible) {
      lightboxWeatherlageElement.classList.add('is-hidden')
      lightboxWeatherlageElement.classList.remove('ostsee-timeseries')
      lightboxWeatherlageElement.classList.remove('is-collapsed')
      lightboxWeatherlageElement.textContent = ''
      return
    }

    const isOstseeTimeseries = mode === 'ostsee-timeseries'
    const shouldStartCollapsed = true

    lightboxWeatherlageElement.classList.toggle(
      'ostsee-timeseries',
      isOstseeTimeseries
    )

    const renderedContent = useRawMarkup
      ? message || ''
      : buildWetterlageOverlayMarkup(message || '')

    lightboxWeatherlageElement.innerHTML = isOstseeTimeseries
      ? `<div class="ostsee-ts-shell">
          <button
            class="ostsee-ts-toggle"
            type="button"
            aria-expanded="false"
          >Zeitreihe öffnen</button>
          <div class="ostsee-ts-content">${renderedContent}</div>
        </div>`
      : renderedContent

    if (isOstseeTimeseries) {
      setOstseeTimeseriesToggleState(shouldStartCollapsed)
    } else {
      lightboxWeatherlageElement.classList.remove('is-collapsed')
    }

    lightboxWeatherlageElement.classList.remove('is-hidden')
  }

  function normalizeWetterlageText (text) {
    if (!text) {
      return ''
    }

    return text
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  function extractTextBlockBetweenHeadings (text, startPattern, endPattern) {
    if (!text) {
      return ''
    }

    const startMatch = text.match(startPattern)
    if (!startMatch || typeof startMatch.index !== 'number') {
      return ''
    }

    const blockStartIndex = startMatch.index
    const textAfterStart = text.slice(blockStartIndex)
    const endMatch = textAfterStart.match(endPattern)
    const blockEndIndex =
      endMatch && typeof endMatch.index === 'number'
        ? blockStartIndex + endMatch.index
        : text.length

    return normalizeWetterlageText(text.slice(blockStartIndex, blockEndIndex))
  }

  function extractWetterlageSection (rawText) {
    const normalizedText = normalizeWetterlageText(rawText)

    const fullForecastBlock = extractTextBlockBetweenHeadings(
      normalizedText,
      /(Aktuelle\s+Wetterlage|Wetterlage)\s*:?/i,
      /\n\s*(?:Deutscher\s+Wetterdienst|Copyright|\$\$|\=)/i
    )
    if (fullForecastBlock) {
      return fullForecastBlock
    }

    const fallbackMatch = normalizedText.match(
      /Wetter-\s*und\s*Warnlage\s*:?\s*([\s\S]*?)(?:\n\s*GEWITTER\b|\n\s*Deutscher\s+Wetterdienst\b|$)/i
    )
    if (fallbackMatch?.[1]) {
      return normalizeWetterlageText(fallbackMatch[1])
    }

    return ''
  }

  function extractSeewetterberichtSection (rawHtml) {
    if (!rawHtml) {
      return ''
    }

    const parsedDocument = new DOMParser().parseFromString(rawHtml, 'text/html')
    const pageText = normalizeWetterlageText(
      parsedDocument.body?.textContent || ''
    )

    const fullSection = extractTextBlockBetweenHeadings(
      pageText,
      /Seewetterbericht\s+für\s+Nord-\s*und\s*Ostsee[\s\S]*?Aktuelle\s+Wetterlage/i,
      /\n\s*(?:Ergänzende\s+Informationen|Verwandte\s+Leistungen|INHALTSVERZEICHNIS)\b/i
    )
    if (fullSection) {
      return fullSection
    }

    const compactSection = extractTextBlockBetweenHeadings(
      pageText,
      /Aktuelle\s+Wetterlage/i,
      /\n\s*(?:Ergänzende\s+Informationen|Verwandte\s+Leistungen|INHALTSVERZEICHNIS)\b/i
    )
    if (compactSection) {
      return compactSection
    }

    return ''
  }

  function extractRegionalWetterlageSection (rawHtml) {
    if (!rawHtml) {
      return ''
    }

    const parsedDocument = new DOMParser().parseFromString(rawHtml, 'text/html')
    const pageText = normalizeWetterlageText(
      parsedDocument.body?.textContent || ''
    )
    return extractTextBlockBetweenHeadings(
      pageText,
      /Wetterlage\s+und\s+-?entwicklung\s*:/i,
      /\n\s*(?:Vorhersagen\s+von|Ergänzende\s+Informationen|Verwandte\s+Leistungen|INHALTSVERZEICHNIS)\b/i
    )
  }

  async function fetchWetterlageFromFeed () {
    const textResponse = await fetch(DWD_MARITIME_FORECAST_URL, {
      cache: 'no-cache'
    })
    if (!textResponse.ok) {
      throw new Error('Wetterlage-Feed nicht erreichbar')
    }

    const textBuffer = await textResponse.arrayBuffer()
    const decodedText = new TextDecoder('latin1').decode(textBuffer)
    const weatherlageText = extractWetterlageSection(decodedText)
    if (!weatherlageText) {
      throw new Error('Abschnitt Wetterlage konnte nicht extrahiert werden')
    }

    return {
      text: weatherlageText,
      sourceUrl: DWD_MARITIME_FORECAST_URL
    }
  }

  async function fetchWetterlageFromSeewetterbericht () {
    const response = await fetch(DWD_SEEWETTERBERICHT_URL, {
      cache: 'no-cache'
    })
    if (!response.ok) {
      throw new Error('Seewetterbericht nicht erreichbar')
    }

    const htmlText = await response.text()
    const weatherlageText = extractSeewetterberichtSection(htmlText)
    if (!weatherlageText) {
      throw new Error('Seewetterbericht konnte nicht extrahiert werden')
    }

    return {
      text: weatherlageText,
      sourceUrl: DWD_SEEWETTERBERICHT_URL
    }
  }

  async function fetchWetterlageFromRegionalPage (regionKey) {
    const regionalUrl =
      regionKey === 'nordsee' ? DWD_NORDSEE_3DAY_URL : DWD_OSTSEE_3DAY_URL
    const regionLabel = regionKey === 'nordsee' ? 'Nordsee' : 'Ostsee'
    const response = await fetch(regionalUrl, {
      cache: 'no-cache'
    })
    if (!response.ok) {
      throw new Error(`${regionLabel}-Wetterlage nicht erreichbar`)
    }

    const htmlText = await response.text()
    const weatherlageText = extractRegionalWetterlageSection(htmlText)
    if (!weatherlageText) {
      throw new Error(`${regionLabel}-Wetterlage nicht gefunden`)
    }

    return {
      text: weatherlageText,
      sourceUrl: regionalUrl
    }
  }

  async function fetchRelevantWetterlage (regionKey) {
    if (regionKey) {
      try {
        return await fetchWetterlageFromRegionalPage(regionKey)
      } catch {
        return fetchWetterlageFromFeed()
      }
    }

    try {
      return await fetchWetterlageFromSeewetterbericht()
    } catch {
      return fetchWetterlageFromFeed()
    }
  }

  async function refreshWetterlageCacheIfNeeded ({
    force = false,
    regionKey
  } = {}) {
    if (!navigator.onLine) {
      return null
    }

    const activeSeewetterCycleId = getActiveSeewetterCycleId()
    const cachedRunId = getCachedWetterlageRun(regionKey)
    const cachedText = getCachedWetterlageText(regionKey)

    if (!force && cachedText && activeSeewetterCycleId === cachedRunId) {
      return null
    }

    const payload = await fetchRelevantWetterlage(regionKey)
    const cachePayload = {
      text: payload.text,
      modelRunId: activeSeewetterCycleId,
      sourceUrl: payload.sourceUrl,
      updatedAt: Date.now()
    }
    setCachedWetterlagePayload(cachePayload, regionKey)

    return cachePayload
  }

  async function preloadWetterlageInBackground () {
    if (!navigator.onLine) {
      return
    }

    try {
      await refreshWetterlageCacheIfNeeded()
    } catch {
      // Preload errors are non-blocking. Overlay fetch handles user-facing fallbacks.
    }
  }

  async function ensureWetterlageOverlayContent () {
    const cachedText = getCachedWetterlageText()
    const cachedUpdatedAt = getCachedWetterlageUpdatedAt()

    if (cachedText) {
      const standTimestamp = getWetterlageSourceTimestamp(
        cachedText,
        cachedUpdatedAt
      )
      const standLabel = formatWetterlageStand(standTimestamp)
      renderWetterlageOverlay(`${cachedText}\n\n${standLabel}`, {
        visible: true
      })
    } else {
      renderWetterlageOverlay('Wetterlage wird geladen ...', { visible: true })
    }

    if (!navigator.onLine) {
      if (!cachedText) {
        renderWetterlageOverlay(
          'Offline: Keine gespeicherte Wetterlage verfügbar.',
          {
            visible: true
          }
        )
      }
      return
    }

    try {
      const cachePayload = await refreshWetterlageCacheIfNeeded()
      if (!cachePayload) {
        return
      }

      if (!isLightboxOpen) {
        return
      }

      const currentImageElement = getCurrentLightboxImageElement()
      if (!isBodenAnalysisImageElement(currentImageElement)) {
        return
      }

      const standTimestamp = getWetterlageSourceTimestamp(
        cachePayload.text,
        cachePayload.updatedAt
      )
      const standLabel = formatWetterlageStand(standTimestamp)
      renderWetterlageOverlay(
        `${cachePayload.text}\n\n${standLabel}`,
        { visible: true }
      )
    } catch {
      if (!cachedText) {
        renderWetterlageOverlay(
          'Wetterlage derzeit nicht verfügbar. Bitte später erneut versuchen.',
          { visible: true }
        )
      }
    }
  }

  function updateWetterlageOverlayForCurrentLightboxImage () {
    if (!isLightboxOpen) {
      renderWetterlageOverlay('', { visible: false })
      return
    }

    const currentImageElement = getCurrentLightboxImageElement()
    const seaTimeseriesConfig =
      getSeaTimeseriesConfigForImageElement(currentImageElement)

    if (seaTimeseriesConfig) {
      void ensureSeaTimeseriesOverlayContent(seaTimeseriesConfig)
      return
    }

    if (!isBodenAnalysisImageElement(currentImageElement)) {
      renderWetterlageOverlay('', { visible: false })
      return
    }

    void ensureWetterlageOverlayContent()
  }

  function runBodenUtcScenarioTest () {
    const utcScenarios = [
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
      }
    ]

    const results = utcScenarios.map(scenario => {
      const now = new Date(scenario.at)
      const analysisCycleId = getActiveBodenAnalysisCycleId(now)
      const forecastRunId = getActiveBodenForecastRunId(now)
      const analysisPass = analysisCycleId === scenario.expectedAnalysis
      const forecastPass = forecastRunId === scenario.expectedForecast

      return {
        at: scenario.at,
        analysisCycleId,
        expectedAnalysis: scenario.expectedAnalysis,
        analysisPass,
        forecastRunId,
        expectedForecast: scenario.expectedForecast,
        forecastPass,
        pass: analysisPass && forecastPass
      }
    })

    const allPassed = results.every(result => result.pass)
    console.group('US-015 UTC Szenario-Test')
    console.table(results)
    if (allPassed) {
      console.info('US-015 UTC Szenario-Test: OK')
    } else {
      console.warn('US-015 UTC Szenario-Test: FEHLER')
    }
    console.groupEnd()
  }

  function updateOfflineUi () {
    if (!offlineBannerElement || !offlineStampElement) {
      return
    }

    const isOffline = !navigator.onLine
    const lastSuccessfulRefresh = getLastSuccessfulRefresh()

    if (isOffline) {
      offlineBannerElement.classList.remove('is-hidden')
      offlineStampElement.textContent = formatTimestamp(lastSuccessfulRefresh)
      return
    }

    offlineBannerElement.classList.add('is-hidden')
  }

  function isiOSSafari () {
    const userAgent = navigator.userAgent
    const isIosDevice =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafariBrowser =
      /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent)

    return isIosDevice && isSafariBrowser
  }

  function isStandaloneApp () {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  }

  function initInstallHint () {
    if (installHintElement && isiOSSafari() && !isStandaloneApp()) {
      installHintElement.classList.remove('is-hidden')
    }
  }

  function openExternalLink (url) {
    if (!url) {
      return
    }

    if (isStandaloneApp() && isiOSSafari()) {
      window.open(url, '_blank')
      return
    }

    window.location.href = url
  }

  function initExternalLinks () {
    const linkButtons = document.querySelectorAll('a.link-btn')
    linkButtons.forEach(link => {
      link.addEventListener('click', event => {
        if (isStandaloneApp() && isiOSSafari()) {
          event.preventDefault()
          openExternalLink(link.href)
        }
      })
    })
  }

  function applyTheme (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }

  function initTheme () {
    // Derive theme from system preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    const theme = prefersDark ? 'night' : 'day'
    applyTheme(theme)

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        const newTheme = e.matches ? 'night' : 'day'
        applyTheme(newTheme)
      })
  }

  function ensureCardStatusElement (cardElement) {
    let badgeElement = cardElement.querySelector('.card-status')

    if (!badgeElement) {
      badgeElement = document.createElement('div')
      badgeElement.className = 'card-status'
      cardElement.appendChild(badgeElement)
    }

    return badgeElement
  }

  function setCardState (imageElement, state) {
    const cardElement = imageElement.closest('.card')
    if (!cardElement) {
      return
    }

    let badgeElement = cardElement.querySelector('.card-status')

    if (state === 'ok') {
      if (badgeElement) {
        badgeElement.remove()
      }
    } else {
      badgeElement = ensureCardStatusElement(cardElement)
      badgeElement.className = `card-status card-status--${state}`

      if (state === 'loading') {
        badgeElement.textContent = '↻'
      }

      if (state === 'error') {
        badgeElement.textContent = '✖'
      }

      if (state === 'offline') {
        badgeElement.textContent = '•'
      }
    }

    const pageElement = imageElement.closest('.page')
    if (pageElement) {
      PAGE_STATE_BY_IMAGE.set(imageElement, {
        pageIndex: Number(pageElement.dataset.page),
        state
      })
    }
  }

  function buildImageUrl (imageElement, timestamp) {
    const baseUrl = IMAGE_BASE_URLS[imageElement.dataset.base]
    const imagePath = imageElement.dataset.path

    if (!baseUrl || !imagePath) {
      return null
    }

    return `${baseUrl}/${imagePath}?t=${timestamp}`
  }

  function refreshVisibleImages (force = false) {
    if (currentPageIndex === TEXT_PAGE_INDEX) {
      updateOfflineUi()
      return
    }

    const currentPageImages = getPageImages(currentPageIndex)

    if (!currentPageImages.length) {
      updateOfflineUi()
      return
    }

    if (
      !force &&
      shouldSkipSeegangRefresh(currentPageIndex, currentPageImages)
    ) {
      updateOfflineUi()
      return
    }

    const timestamp = Date.now()
    let refreshedImageCount = 0
    let refreshedBodenAnalysisCount = 0
    let refreshedBodenForecastCount = 0
    const activeSeegangWindowId = getActiveSeegangRefreshWindowId()
    const activeBodenCycles = {
      analysisCycleId: getActiveBodenAnalysisCycleId(),
      forecastRunId: getActiveBodenForecastRunId()
    }

    currentPageImages.forEach(imageElement => {
      const shouldSkipBodenRefresh =
        !force &&
        shouldSkipBodenRefreshForImage(imageElement, activeBodenCycles)

      if (shouldSkipBodenRefresh) {
        if (!navigator.onLine) {
          setCardState(imageElement, 'offline')
        }
        return
      }

      const bodenRefreshKind = getBodenRefreshKind(imageElement)

      refreshedImageCount += 1
      if (bodenRefreshKind === 'analysis') {
        refreshedBodenAnalysisCount += 1
      }
      if (bodenRefreshKind === 'forecast') {
        refreshedBodenForecastCount += 1
      }

      if (!navigator.onLine) {
        const persistedImageUrl = getLastKnownImageUrl(imageElement)

        if (imageElement.src) {
          setCardState(imageElement, 'offline')
          return
        }

        if (persistedImageUrl) {
          setCardState(imageElement, 'offline')
          imageElement.src = persistedImageUrl
          return
        }

        const fallbackUrl = buildImageUrl(imageElement, timestamp)
        if (!fallbackUrl) {
          return
        }

        setCardState(imageElement, 'offline')
        imageElement.src = fallbackUrl
        return
      }

      const imageUrl = buildImageUrl(imageElement, timestamp)
      if (!imageUrl) {
        return
      }

      setCardState(imageElement, 'loading')
      imageElement.src = imageUrl
    })

    if (navigator.onLine && refreshedImageCount > 0) {
      setLastSuccessfulRefresh(Date.now())

      if (isSeegangPage(currentPageIndex) && activeSeegangWindowId) {
        setLastSeegangWindowRefresh(activeSeegangWindowId)
      }

      if (refreshedBodenAnalysisCount > 0) {
        setLastBodenAnalysisRefresh(activeBodenCycles.analysisCycleId)
      }

      if (refreshedBodenForecastCount > 0) {
        setLastBodenForecastRunRefresh(activeBodenCycles.forecastRunId)
      }
    }

    updateOfflineUi()
  }

  function goToPage (pageIndex) {
    // Cyclic navigation: wrap around at boundaries
    currentPageIndex =
      ((pageIndex % PAGE_NAMES.length) + PAGE_NAMES.length) % PAGE_NAMES.length

    if (carouselElement) {
      carouselElement.style.transform = `translateX(${
        -currentPageIndex * 100
      }vw)`
    }

    if (currentPageIndex === 0) {
      void preloadWetterlageInBackground()
    }

    refreshVisibleImages()
  }

  function getGalleryImagesForPage (imageElement) {
    const pageElement = imageElement.closest('.page')

    if (!pageElement) {
      return {
        list: IMAGE_ELEMENTS,
        index: IMAGE_ELEMENTS.indexOf(imageElement)
      }
    }

    const pageIndex = Number(pageElement.dataset.page)
    const pageImages = IMAGE_ELEMENTS.filter(candidateImageElement => {
      const candidatePageElement = candidateImageElement.closest('.page')
      return (
        candidatePageElement &&
        Number(candidatePageElement.dataset.page) === pageIndex
      )
    })

    const imageIndex = pageImages.indexOf(imageElement)

    return {
      list: pageImages.length ? pageImages : IMAGE_ELEMENTS,
      index: imageIndex >= 0 ? imageIndex : IMAGE_ELEMENTS.indexOf(imageElement)
    }
  }

  function resetLightboxZoom () {
    lightboxScale = LIGHTBOX_MIN_SCALE
    lightboxOffsetX = 0
    lightboxOffsetY = 0
    applyLightboxTransform()
  }

  function getWrappedLightboxIndex (index) {
    if (!lightboxImageList.length) {
      return -1
    }

    return (index + lightboxImageList.length) % lightboxImageList.length
  }

  function setLightboxPeekImage (peekElement, listIndex) {
    if (!peekElement || !lightboxImageList.length) {
      return
    }

    const imageElement = lightboxImageList[getWrappedLightboxIndex(listIndex)]
    const imageSource = imageElement?.src

    if (!imageSource || lightboxImageList.length < 2) {
      peekElement.classList.remove('is-visible')
      peekElement.removeAttribute('src')
      return
    }

    peekElement.src = imageSource
    peekElement.classList.add('is-visible')
  }

  function updateLightboxPeekImages () {
    if (!lightboxPeekPreviousElement || !lightboxPeekNextElement) {
      return
    }

    if (!isLightboxOpen || !lightboxImageList.length) {
      lightboxPeekPreviousElement.classList.remove('is-visible')
      lightboxPeekPreviousElement.removeAttribute('src')
      lightboxPeekNextElement.classList.remove('is-visible')
      lightboxPeekNextElement.removeAttribute('src')
      return
    }

    setLightboxPeekImage(
      lightboxPeekPreviousElement,
      currentLightboxImageIndex - 1
    )
    setLightboxPeekImage(lightboxPeekNextElement, currentLightboxImageIndex + 1)
  }

  function getLightboxBounds () {
    const imageRect = lightboxImageElement.getBoundingClientRect()
    const renderedWidth = lightboxImageElement.offsetWidth || imageRect.width
    const renderedHeight = lightboxImageElement.offsetHeight || imageRect.height
    const overflowX = Math.max(0, renderedWidth * (lightboxScale - 1))
    const overflowY = Math.max(0, renderedHeight * (lightboxScale - 1))

    return {
      minOffsetX: -overflowX / 2,
      maxOffsetX: overflowX / 2,
      minOffsetY: -overflowY / 2,
      maxOffsetY: overflowY / 2
    }
  }

  function clampValue (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function applyElasticResistance (value, min, max) {
    if (value < min) {
      const overflow = min - value
      return (
        min -
        Math.min(
          LIGHTBOX_ELASTIC_MAX_PX,
          overflow * LIGHTBOX_ELASTIC_RESISTANCE
        )
      )
    }

    if (value > max) {
      const overflow = value - max
      return (
        max +
        Math.min(
          LIGHTBOX_ELASTIC_MAX_PX,
          overflow * LIGHTBOX_ELASTIC_RESISTANCE
        )
      )
    }

    return value
  }

  function clampLightboxPan (mode = 'strict') {
    const bounds = getLightboxBounds()

    if (mode === 'elastic') {
      lightboxOffsetX = applyElasticResistance(
        lightboxOffsetX,
        bounds.minOffsetX,
        bounds.maxOffsetX
      )
      lightboxOffsetY = applyElasticResistance(
        lightboxOffsetY,
        bounds.minOffsetY,
        bounds.maxOffsetY
      )
      return
    }

    lightboxOffsetX = clampValue(
      lightboxOffsetX,
      bounds.minOffsetX,
      bounds.maxOffsetX
    )
    lightboxOffsetY = clampValue(
      lightboxOffsetY,
      bounds.minOffsetY,
      bounds.maxOffsetY
    )
  }

  function isLightboxPanOutsideBounds () {
    const bounds = getLightboxBounds()

    return (
      lightboxOffsetX < bounds.minOffsetX ||
      lightboxOffsetX > bounds.maxOffsetX ||
      lightboxOffsetY < bounds.minOffsetY ||
      lightboxOffsetY > bounds.maxOffsetY
    )
  }

  function clearLightboxSnapbackState () {
    clearTimeout(lightboxSnapbackTimerId)
    lightboxElement?.classList.remove('lb-snapback')
  }

  function beginLightboxPanGesture (clientX, clientY) {
    isLightboxPanning = true
    didLightboxPanInGesture = false
    lightboxPanStartX = clientX
    lightboxPanStartY = clientY
    clearLightboxSnapbackState()
    lightboxElement?.classList.add('lb-dragging')
  }

  function markLightboxPanGesture (clientX, clientY) {
    if (didLightboxPanInGesture) {
      return
    }

    const deltaX = clientX - lightboxPanStartX
    const deltaY = clientY - lightboxPanStartY
    didLightboxPanInGesture =
      Math.abs(deltaX) >= LIGHTBOX_PAN_GESTURE_THRESHOLD_PX ||
      Math.abs(deltaY) >= LIGHTBOX_PAN_GESTURE_THRESHOLD_PX
  }

  function endLightboxPanGesture () {
    if (!isLightboxPanning) {
      return
    }

    isLightboxPanning = false
    lightboxElement?.classList.remove('lb-dragging')

    if (!isLightboxPanOutsideBounds()) {
      return
    }

    lightboxElement?.classList.add('lb-snapback')
    applyLightboxTransform('strict')
    lightboxSnapbackTimerId = window.setTimeout(() => {
      lightboxElement?.classList.remove('lb-snapback')
    }, LIGHTBOX_SNAPBACK_DURATION_MS)
  }

  function applyLightboxTransform (mode = 'strict') {
    clampLightboxPan(mode)
    lightboxImageElement.style.transform = `translate(${
      lightboxOffsetX + lightboxImageShiftX
    }px, ${lightboxOffsetY}px) scale(${lightboxScale})`
    lightboxImageElement.style.transformOrigin = 'center center'
    lightboxImageElement.style.cursor = isLightboxPanning
      ? 'grabbing'
      : lightboxScale > 1
      ? 'grab'
      : 'zoom-out'

    if (lightboxElement) {
      lightboxElement.classList.toggle('lb-zoomed', lightboxScale > 1)
    }
  }

  function showLightboxNavigationTemporarily () {
    if (!lightboxElement) {
      return
    }

    lightboxElement.classList.add('lb-show')
    clearTimeout(lightboxHideTimerId)
    lightboxHideTimerId = window.setTimeout(() => {
      lightboxElement.classList.remove('lb-show')
    }, LIGHTBOX_NAV_HIDE_DELAY_MS)
  }

  function showLightboxImageAt (nextIndex, direction = 0) {
    if (!lightboxImageList.length) {
      return
    }

    currentLightboxImageIndex =
      (nextIndex + lightboxImageList.length) % lightboxImageList.length
    const imageElement = lightboxImageList[currentLightboxImageIndex]

    if (!imageElement || !imageElement.src) {
      return
    }

    clearTimeout(lightboxAnimationTimerId)
    lightboxImageShiftX = 0
    lightboxElement?.classList.remove('lb-animating')

    lightboxImageElement.src = imageElement.src
    resetLightboxZoom()

    if (direction !== 0 && lightboxElement) {
      lightboxElement.classList.add('lb-animating')
      lightboxImageShiftX =
        direction > 0 ? -LIGHTBOX_IMAGE_SHIFT_PX : LIGHTBOX_IMAGE_SHIFT_PX
      applyLightboxTransform()
      window.requestAnimationFrame(() => {
        lightboxImageShiftX = 0
        applyLightboxTransform()
      })

      lightboxAnimationTimerId = window.setTimeout(() => {
        lightboxElement.classList.remove('lb-animating')
      }, LIGHTBOX_IMAGE_SHIFT_DURATION_MS)
    }

    updateLightboxPeekImages()
    showLightboxNavigationTemporarily()
    updateWetterlageOverlayForCurrentLightboxImage()
  }

  function showPreviousLightboxImage () {
    showLightboxImageAt(currentLightboxImageIndex - 1, -1)
  }

  function showNextLightboxImage () {
    showLightboxImageAt(currentLightboxImageIndex + 1, 1)
  }

  function openLightboxForImage (imageElement) {
    if (!imageElement.src) {
      return
    }

    const gallery = getGalleryImagesForPage(imageElement)
    lightboxImageList = gallery.list
    currentLightboxImageIndex = gallery.index

    lightboxImageElement.src = imageElement.src
    resetLightboxZoom()
    lightboxElement.classList.add('open', 'lb-show')
    lightboxElement.setAttribute('aria-hidden', 'false')
    isLightboxOpen = true
    updateLightboxPeekImages()
    showLightboxNavigationTemporarily()
    updateWetterlageOverlayForCurrentLightboxImage()
  }

  function closeLightbox () {
    lightboxElement.classList.remove('open', 'lb-show')
    lightboxElement.setAttribute('aria-hidden', 'true')
    lightboxImageElement.src = ''
    lightboxImageShiftX = 0
    lightboxImageList = []
    currentLightboxImageIndex = -1
    isLightboxOpen = false
    clearTimeout(lightboxHideTimerId)
    clearTimeout(lightboxAnimationTimerId)
    clearLightboxSnapbackState()
    lightboxElement.classList.remove('lb-animating', 'lb-zoomed', 'lb-dragging')
    isLightboxPanning = false
    didLightboxPanInGesture = false
    updateLightboxPeekImages()
    renderWetterlageOverlay('', { visible: false })
    resetLightboxZoom()
  }

  function getTouchDistance (touches) {
    const deltaX = touches[0].clientX - touches[1].clientX
    const deltaY = touches[0].clientY - touches[1].clientY
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  function startLightboxSwipe (clientX, clientY) {
    lightboxSwipeStartX = clientX
    lightboxSwipeStartY = clientY
    lightboxSwipeStartTimestamp = Date.now()
  }

  function finishLightboxSwipe (clientX, clientY) {
    if (lightboxSwipeStartX === null || lightboxSwipeStartY === null) {
      return
    }

    const deltaX = clientX - lightboxSwipeStartX
    const deltaY = clientY - lightboxSwipeStartY
    const gestureDurationMs = Date.now() - lightboxSwipeStartTimestamp

    if (lightboxScale > 1) {
      lightboxSwipeStartX = null
      lightboxSwipeStartY = null
      return
    }

    if (
      gestureDurationMs <= LIGHTBOX_PAGE_SWIPE_MAX_DURATION_MS &&
      Math.abs(deltaX) >= LIGHTBOX_PAGE_SWIPE_MIN_DISTANCE_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) {
        showNextLightboxImage()
      } else {
        showPreviousLightboxImage()
      }
    } else {
      showLightboxNavigationTemporarily()
    }

    lightboxSwipeStartX = null
    lightboxSwipeStartY = null
  }

  function isUpperAirImage (imagePath) {
    return (
      imagePath.includes('ico_500ht') ||
      imagePath.includes('ico_700rf') ||
      imagePath.includes('ico_850ht')
    )
  }

  function getUpperAirInfoText (imagePath) {
    if (imagePath.includes('ico_500ht')) {
      return '500 hPa (~5,5 km): Großwetterlage & Steuerung. Jets und Trog/Keil zeigen Entwicklung und Zugbahnen.'
    }

    if (imagePath.includes('ico_700rf')) {
      return '700 hPa (~3 km): Relative Feuchte. Gut für mittelhohe Bewölkung und Niederschlagstendenzen.'
    }

    if (imagePath.includes('ico_850ht')) {
      return '850 hPa (~1,5 km): Luftmasse und Temperatur/Advektion. Gut für Boden-Trends und Frontnähe.'
    }

    return ''
  }

  function showInfoOverlay (imageElement) {
    const infoText = getUpperAirInfoText(imageElement.dataset.path || '')
    if (!infoText) {
      return
    }

    const cardElement = imageElement.closest('.card')
    if (!cardElement) {
      return
    }

    let overlayElement = cardElement.querySelector('.info-overlay')
    if (!overlayElement) {
      overlayElement = document.createElement('div')
      overlayElement.className = 'info-overlay'
      cardElement.appendChild(overlayElement)
    }

    overlayElement.textContent = infoText
    overlayElement.classList.add('show')
    window.setTimeout(() => {
      overlayElement.classList.remove('show')
    }, INFO_OVERLAY_DURATION_MS)
  }

  function startLongPress (imageElement) {
    const imagePath = imageElement.dataset.path || ''
    if (!isUpperAirImage(imagePath)) {
      return
    }

    didTriggerLongPress = false
    clearTimeout(longPressTimerId)
    longPressTimerId = window.setTimeout(() => {
      didTriggerLongPress = true
      showInfoOverlay(imageElement)
    }, LONG_PRESS_DURATION_MS)
  }

  function cancelLongPress () {
    clearTimeout(longPressTimerId)
  }

  function startPageSwipe (clientX, clientY) {
    pageSwipeStartX = clientX
    pageSwipeStartY = clientY
    pageSwipeStartTimestamp = Date.now()
  }

  function finishPageSwipe (clientX, clientY) {
    if (pageSwipeStartX === null || pageSwipeStartY === null) {
      return
    }

    const deltaX = clientX - pageSwipeStartX
    const deltaY = clientY - pageSwipeStartY
    const gestureDurationMs = Date.now() - pageSwipeStartTimestamp

    if (
      gestureDurationMs <= PAGE_SWIPE_MAX_DURATION_MS &&
      Math.abs(deltaX) >= PAGE_SWIPE_MIN_DISTANCE_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) {
        goToPage(currentPageIndex + 1)
      } else {
        goToPage(currentPageIndex - 1)
      }
    }

    pageSwipeStartX = null
    pageSwipeStartY = null
  }

  function handleEdgeTap (clientX) {
    const viewportWidth = window.innerWidth || 0

    if (clientX <= EDGE_TAP_ZONE_PX) {
      goToPage(currentPageIndex - 1)
      return true
    }

    if (clientX >= viewportWidth - EDGE_TAP_ZONE_PX) {
      goToPage(currentPageIndex + 1)
      return true
    }

    return false
  }

  function startPullRefresh (clientY) {
    // Only track pull-to-refresh if at top of viewport and on allowed pages
    if (
      viewportElement.scrollTop === 0 &&
      isPullToRefreshEnabledPage(currentPageIndex)
    ) {
      pullRefreshStartY = clientY
      pullRefreshStartTimestamp = Date.now()
    }
  }

  function finishPullRefresh (clientY) {
    if (pullRefreshStartY === null) {
      return
    }

    const deltaY = clientY - pullRefreshStartY
    const gestureDurationMs = Date.now() - pullRefreshStartTimestamp
    const PULL_REFRESH_MIN_DISTANCE_PX = 60
    const PULL_REFRESH_MAX_DURATION_MS = 800

    // Trigger refresh if pull was downward, fast, and at top
    if (
      deltaY >= PULL_REFRESH_MIN_DISTANCE_PX &&
      gestureDurationMs <= PULL_REFRESH_MAX_DURATION_MS &&
      viewportElement.scrollTop === 0 &&
      isPullToRefreshEnabledPage(currentPageIndex) &&
      !isLightboxOpen
    ) {
      refreshVisibleImages(true)
    }

    pullRefreshStartY = null
    pullRefreshStartTimestamp = 0
  }

  IMAGE_ELEMENTS.forEach(imageElement => {
    setCardState(imageElement, 'loading')

    imageElement.addEventListener('load', () => {
      imageElement.classList.add('image-loaded')
      setLastKnownImageUrl(
        imageElement,
        imageElement.currentSrc || imageElement.src || null
      )
      setCardState(imageElement, navigator.onLine ? 'ok' : 'offline')
    })

    imageElement.addEventListener('error', () => {
      if (navigator.onLine) {
        setCardState(imageElement, 'error')
      } else {
        const hadPriorLoad =
          imageElement.classList.contains('image-loaded') ||
          Boolean(getLastKnownImageUrl(imageElement))
        setCardState(imageElement, hadPriorLoad ? 'offline' : 'error')
      }
    })

    imageElement.addEventListener('click', event => {
      // Preserve edge navigation on desktop even when an image covers the edge.
      if (!isLightboxOpen && handleEdgeTap(event.clientX)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      if (didTriggerLongPress) {
        event.preventDefault()
        event.stopPropagation()
        didTriggerLongPress = false
        return
      }

      openLightboxForImage(imageElement)
    })

    imageElement.addEventListener(
      'touchstart',
      () => startLongPress(imageElement),
      { passive: true }
    )
    imageElement.addEventListener('touchend', cancelLongPress, {
      passive: true
    })
    imageElement.addEventListener('touchcancel', cancelLongPress, {
      passive: true
    })
    imageElement.addEventListener('mousedown', () =>
      startLongPress(imageElement)
    )
    imageElement.addEventListener('mouseup', cancelLongPress)
    imageElement.addEventListener('mouseleave', cancelLongPress)
  })

  window.addEventListener('online', () => {
    updateOfflineUi()
    void preloadWetterlageInBackground()
    IMAGE_ELEMENTS.forEach(imageElement => {
      const cardElement = imageElement.closest('.card')
      const statusBadge = cardElement?.querySelector('.card-status')
      const hadError = statusBadge?.classList.contains('card-status--error')
      const wasOffline = statusBadge?.classList.contains('card-status--offline')
      if (hadError || wasOffline) {
        setCardState(imageElement, 'loading')
        const timestamp = Date.now()
        const imageUrl = buildImageUrl(imageElement, timestamp)
        if (imageUrl) {
          imageElement.src = imageUrl
        }
      }
    })
    refreshVisibleImages()
  })

  window.addEventListener('offline', () => {
    updateOfflineUi()
    lastImageStatesBeforeOffline.clear()

    IMAGE_ELEMENTS.forEach(imageElement => {
      const pageElement = imageElement.closest('.page')
      if (
        pageElement &&
        Number(pageElement.dataset.page) === currentPageIndex
      ) {
        const cardElement = imageElement.closest('.card')
        const statusBadge = cardElement?.querySelector('.card-status')
        if (statusBadge) {
          lastImageStatesBeforeOffline.set(imageElement, statusBadge.className)
        }
        setCardState(imageElement, 'offline')
      }
    })
  })

  installHintCloseButton?.addEventListener('click', () => {
    installHintElement.classList.add('is-hidden')
  })

  lightboxPreviousButton?.addEventListener('click', event => {
    event.stopPropagation()
    showPreviousLightboxImage()
  })

  lightboxNextButton?.addEventListener('click', event => {
    event.stopPropagation()
    showNextLightboxImage()
  })

  lightboxElement.addEventListener('click', event => {
    if (event.target === lightboxElement) {
      closeLightbox()
    }
  })

  lightboxWeatherlageElement?.addEventListener('click', event => {
    const toggleButton = event.target.closest('.ostsee-ts-toggle')
    if (toggleButton) {
      event.stopPropagation()
      const shellElement = toggleButton.closest('.ostsee-ts-shell')
      const isCollapsed = shellElement
        ? !shellElement.classList.contains('is-collapsed')
        : false
      setOstseeTimeseriesToggleState(isCollapsed)
      return
    }

    event.stopPropagation()
  })

  lightboxWeatherlageElement?.addEventListener(
    'touchstart',
    event => {
      event.stopPropagation()
    },
    { passive: true }
  )

  lightboxWeatherlageElement?.addEventListener(
    'wheel',
    event => {
      event.stopPropagation()
    },
    { passive: true }
  )

  lightboxImageElement.addEventListener('click', event => {
    event.stopPropagation()
    if (isLightboxOpen) {
      showLightboxNavigationTemporarily()
    }
  })

  lightboxImageElement.addEventListener(
    'wheel',
    event => {
      if (!isLightboxOpen) {
        return
      }

      event.preventDefault()

      const zoomDelta =
        event.deltaY < 0 ? LIGHTBOX_WHEEL_STEP : -LIGHTBOX_WHEEL_STEP
      lightboxScale = Math.min(
        LIGHTBOX_MAX_SCALE,
        Math.max(LIGHTBOX_MIN_SCALE, lightboxScale + zoomDelta)
      )

      if (lightboxScale === LIGHTBOX_MIN_SCALE) {
        lightboxOffsetX = 0
        lightboxOffsetY = 0
      }

      applyLightboxTransform('strict')
      showLightboxNavigationTemporarily()
    },
    { passive: false }
  )

  lightboxImageElement.addEventListener('pointerdown', event => {
    if (!isLightboxOpen || lightboxScale < LIGHTBOX_PAN_MIN_SCALE) {
      return
    }

    isDraggingLightboxImage = true
    beginLightboxPanGesture(event.clientX, event.clientY)
    dragOriginX = event.clientX - lightboxOffsetX
    dragOriginY = event.clientY - lightboxOffsetY

    if (lightboxImageElement.setPointerCapture) {
      lightboxImageElement.setPointerCapture(event.pointerId)
    }
  })

  lightboxImageElement.addEventListener('pointermove', event => {
    if (
      !isLightboxOpen ||
      !isDraggingLightboxImage ||
      lightboxScale < LIGHTBOX_PAN_MIN_SCALE
    ) {
      return
    }

    markLightboxPanGesture(event.clientX, event.clientY)
    lightboxOffsetX = event.clientX - dragOriginX
    lightboxOffsetY = event.clientY - dragOriginY
    applyLightboxTransform('elastic')
    event.preventDefault()
  })

  lightboxImageElement.addEventListener('pointerup', () => {
    isDraggingLightboxImage = false
    endLightboxPanGesture()
  })

  lightboxImageElement.addEventListener('pointercancel', () => {
    isDraggingLightboxImage = false
    endLightboxPanGesture()
  })

  lightboxImageElement.addEventListener(
    'touchstart',
    event => {
      if (!isLightboxOpen) {
        return
      }

      if (event.touches.length === 2) {
        pinchStartDistance = getTouchDistance(event.touches)
        pinchStartScale = lightboxScale
        didRunPinchGesture = true
        return
      }

      if (
        event.touches.length === 1 &&
        lightboxScale >= LIGHTBOX_PAN_MIN_SCALE
      ) {
        panStartOffsetX = event.touches[0].clientX - lightboxOffsetX
        panStartOffsetY = event.touches[0].clientY - lightboxOffsetY
        beginLightboxPanGesture(
          event.touches[0].clientX,
          event.touches[0].clientY
        )
      }

      const changedTouch = event.changedTouches[0]
      startLightboxSwipe(changedTouch.clientX, changedTouch.clientY)
    },
    { passive: true }
  )

  lightboxImageElement.addEventListener(
    'touchmove',
    event => {
      if (!isLightboxOpen) {
        return
      }

      if (event.touches.length === 2) {
        const currentTouchDistance = getTouchDistance(event.touches)
        const imageRect = lightboxImageElement.getBoundingClientRect()
        const centerX =
          (event.touches[0].clientX + event.touches[1].clientX) / 2
        const centerY =
          (event.touches[0].clientY + event.touches[1].clientY) / 2
        const offsetX = centerX - imageRect.left
        const offsetY = centerY - imageRect.top
        const nextScale = Math.min(
          LIGHTBOX_MAX_SCALE,
          Math.max(
            LIGHTBOX_MIN_SCALE,
            pinchStartScale * (currentTouchDistance / pinchStartDistance)
          )
        )
        const scaleRatio = nextScale / lightboxScale

        lightboxOffsetX = offsetX - (offsetX - lightboxOffsetX) * scaleRatio
        lightboxOffsetY = offsetY - (offsetY - lightboxOffsetY) * scaleRatio
        lightboxScale = nextScale

        if (lightboxScale === LIGHTBOX_MIN_SCALE) {
          lightboxOffsetX = 0
          lightboxOffsetY = 0
        }

        applyLightboxTransform('elastic')
        event.preventDefault()
        return
      }

      if (
        event.touches.length === 1 &&
        lightboxScale >= LIGHTBOX_PAN_MIN_SCALE
      ) {
        markLightboxPanGesture(
          event.touches[0].clientX,
          event.touches[0].clientY
        )
        lightboxOffsetX = event.touches[0].clientX - panStartOffsetX
        lightboxOffsetY = event.touches[0].clientY - panStartOffsetY
        applyLightboxTransform('elastic')
        event.preventDefault()
      }
    },
    { passive: false }
  )

  lightboxImageElement.addEventListener(
    'touchend',
    event => {
      if (!isLightboxOpen) {
        return
      }

      const now = Date.now()

      if (didRunPinchGesture && event.touches.length === 0) {
        didRunPinchGesture = false
        endLightboxPanGesture()
        if (lightboxScale < 1.02) {
          resetLightboxZoom()
        }
        return
      }

      if (event.changedTouches.length !== 1) {
        return
      }

      const changedTouch = event.changedTouches[0]
      endLightboxPanGesture()

      if (now - lastTapTimestamp < LIGHTBOX_DOUBLE_TAP_DELAY_MS) {
        if (lightboxScale > 1) {
          resetLightboxZoom()
        } else {
          lightboxScale = LIGHTBOX_DOUBLE_TAP_SCALE
          lightboxOffsetX = 0
          lightboxOffsetY = 0
          applyLightboxTransform()
        }

        showLightboxNavigationTemporarily()
      } else {
        const deltaX = changedTouch.clientX - lightboxSwipeStartX
        const deltaY = changedTouch.clientY - lightboxSwipeStartY
        const gestureDurationMs = now - lightboxSwipeStartTimestamp
        const isFastEnough =
          gestureDurationMs <= LIGHTBOX_CLOSE_SWIPE_MAX_DURATION_MS
        const isMostlyVertical = Math.abs(deltaY) > Math.abs(deltaX)
        const isSwipeDown = deltaY > LIGHTBOX_CLOSE_SWIPE_MIN_DISTANCE_PX

        if (didLightboxPanInGesture) {
          didLightboxPanInGesture = false
          lastTapTimestamp = now
          return
        }

        // Swipe down is the explicit mobile exit from the zoomed image view.
        if (isFastEnough && isMostlyVertical && isSwipeDown) {
          closeLightbox()
          lastTapTimestamp = now
          return
        }

        finishLightboxSwipe(changedTouch.clientX, changedTouch.clientY)
      }

      lastTapTimestamp = now
    },
    { passive: true }
  )

  viewportElement.addEventListener(
    'touchstart',
    event => {
      if (isLightboxOpen) {
        return
      }

      const changedTouch = event.changedTouches[0]
      startPageSwipe(changedTouch.clientX, changedTouch.clientY)
      startPullRefresh(changedTouch.clientY)
    },
    { passive: true }
  )

  viewportElement.addEventListener(
    'touchend',
    event => {
      if (isLightboxOpen) {
        return
      }

      const changedTouch = event.changedTouches[0]
      finishPageSwipe(changedTouch.clientX, changedTouch.clientY)
      finishPullRefresh(changedTouch.clientY)
    },
    { passive: true }
  )

  viewportElement.addEventListener(
    'pointerup',
    event => {
      if (isLightboxOpen) {
        return
      }

      if (event.pointerType === 'touch') {
        handleEdgeTap(event.clientX)
      }
    },
    { passive: true }
  )

  viewportElement.addEventListener('click', event => {
    if (isLightboxOpen) {
      return
    }

    if (event.target.closest('a, button')) {
      return
    }

    if (event.target.closest('img[data-base][data-path]')) {
      return
    }

    handleEdgeTap(event.clientX)
  })

  function isArrowLeft (event) {
    return event.key === 'ArrowLeft' || event.code === 'ArrowLeft'
  }

  function isArrowRight (event) {
    return event.key === 'ArrowRight' || event.code === 'ArrowRight'
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isLightboxOpen) {
      closeLightbox()
      return
    }

    if (isLightboxOpen) {
      if (isArrowLeft(event)) {
        event.preventDefault()
        showPreviousLightboxImage()
        return
      }

      if (isArrowRight(event)) {
        event.preventDefault()
        showNextLightboxImage()
        return
      }

      return
    }

    if (isArrowLeft(event)) {
      event.preventDefault()
      goToPage(currentPageIndex - 1)
    }

    if (isArrowRight(event)) {
      event.preventDefault()
      goToPage(currentPageIndex + 1)
    }
  })

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./js/sw.js').catch(() => {
        // Service worker support is optional for the app to work.
      })
    })
  }

  initTheme()
  initInstallHint()
  initExternalLinks()

  if (ENABLE_BODEN_UTC_SCENARIO_TEST) {
    runBodenUtcScenarioTest()
  }

  updateOfflineUi()
  goToPage(0)
  refreshVisibleImages()

  window.setInterval(() => {
    if (
      !isLightboxOpen &&
      currentPageIndex !== TEXT_PAGE_INDEX &&
      getPageImages(currentPageIndex).length > 0
    ) {
      refreshVisibleImages()
    }
  }, REFRESH_INTERVAL_MS)
})
