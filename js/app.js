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
  const SEEGANG_PAGE_INDEXES = [NORDSEE_PAGE_INDEX, OSTSEE_PAGE_INDEX]
  const NORDSEE_REFRESH_WINDOW_UTC_HOURS = [7, 19]
  const NORDSEE_REFRESH_WINDOW_SPAN_MINUTES = 90

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
  const SEEGANG_LAST_WINDOW_REFRESH_KEY_BY_PAGE = {
    [NORDSEE_PAGE_INDEX]: 'dwdNordseeLastWindowRefresh',
    [OSTSEE_PAGE_INDEX]: 'dwdOstseeLastWindowRefresh'
  }
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

  function getLastSeegangWindowRefresh (pageIndex) {
    const storageKey = SEEGANG_LAST_WINDOW_REFRESH_KEY_BY_PAGE[pageIndex]
    if (!storageKey) {
      return null
    }

    try {
      return localStorage.getItem(storageKey)
    } catch {
      return null
    }
  }

  function setLastSeegangWindowRefresh (pageIndex, windowId) {
    const storageKey = SEEGANG_LAST_WINDOW_REFRESH_KEY_BY_PAGE[pageIndex]
    if (!storageKey) {
      return
    }

    try {
      localStorage.setItem(storageKey, windowId)
    } catch {
      // localStorage is optional here.
    }
  }

  function padTimePart (value) {
    return String(value).padStart(2, '0')
  }

  function getActiveSeegangRefreshWindowId (now = new Date()) {
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const utcDate = now.getUTCDate()

    for (const hour of NORDSEE_REFRESH_WINDOW_UTC_HOURS) {
      const windowDate = new Date(
        Date.UTC(utcYear, utcMonth - 1, utcDate, hour, 0, 0, 0)
      )
      const minutesDiff = Math.abs(now.getTime() - windowDate.getTime()) / 60000

      if (minutesDiff <= NORDSEE_REFRESH_WINDOW_SPAN_MINUTES) {
        return `${utcYear}-${padTimePart(utcMonth)}-${padTimePart(
          utcDate
        )}-${padTimePart(hour)}`
      }
    }

    return null
  }

  function shouldSkipSeegangRefresh (pageImages) {
    if (!SEEGANG_PAGE_INDEXES.includes(currentPageIndex)) {
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

    return getLastSeegangWindowRefresh(currentPageIndex) === activeWindowId
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

  function refreshVisibleImages () {
    if (currentPageIndex === TEXT_PAGE_INDEX) {
      updateOfflineUi()
      return
    }

    const currentPageImages = IMAGE_ELEMENTS.filter(imageElement => {
      const pageElement = imageElement.closest('.page')
      return (
        pageElement && Number(pageElement.dataset.page) === currentPageIndex
      )
    })

    if (!currentPageImages.length) {
      updateOfflineUi()
      return
    }

    if (shouldSkipSeegangRefresh(currentPageImages)) {
      updateOfflineUi()
      return
    }

    const timestamp = Date.now()
    let refreshedImageCount = 0
    const activeSeegangWindowId = getActiveSeegangRefreshWindowId()

    currentPageImages.forEach(imageElement => {
      refreshedImageCount += 1
      const imageUrl = buildImageUrl(imageElement, timestamp)
      if (!imageUrl) {
        return
      }

      setCardState(imageElement, navigator.onLine ? 'loading' : 'offline')
      imageElement.src = imageUrl
    })

    if (navigator.onLine && refreshedImageCount > 0) {
      setLastSuccessfulRefresh(Date.now())

      if (
        SEEGANG_PAGE_INDEXES.includes(currentPageIndex) &&
        activeSeegangWindowId
      ) {
        setLastSeegangWindowRefresh(currentPageIndex, activeSeegangWindowId)
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
    if (viewportElement.scrollTop === 0 && currentPageIndex <= 2) {
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
      currentPageIndex <= 2 &&
      !isLightboxOpen
    ) {
      refreshVisibleImages()
    }

    pullRefreshStartY = null
    pullRefreshStartTimestamp = 0
  }

  IMAGE_ELEMENTS.forEach(imageElement => {
    setCardState(imageElement, 'loading')

    imageElement.addEventListener('load', () => {
      imageElement.classList.add('image-loaded')
      setCardState(imageElement, navigator.onLine ? 'ok' : 'offline')
    })

    imageElement.addEventListener('error', () => {
      setCardState(imageElement, navigator.onLine ? 'error' : 'offline')
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
    refreshVisibleImages()
  })

  window.addEventListener('offline', () => {
    updateOfflineUi()

    IMAGE_ELEMENTS.forEach(imageElement => {
      const pageElement = imageElement.closest('.page')
      if (
        pageElement &&
        Number(pageElement.dataset.page) === currentPageIndex
      ) {
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
  updateOfflineUi()
  goToPage(0)
  refreshVisibleImages()

  window.setInterval(() => {
    if (currentPageIndex <= OSTSEE_PAGE_INDEX && !isLightboxOpen) {
      refreshVisibleImages()
    }
  }, REFRESH_INTERVAL_MS)
})
