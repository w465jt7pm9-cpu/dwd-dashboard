document.addEventListener('DOMContentLoaded', () => {
  const BASES = {
    WX_URL: 'https://www.dwd.de/DWD/wetter/wv_spez/hobbymet/wetterkarten',
    WX_ROOT: 'https://www.dwd.de/DWD/wetter',
    WX_SEE: 'https://www.dwd.de/DWD/wetter/wv_spez/seewetter'
  };
  const REFRESH_MS = 5 * 60 * 1000;
  const LONG_PRESS_MS = 600;
  const INFO_SHOW_MS = 4500;
  const EDGE_TAP_ZONE = 26;
  const LAST_OK_KEY = 'dwdLastSuccessfulRefresh';
  const THEME_KEY = 'dwdTheme';
  const PAGE_STATE = new Map();

  const viewport = document.getElementById('viewport');
  const carousel = document.getElementById('carousel');
  const pageTitle = document.getElementById('pageTitle');
  const status = document.getElementById('status');
  const pageSummary = document.getElementById('pageSummary');
  const offlineBanner = document.getElementById('offlineBanner');
  const offlineStamp = document.getElementById('offlineStamp');
  const installHint = document.getElementById('installHint');
  const installHintClose = document.getElementById('installHintClose');
  const refreshBtn = document.getElementById('refreshBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const modeBtn = document.getElementById('modeBtn');
  const thumbPrev = document.getElementById('thumbPrev');
  const thumbRefresh = document.getElementById('thumbRefresh');
  const thumbMode = document.getElementById('thumbMode');
  const thumbNext = document.getElementById('thumbNext');
  const lightbox = document.getElementById('lightbox');
  const lightImg = document.getElementById('lightboxImg');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  const pageNames = ['Land', 'See / Seegang', 'Höhenwetter', 'Seewetter Texte'];
  let currentPage = 0;
  const imgsAll = Array.from(document.querySelectorAll('img[data-base][data-path]'));

  function nowTime() {
    return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatTs(ts) {
    if (!ts) return '—';
    try {
      return new Date(Number(ts)).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '—';
    }
  }

  function setStatus(text) { status.textContent = text; }

  function getLastSuccessfulRefresh() {
    try { return localStorage.getItem(LAST_OK_KEY); } catch { return null; }
  }

  function setLastSuccessfulRefresh(ts) {
    try { localStorage.setItem(LAST_OK_KEY, String(ts)); } catch {}
  }

  function updateOfflineUI() {
    const offline = !navigator.onLine;
    const lastOk = getLastSuccessfulRefresh();
    if (offline) {
      offlineBanner.classList.remove('is-hidden');
      offlineStamp.textContent = formatTs(lastOk);
      setStatus(`Offline ${formatTs(lastOk)}`);
    } else {
      offlineBanner.classList.add('is-hidden');
    }
  }

  function isiOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    return isIOS && isSafari;
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function initInstallHint() {
    if (isiOSSafari() && !isStandalone()) installHint.classList.remove('is-hidden');
  }

  installHintClose?.addEventListener('click', () => installHint.classList.add('is-hidden'));

  function applyMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    const icon = mode === 'day' ? '◐' : mode === 'night' ? '☾' : '◑';
    modeBtn.textContent = icon;
    thumbMode.textContent = icon;
  }

  function initMode() {
    let mode = 'day';
    try { mode = localStorage.getItem(THEME_KEY) || 'day'; } catch {}
    applyMode(mode);
  }

  function cycleMode() {
    const current = document.documentElement.getAttribute('data-theme') || 'day';
    const next = current === 'day' ? 'night' : current === 'night' ? 'dim' : 'day';
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    applyMode(next);
  }

  modeBtn?.addEventListener('click', cycleMode);
  thumbMode?.addEventListener('click', cycleMode);

  // Status badges: only show deviations
  function ensureCardStatus(card) {
    let badge = card.querySelector('.card-status');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'card-status';
      card.appendChild(badge);
    }
    return badge;
  }

  function setCardState(img, state) {
    const card = img.closest('.card');
    if (!card) return;
    let badge = card.querySelector('.card-status');

    if (state === 'ok') {
      if (badge) badge.remove();
    } else {
      badge = ensureCardStatus(card);
      badge.className = `card-status card-status--${state}`;
      if (state === 'loading') badge.textContent = '⏳';
      if (state === 'error') badge.textContent = '✕';
      if (state === 'offline') badge.textContent = '○';
    }

    const page = img.closest('.page');
    if (page) {
      PAGE_STATE.set(img, { page: Number(page.dataset.page), state });
      updatePageSummary();
    }
  }

  function updatePageSummary() {
    if (currentPage > 2) {
      pageSummary.textContent = 'Texte';
      return;
    }
    const items = [...PAGE_STATE.values()].filter(v => v.page === currentPage);
    const err = items.filter(v => v.state === 'error').length;
    const off = items.filter(v => v.state === 'offline').length;
    const loading = items.filter(v => v.state === 'loading').length;

    if (off > 0) pageSummary.textContent = `${off} offline`;
    else if (err > 0) pageSummary.textContent = `${err} Fehler`;
    else if (loading > 0) pageSummary.textContent = `${loading} lädt`;
    else pageSummary.textContent = '—';
  }

  imgsAll.forEach((img) => {
    setCardState(img, 'loading');
    img.addEventListener('load', () => setCardState(img, navigator.onLine ? 'ok' : 'offline'));
    img.addEventListener('error', () => setCardState(img, navigator.onLine ? 'error' : 'offline'));
  });

  window.addEventListener('online', () => {
    updateOfflineUI();
    refreshVisible();
  });

  window.addEventListener('offline', () => {
    updateOfflineUI();
    imgsAll.forEach((img) => {
      const page = img.closest('.page');
      if (page && Number(page.dataset.page) === currentPage) setCardState(img, 'offline');
    });
  });

  function buildUrl(img, ts) {
    const base = BASES[img.dataset.base];
    const path = img.dataset.path;
    if (!base || !path) return null;
    return `${base}/${path}?t=${ts}`;
  }

  function refreshVisible() {
    if (currentPage > 2) {
      updateOfflineUI();
      if (navigator.onLine) setStatus(`Aktualisiert ${nowTime()}`);
      updatePageSummary();
      return;
    }

    const ts = Date.now();
    let touched = 0;

    imgsAll.forEach((img) => {
      const page = img.closest('.page');
      if (!page) return;
      if (Number(page.dataset.page) !== currentPage) return;
      touched += 1;
      const url = buildUrl(img, ts);
      if (url) {
        setCardState(img, navigator.onLine ? 'loading' : 'offline');
        img.src = url;
      }
    });

    if (navigator.onLine && touched > 0) {
      setLastSuccessfulRefresh(Date.now());
      setStatus(`Aktualisiert ${nowTime()}`);
    }
    updateOfflineUI();
    updatePageSummary();
  }

  function goTo(n) {
    const next = Math.max(0, Math.min(pageNames.length - 1, n));
    currentPage = next;
    carousel.style.transform = `translateX(${-currentPage * 100}vw)`;
    pageTitle.textContent = pageNames[currentPage];
    refreshVisible();
  }

  refreshBtn?.addEventListener('click', refreshVisible);
  thumbRefresh?.addEventListener('click', refreshVisible);
  prevBtn?.addEventListener('click', () => goTo(currentPage - 1));
  nextBtn?.addEventListener('click', () => goTo(currentPage + 1));
  thumbPrev?.addEventListener('click', () => goTo(currentPage - 1));
  thumbNext?.addEventListener('click', () => goTo(currentPage + 1));

  // Lightbox gallery + zoom
  let gallery = [];
  let galleryIndex = -1;
  let lightboxOpen = false;
  let lightboxHideTimer = null;

  let scale = 1;
  let posX = 0;
  let posY = 0;
  let startDist = 0;
  let startScale = 1;
  let panStartX = 0;
  let panStartY = 0;
  let didPinch = false;
  let lastTap = 0;

  let dragging = false;
  let dragOriginX = 0;
  let dragOriginY = 0;

  let lbX0 = null;
  let lbY0 = null;
  let lbT0 = 0;

  function resetZoom() {
    scale = 1;
    posX = 0;
    posY = 0;
    applyTransform();
  }

  function getBounds() {
    const rect = lightImg.getBoundingClientRect();
    const offsetWidth = lightImg.offsetWidth || rect.width;
    const offsetHeight = lightImg.offsetHeight || rect.height;
    const overflowX = Math.max(0, offsetWidth * (scale - 1));
    const overflowY = Math.max(0, offsetHeight * (scale - 1));
    return { overflowX, overflowY };
  }

  function clampPan() {
    const { overflowX, overflowY } = getBounds();
    const minX = -overflowX;
    const maxX = 0;
    const minY = -overflowY;
    const maxY = 0;
    posX = Math.min(maxX, Math.max(minX, posX));
    posY = Math.min(maxY, Math.max(minY, posY));
  }

  function applyTransform() {
    clampPan();
    lightImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    lightImg.style.transformOrigin = 'center center';
    lightImg.style.cursor = scale > 1 ? 'grab' : 'zoom-out';
  }

  function showArrowsTemporarily() {
    lightbox.classList.add('lb-show');
    clearTimeout(lightboxHideTimer);
    lightboxHideTimer = window.setTimeout(() => lightbox.classList.remove('lb-show'), 1800);
  }

  function computeGalleryFor(img) {
    const page = img.closest('.page');
    if (!page) return { list: imgsAll, index: imgsAll.indexOf(img) };
    const pageIndex = Number(page.dataset.page);
    const list = imgsAll.filter((node) => {
      const p = node.closest('.page');
      return p && Number(p.dataset.page) === pageIndex;
    });
    const index = list.indexOf(img);
    return { list: list.length ? list : imgsAll, index: index >= 0 ? index : imgsAll.indexOf(img) };
  }

  function showGalleryIndex(nextIndex) {
    if (!gallery || gallery.length === 0) return;
    galleryIndex = (nextIndex + gallery.length) % gallery.length;
    const img = gallery[galleryIndex];
    if (img && img.src) {
      lightImg.src = img.src;
      resetZoom();
    }
    showArrowsTemporarily();
  }

  function nextImage() { showGalleryIndex(galleryIndex + 1); }
  function prevImage() { showGalleryIndex(galleryIndex - 1); }

  function openLightboxFrom(img) {
    if (!img.src) return;
    const g = computeGalleryFor(img);
    gallery = g.list;
    galleryIndex = g.index;
    lightImg.src = img.src;
    resetZoom();
    lightbox.classList.add('open', 'lb-show');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxOpen = true;
    showArrowsTemporarily();
  }

  function closeLightbox() {
    lightbox.classList.remove('open', 'lb-show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightImg.src = '';
    gallery = [];
    galleryIndex = -1;
    lightboxOpen = false;
    clearTimeout(lightboxHideTimer);
    resetZoom();
  }

  lbPrev?.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  lbNext?.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightImg.addEventListener('click', (e) => {
    e.stopPropagation();
    if (lightboxOpen) showArrowsTemporarily();
  });

  lightImg.addEventListener('wheel', (e) => {
    if (!lightboxOpen) return;
    e.preventDefault();

    const delta = e.deltaY < 0 ? 0.18 : -0.18;
    scale = Math.min(4, Math.max(1, scale + delta));

    if (scale === 1) {
      posX = 0;
      posY = 0;
    }

    applyTransform();
    showArrowsTemporarily();
  }, { passive: false });


  lightImg.addEventListener('pointerdown', (e) => {
    if (!lightboxOpen || scale <= 1) return;
    dragging = true;
    dragOriginX = e.clientX - posX;
    dragOriginY = e.clientY - posY;
    if (lightImg.setPointerCapture) lightImg.setPointerCapture(e.pointerId);
  });

  lightImg.addEventListener('pointermove', (e) => {
    if (!lightboxOpen || !dragging || scale <= 1) return;
    posX = e.clientX - dragOriginX;
    posY = e.clientY - dragOriginY;
    applyTransform();
    e.preventDefault();
  });

  lightImg.addEventListener('pointerup', () => { dragging = false; });
  lightImg.addEventListener('pointercancel', () => { dragging = false; });

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function lbStart(x, y) {
    lbX0 = x;
    lbY0 = y;
    lbT0 = Date.now();
  }

  function lbEnd(x, y) {
    if (lbX0 === null || lbY0 === null) return;
    const dx = x - lbX0;
    const dy = y - lbY0;
    const dt = Date.now() - lbT0;
    const MIN_DIST = 40;
    const MAX_TIME = 800;

    if (scale > 1) {
      lbX0 = null;
      lbY0 = null;
      return;
    }

    if (dt <= MAX_TIME && Math.abs(dx) >= MIN_DIST && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextImage();
      else prevImage();
    } else {
      showArrowsTemporarily();
    }

    lbX0 = null;
    lbY0 = null;
  }

  lightImg.addEventListener('touchstart', (e) => {
    if (!lightboxOpen) return;

    if (e.touches.length === 2) {
      startDist = getDistance(e.touches);
      startScale = scale;
      didPinch = true;
      return;
    }

    if (e.touches.length === 1 && scale > 1) {
      panStartX = e.touches[0].clientX - posX;
      panStartY = e.touches[0].clientY - posY;
    }

    const t = e.changedTouches[0];
    lbStart(t.clientX, t.clientY);
  }, { passive: true });

  lightImg.addEventListener('touchmove', (e) => {
    if (!lightboxOpen) return;

  if (e.touches.length === 2) {
    const dist = getDistance(e.touches);

    // Mittelpunkt zwischen den beiden Fingern
    const rect = lightImg.getBoundingClientRect();
    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    // Position relativ zum Bild
    const offsetX = centerX - rect.left;
    const offsetY = centerY - rect.top;

    // Neuen Zoomwert berechnen
    const newScale = Math.min(4, Math.max(1, startScale * (dist / startDist)));

    // Zoom auf den Finger-Mittelpunkt beziehen
    const scaleRatio = newScale / scale;

    posX = offsetX - (offsetX - posX) * scaleRatio;
    posY = offsetY - (offsetY - posY) * scaleRatio;

    scale = newScale;

    if (scale === 1) {
      posX = 0;
      posY = 0;
    }

    applyTransform();
    e.preventDefault();
    return;
  }

    if (e.touches.length === 1 && scale > 1) {
      posX = e.touches[0].clientX - panStartX;
      posY = e.touches[0].clientY - panStartY;
      applyTransform();
      e.preventDefault();
    }
  }, { passive: false });

  lightImg.addEventListener('touchend', (e) => {
    if (!lightboxOpen) return;

    const now = Date.now();

    if (didPinch && e.touches.length === 0) {
      didPinch = false;
      if (scale < 1.02) resetZoom();
      return;
    }

    if (e.changedTouches.length === 1) {
      const t = e.changedTouches[0];

      if (now - lastTap < 300) {
        if (scale > 1) {
          resetZoom();
        } else {
          scale = 2;
          posX = 0;
          posY = 0;
          applyTransform();
        }
        showArrowsTemporarily();
      } else {
        const dx = t.clientX - lbX0;
        const dy = t.clientY - lbY0;
        const dt = now - lbT0;
        const isFastEnough = dt <= 700;
        const isMostlyVertical = Math.abs(dy) > Math.abs(dx);
        const isSwipeDown = dy > 80;

        // Ein klarer Swipe nach unten schließt die Zoomansicht auf Touch-Geräten.
        if (isFastEnough && isMostlyVertical && isSwipeDown) {
          closeLightbox();
          lastTap = now;
          return;
        }

        lbEnd(t.clientX, t.clientY);
      }

      lastTap = now;
    }
  }, { passive: true });

  function isUpperAir(path) {
    return path.includes('ico_500ht') || path.includes('ico_700rf') || path.includes('ico_850ht');
  }

  function getInfoText(path) {
    if (path.includes('ico_500ht')) return '500 hPa (~5,5 km): Großwetterlage & Steuerung. Jets und Trog/Keil zeigen Entwicklung und Zugbahnen.';
    if (path.includes('ico_700rf')) return '700 hPa (~3 km): Relative Feuchte. Gut für mittelhohe Bewölkung und Niederschlagstendenzen.';
    if (path.includes('ico_850ht')) return '850 hPa (~1,5 km): Luftmasse und Temperatur/Advektion. Gut für Boden-Trends und Frontnähe.';
    return '';
  }

  let pressTimer = null;
  let longPressFired = false;

  function showInfoOverlay(img) {
    const text = getInfoText(img.dataset.path || '');
    if (!text) return;
    const card = img.closest('.card');
    if (!card) return;

    let overlay = card.querySelector('.info-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'info-overlay';
      card.appendChild(overlay);
    }

    overlay.textContent = text;
    overlay.classList.add('show');
    window.setTimeout(() => overlay.classList.remove('show'), INFO_SHOW_MS);
  }

  function startLongPress(img) {
    const path = img.dataset.path || '';
    if (!isUpperAir(path)) return;
    longPressFired = false;
    clearTimeout(pressTimer);
    pressTimer = window.setTimeout(() => {
      longPressFired = true;
      showInfoOverlay(img);
    }, LONG_PRESS_MS);
  }

  function cancelLongPress() { clearTimeout(pressTimer); }

  imgsAll.forEach((img) => {
    img.addEventListener('click', (e) => {
      if (longPressFired) {
        e.preventDefault();
        e.stopPropagation();
        longPressFired = false;
        return;
      }
      openLightboxFrom(img);
    });

    img.addEventListener('touchstart', () => startLongPress(img), { passive: true });
    img.addEventListener('touchend', cancelLongPress, { passive: true });
    img.addEventListener('touchcancel', cancelLongPress, { passive: true });
    img.addEventListener('mousedown', () => startLongPress(img));
    img.addEventListener('mouseup', cancelLongPress);
    img.addEventListener('mouseleave', cancelLongPress);
  });

  // Page swipe + edge tap
  let x0 = null;
  let y0 = null;
  let t0 = 0;

  function onStart(x, y) {
    x0 = x;
    y0 = y;
    t0 = Date.now();
  }

  function onEnd(x, y) {
    if (x0 === null || y0 === null) return;
    const dx = x - x0;
    const dy = y - y0;
    const dt = Date.now() - t0;
    const MIN_DIST = 50;
    const MAX_TIME = 800;

    if (dt <= MAX_TIME && Math.abs(dx) >= MIN_DIST && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goTo(currentPage + 1);
      else goTo(currentPage - 1);
    }

    x0 = null;
    y0 = null;
  }

  viewport.addEventListener('touchstart', (e) => {
    if (lightboxOpen) return;
    const t = e.changedTouches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (lightboxOpen) return;
    const t = e.changedTouches[0];
    onEnd(t.clientX, t.clientY);
  }, { passive: true });

  function handleEdgeTap(clientX) {
    const w = window.innerWidth || 0;
    if (clientX <= EDGE_TAP_ZONE) { goTo(currentPage - 1); return true; }
    if (clientX >= (w - EDGE_TAP_ZONE)) { goTo(currentPage + 1); return true; }
    return false;
  }

  viewport.addEventListener('pointerup', (e) => {
    if (lightboxOpen) return;
    if (e.pointerType === 'touch') handleEdgeTap(e.clientX);
  }, { passive: true });

  viewport.addEventListener('click', (e) => {
    if (lightboxOpen) return;
    if (e.target.closest('a, button')) return;
    if (e.target.closest('img[data-base][data-path]')) return;
    handleEdgeTap(e.clientX);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOpen) { closeLightbox(); return; }

    if (lightboxOpen) {
      if (e.key === 'ArrowLeft') { prevImage(); return; }
      if (e.key === 'ArrowRight') { nextImage(); return; }
      return;
    }

    if (e.key === 'ArrowLeft') goTo(currentPage - 1);
    if (e.key === 'ArrowRight') goTo(currentPage + 1);
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  initMode();
  initInstallHint();
  updateOfflineUI();
  goTo(0);
  refreshVisible();
  window.setInterval(() => {
    if (currentPage <= 2 && !lightboxOpen) refreshVisible();
  }, REFRESH_MS);
});
