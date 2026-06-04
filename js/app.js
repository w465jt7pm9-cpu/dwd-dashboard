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
  const TEXT_PAGE_INDEX = 3

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

  const PAGE_SWIPE_MIN_DISTANCE_PX = 50
  const PAGE_SWIPE_MAX_DURATION_MS = 800

  const LAST_SUCCESSFUL_REFRESH_KEY = 'dwdLastSuccessfulRefresh'
  const THEME_STORAGE_KEY = 'dwdTheme'

  const PAGE_NAMES = ['Land', 'See / Seegang', 'Höhenwetter', 'Seewetter Texte']
  const IMAGE_ELEMENTS = Array.from(
    document.querySelectorAll('img[data-base][data-path]')
  )
  const PAGE_STATE_BY_IMAGE = new Map()

  const viewportElement = document.getElementById('viewport')
  const carouselElement = document.getElementById('carousel')
  const pageTitleElement = document.getElementById('pageTitle')
  const statusElement = document.getElementById('status')
  const pageSummaryElement = document.getElementById('pageSummary')
  const offlineBannerElement = document.getElementById('offlineBanner')
  const offlineStampElement = document.getElementById('offlineStamp')
  const installHintElement = document.getElementById('installHint')
  const installHintCloseButton = document.getElementById('installHintClose')
  const refreshButton = document.getElementById('refreshBtn')
  const previousPageButton = document.getElementById('prevBtn')
  const nextPageButton = document.getElementById('nextBtn')
  const themeButton = document.getElementById('modeBtn')
  const thumbPreviousButton = document.getElementById('thumbPrev')
  const thumbRefreshButton = document.getElementById('thumbRefresh')
  const thumbThemeButton = document.getElementById('thumbMode')
  const thumbNextButton = document.getElementById('thumbNext')
  const lightboxElement = document.getElementById('lightbox')
  const lightboxImageElement = document.getElementById('lightboxImg')
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

  let pageSwipeStartX = null
  let pageSwipeStartY = null
  let pageSwipeStartTimestamp = 0

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

  function setStatusLabel (text) {
    if (statusElement) {
      statusElement.textContent = text
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

  function updateOfflineUi () {
    if (!offlineBannerElement || !offlineStampElement) {
      return
    }

    const isOffline = !navigator.onLine
    const lastSuccessfulRefresh = getLastSuccessfulRefresh()

    if (isOffline) {
      offlineBannerElement.classList.remove('is-hidden')
      offlineStampElement.textContent = formatTimestamp(lastSuccessfulRefresh)
      setStatusLabel(`Offline ${formatTimestamp(lastSuccessfulRefresh)}`)
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

  function applyTheme (theme) {
    document.documentElement.setAttribute('data-theme', theme)

    const themeIcon = theme === 'day' ? '☀' : theme === 'night' ? '🌙' : '✨'

    if (themeButton) {
      themeButton.textContent = themeIcon
    }

    if (thumbThemeButton) {
      thumbThemeButton.textContent = themeIcon
    }
  }

  function initTheme () {
    let theme = 'day'

    try {
      theme = localStorage.getItem(THEME_STORAGE_KEY) || 'day'
    } catch {
      theme = 'day'
    }

    applyTheme(theme)
  }

  function toggleTheme () {
    const currentTheme =
      document.documentElement.getAttribute('data-theme') || 'day'
    const nextTheme =
      currentTheme === 'day'
        ? 'night'
        : currentTheme === 'night'
        ? 'dim'
        : 'day'

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // localStorage is optional here.
    }

    applyTheme(nextTheme)
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

  function updatePageSummary () {
    if (!pageSummaryElement) {
      return
    }

    if (currentPageIndex === TEXT_PAGE_INDEX) {
      pageSummaryElement.textContent = ''
      return
    }

    const currentPageStates = [...PAGE_STATE_BY_IMAGE.values()].filter(
      pageState => pageState.pageIndex === currentPageIndex
    )
    const errorCount = currentPageStates.filter(
      pageState => pageState.state === 'error'
    ).length
    const offlineCount = currentPageStates.filter(
      pageState => pageState.state === 'offline'
    ).length
    const loadingCount = currentPageStates.filter(
      pageState => pageState.state === 'loading'
    ).length

    if (offlineCount > 0) {
      pageSummaryElement.textContent = `${offlineCount} offline`
      return
    }

    if (errorCount > 0) {
      pageSummaryElement.textContent = `${errorCount} Fehler`
      return
    }

    if (loadingCount > 0) {
      pageSummaryElement.textContent = `${loadingCount} lädt`
      return
    }

    pageSummaryElement.textContent = '—'
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
      updatePageSummary()
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
      updatePageSummary()
      return
    }

    const timestamp = Date.now()
    let refreshedImageCount = 0

    IMAGE_ELEMENTS.forEach(imageElement => {
      const pageElement = imageElement.closest('.page')
      if (!pageElement) {
        return
      }

      if (Number(pageElement.dataset.page) !== currentPageIndex) {
        return
      }

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
      setStatusLabel(`Aktualisiert ${getCurrentTimeLabel()}`)
    }

    updateOfflineUi()
    updatePageSummary()
  }

  function goToPage (pageIndex) {
    const boundedPageIndex = Math.max(
      0,
      Math.min(PAGE_NAMES.length - 1, pageIndex)
    )

    currentPageIndex = boundedPageIndex
    if (carouselElement) {
      carouselElement.style.transform = `translateX(${
        -currentPageIndex * 100
      }vw)`
    }

    if (pageTitleElement) {
      pageTitleElement.textContent = PAGE_NAMES[currentPageIndex]
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

  function getLightboxBounds () {
    const imageRect = lightboxImageElement.getBoundingClientRect()
    const renderedWidth = lightboxImageElement.offsetWidth || imageRect.width
    const renderedHeight = lightboxImageElement.offsetHeight || imageRect.height

    return {
      overflowX: Math.max(0, renderedWidth * (lightboxScale - 1)),
      overflowY: Math.max(0, renderedHeight * (lightboxScale - 1))
    }
  }

  function clampLightboxPan () {
    const { overflowX, overflowY } = getLightboxBounds()

    const minOffsetX = -overflowX
    const maxOffsetX = 0
    const minOffsetY = -overflowY
    const maxOffsetY = 0

    lightboxOffsetX = Math.min(
      maxOffsetX,
      Math.max(minOffsetX, lightboxOffsetX)
    )
    lightboxOffsetY = Math.min(
      maxOffsetY,
      Math.max(minOffsetY, lightboxOffsetY)
    )
  }

  function applyLightboxTransform () {
    clampLightboxPan()
    lightboxImageElement.style.transform = `translate(${lightboxOffsetX}px, ${lightboxOffsetY}px) scale(${lightboxScale})`
    lightboxImageElement.style.transformOrigin = 'center center'
    lightboxImageElement.style.cursor = lightboxScale > 1 ? 'grab' : 'zoom-out'
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

  function showLightboxImageAt (nextIndex) {
    if (!lightboxImageList.length) {
      return
    }

    currentLightboxImageIndex =
      (nextIndex + lightboxImageList.length) % lightboxImageList.length
    const imageElement = lightboxImageList[currentLightboxImageIndex]

    if (!imageElement || !imageElement.src) {
      return
    }

    lightboxImageElement.src = imageElement.src
    resetLightboxZoom()
    showLightboxNavigationTemporarily()
  }

  function showPreviousLightboxImage () {
    showLightboxImageAt(currentLightboxImageIndex - 1)
  }

  function showNextLightboxImage () {
    showLightboxImageAt(currentLightboxImageIndex + 1)
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
    showLightboxNavigationTemporarily()
  }

  function closeLightbox () {
    lightboxElement.classList.remove('open', 'lb-show')
    lightboxElement.setAttribute('aria-hidden', 'true')
    lightboxImageElement.src = ''
    lightboxImageList = []
    currentLightboxImageIndex = -1
    isLightboxOpen = false
    clearTimeout(lightboxHideTimerId)
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

  IMAGE_ELEMENTS.forEach(imageElement => {
    setCardState(imageElement, 'loading')

    imageElement.addEventListener('load', () => {
      setCardState(imageElement, navigator.onLine ? 'ok' : 'offline')
    })

    imageElement.addEventListener('error', () => {
      setCardState(imageElement, navigator.onLine ? 'error' : 'offline')
    })

    imageElement.addEventListener('click', event => {
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

  themeButton?.addEventListener('click', toggleTheme)
  thumbThemeButton?.addEventListener('click', toggleTheme)
  refreshButton?.addEventListener('click', refreshVisibleImages)
  thumbRefreshButton?.addEventListener('click', refreshVisibleImages)
  previousPageButton?.addEventListener('click', () =>
    goToPage(currentPageIndex - 1)
  )
  nextPageButton?.addEventListener('click', () =>
    goToPage(currentPageIndex + 1)
  )
  thumbPreviousButton?.addEventListener('click', () =>
    goToPage(currentPageIndex - 1)
  )
  thumbNextButton?.addEventListener('click', () =>
    goToPage(currentPageIndex + 1)
  )

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

      applyLightboxTransform()
      showLightboxNavigationTemporarily()
    },
    { passive: false }
  )

  lightboxImageElement.addEventListener('pointerdown', event => {
    if (!isLightboxOpen || lightboxScale <= 1) {
      return
    }

    isDraggingLightboxImage = true
    dragOriginX = event.clientX - lightboxOffsetX
    dragOriginY = event.clientY - lightboxOffsetY

    if (lightboxImageElement.setPointerCapture) {
      lightboxImageElement.setPointerCapture(event.pointerId)
    }
  })

  lightboxImageElement.addEventListener('pointermove', event => {
    if (!isLightboxOpen || !isDraggingLightboxImage || lightboxScale <= 1) {
      return
    }

    lightboxOffsetX = event.clientX - dragOriginX
    lightboxOffsetY = event.clientY - dragOriginY
    applyLightboxTransform()
    event.preventDefault()
  })

  lightboxImageElement.addEventListener('pointerup', () => {
    isDraggingLightboxImage = false
  })

  lightboxImageElement.addEventListener('pointercancel', () => {
    isDraggingLightboxImage = false
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

      if (event.touches.length === 1 && lightboxScale > 1) {
        panStartOffsetX = event.touches[0].clientX - lightboxOffsetX
        panStartOffsetY = event.touches[0].clientY - lightboxOffsetY
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

        applyLightboxTransform()
        event.preventDefault()
        return
      }

      if (event.touches.length === 1 && lightboxScale > 1) {
        lightboxOffsetX = event.touches[0].clientX - panStartOffsetX
        lightboxOffsetY = event.touches[0].clientY - panStartOffsetY
        applyLightboxTransform()
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
        if (lightboxScale < 1.02) {
          resetLightboxZoom()
        }
        return
      }

      if (event.changedTouches.length !== 1) {
        return
      }

      const changedTouch = event.changedTouches[0]

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

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isLightboxOpen) {
      closeLightbox()
      return
    }

    if (isLightboxOpen) {
      if (event.key === 'ArrowLeft') {
        showPreviousLightboxImage()
        return
      }

      if (event.key === 'ArrowRight') {
        showNextLightboxImage()
        return
      }

      return
    }

    if (event.key === 'ArrowLeft') {
      goToPage(currentPageIndex - 1)
    }

    if (event.key === 'ArrowRight') {
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
  updateOfflineUi()
  goToPage(0)
  refreshVisibleImages()

  window.setInterval(() => {
    if (currentPageIndex <= 2 && !isLightboxOpen) {
      refreshVisibleImages()
    }
  }, REFRESH_INTERVAL_MS)
})
