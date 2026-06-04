# DWD Wetter Dashboard

## 🎯 Ziel
# Interaktive Darstellung von DWD‑Wetterkarten mit stabiler Bedienung auf **PC**, **iPad** und **iPhone**.

Fokus:
- zuverlässiges Laden
- natürliches Zoom‑Verhalten
- klare Navigation
- kein „Festhängen“ für den Nutzer

---

## 🧩 Funktionsumfang

### Seiten
- Land
- See / Seegang
- Höhenwetter
- Seewetter Texte

### Navigation
- Swipe links/rechts (Touch)
- Pfeile / Buttons
- Edge‑Tap (links/rechts)

---

## 🖼️ Lightbox

### Öffnen
- Klick / Tap auf ein Bild

### Schließen
- `ESC` (PC)
- Tap auf dunklen Hintergrund
- **Swipe nach unten (iPad / iPhone)**

👉 Ziel: Nutzer kommt immer wieder raus

---

## 🔍 Zoom & Interaktion

### Zoom
- Pinch (Touch-Geräte)
- Mausrad (Desktop)

### Verhalten
- Zoom relativ zur Finger- / Mausposition
- `transform-origin: center center`

---

### 🖐️ Pan (Verschieben)
- aktiv bei Zoom > 1
- begrenzt (kein unkontrolliertes Wegbewegen)

---

## 🔁 Navigation in der Lightbox

- Pfeile links / rechts
- Swipe links / rechts (wenn nicht gezoomt)
- Tastatur (← →)

---

## 🧭 Pfeil-Logik (UX)

### Sichtbarkeit
- erscheinen beim Öffnen
- verschwinden nach ~1.8 Sekunden

### Wieder anzeigen
- Tap auf das Bild → Pfeile erscheinen kurz

---

## 📱 Touch-Gesten

| Geste | Funktion |
|------|---------|
| Pinch | Zoom |
| Drag | Pan |
| Swipe links/rechts | Bild wechseln |
| **Swipe nach unten** | **Lightbox schließen ✅** |
| Tap auf Bild | Pfeile anzeigen |
| Tap Hintergrund | schließen |

---

## 🧠 Designentscheidungen

### PC ≠ iPad
Unterschiedliche Bedienlogik ist bewusst:
- PC: Maus + ESC
- Touch: Gesten

---

### Zoom bewusst einfach
- keine komplexe Physik
- Fokus: stabiles Gefühl

---

### „Exit immer möglich"
→ Tap Hintergrund / Swipe down / ESC

---

## ⚠️ Bekannte Einschränkungen

### Zoom & Navigation
- nicht identisch zur Fotos-App
- leichtes Nachzentrieren möglich
- kein Momentum

### Plattformunterschiede
- Touch ≠ Mouse Wheel

### Gesten
- Swipe down nur bei klarer Bewegung

### Netzwerk
- externe Bildquellen (DWD)

---

## 🚧 Weiterentwicklung

### Regeln
- nur eine Änderung gleichzeitig
- sofort testen (PC + iPad)

### Mögliche Erweiterungen
- Close-Button (×)
- besseres Caching
- modulare Struktur (lightbox.js etc.)

---

## 🧱 Basis

> Immer auf diesem Stand weiterentwickeln  
> Keine alten Versionen mischen
