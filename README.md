# DWD Wetter Dashboard

Interaktive Darstellung von DWD-Wetterkarten  
optimiert für Desktop und Touch-Geräte.

Release-Stand: 1.3

Teststatus (2026-06-20): Erfolgreich abgeschlossen (US-015/US-016, End-to-End geprueft).

## 🚀 Live

👉 https://dwd-dashboard.pages.dev

## 🧱 Tech Stack

- HTML
- CSS (modular strukturiert)
- Vanilla JavaScript
- Cloudflare Pages (Deployment)

## 📱 Fokus

- stabiles Touch-Verhalten
- zuverlässige Navigation
- robuste Lightbox

## ✅ Highlights (Release 1.1)

- zyklische Navigation im Carousel (Swipe, Edge-Tap, Tastatur)
- Lightbox mit Peek-Nachbarn, Zoom, Elastic Pan und Soft Snap-Back
- Seegangskarten für Nordsee und Ostsee integriert
- gezoomte Ostsee-Lightbox mit Inhaltsfenster je Karte
- Windy-aehnliche Ostsee-Zeitreihenansicht (Wind, Boeen, Welle, Wetter)
- mobile-optimierte Ostsee-Zeitreihenansicht mit optionalem Ein-/Ausklappen auf kleinen Displays
- globaler Seegang-Datenzyklus (~07/~19 UTC) für alle WX_SEE-Seiten
- verbesserte Offline-Nutzung mit Cache-Wiederverwendung und Reconnect-Refresh
- stabiler Offline-Bildstand auch bei Resize/Orientierungswechsel

## 🧭 Hinweise

- Architektur-, UI- und Interaktionsdokumente liegen im Ordner `docs/`
- User Stories und Umsetzungsstand: `docs/backlog.md`
