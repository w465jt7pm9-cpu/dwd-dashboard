# 📊 DWD Dashboard – Mini Backlog

---

# 🧭 KANBAN ÜBERSICHT

## 🟥 TODO

- Siehe Ideen

## 🟨 DOING

- (leer)

## ✅ DONE

- US-001 Menü entfernen
- US-002 Navigation über Gesten
- US-003 Pull-to-Refresh
- US-004 Dark Mode automatisch
- US-005 Metadaten entfernen
- US-007 Visuelle Qualität und ruhige Darstellung optimieren

---

# 📦 BACKLOG DETAILS
---

# 🔄 Feature: Datenzyklus & Cache-Optimierung

## Ziel

Vermeidung unnötiger Requests und Ermöglichung von Offline-Nutzung durch intelligente Nutzung des DWD-Update-Zyklus.

---

## Copilot Prompt

```text
Optimiere das bestehende DWD Dashboard hinsichtlich Datenverbrauch und Offline-Nutzung.

Kontext:
- Vanilla JavaScript
- Bilder werden regelmäßig neu geladen
- Service Worker ist bereits vorhanden (sw.js)
- DWD-Daten werden nur zu festen Zeiten aktualisiert (00 und 12 UTC, Bereitstellung ca. 07 und 19 UTC)

Ziel:
- Vermeidung unnötiger Bild-Requests
- Nutzung von Cache für Wiederverwendung
- Offline-Funktionalität sicherstellen

---

1. Cache-Strategie

- Nutze bestehende Service Worker Logik
- Bilder sollen:
  - zuerst aus Cache geladen werden
  - nur bei Bedarf aktualisiert werden

---

2. Refresh-Logik anpassen

Aktuell:
- regelmäßiger Timer (REFRESH_INTERVAL_MS)

Neu:
- Prüfe:
  - wann letzter erfolgreicher Refresh war
  - aktuelle Zeit (UTC)
- Nur refreshen wenn:
  - nahe an bekannten Update-Zeiten (z. B. 07 oder 19 UTC)
  - oder Nutzer manuell auslöst

---

3. Offline-Verhalten

- Wenn navigator.onLine == false:
  - keine neuen Requests senden
  - ausschließlich Cache verwenden

---

4. Minimale Integration

- beste Stelle:
  - refreshVisibleImages()
- erweitere dort Logik:
  - optional skip refresh wenn Daten noch „frisch“

---

5. Optional (Bonus)

- Speichere:
  - lastModelRunTimestamp
- einfache Regel:
  - max. 2 echte Refreshs pro Tag

---

6. Constraints

- keine neuen Libraries
- bestehender Service Worker bleibt Grundlage
- keine Änderung der Bildstruktur
- minimal-invasive Änderungen

---

Vorgehen:

1. Analyse der aktuellen Refresh-Logik
2. Einbau einer Zeitprüfung
3. Integration mit bestehendem Cache-System

Keine unnötigen Refactorings durchführen.

---

## 🌊 US-006 – Wind-gegen-Strom Erkennung (Nordsee)

**Status:** TODO  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Wind gegen Strom“

---

### 🧑‍✈️ Beschreibung

Als erfahrener Skipper in der Nordsee  
möchte ich erkennen, ob Wind und Gezeitenströmung gegeneinander laufen  
damit ich kritische Seebedingungen (steile, kurze und brechende Wellen) frühzeitig einschätzen und vermeiden kann

---

### 🌊 Fachliche Idee

Wetterkarten allein reichen nicht aus, um reale Seebedingungen zu bewerten.  
Erst die Kombination aus Wind- und Strömungsrichtung ergibt ein realistisches Bild der See.

Besonders kritisch:

- Wind gegen Strom
- starker Strom + mittlerer bis starker Wind
- flache Bereiche (Küsten, Seegatten, Wattenmeer)

---

### ✅ Akzeptanzkriterien

**Basis**

- [ ] Windrichtung wird berücksichtigt
- [ ] Strömungsrichtung wird berücksichtigt
- [ ] Winkel zwischen beiden wird berechnet

**Logik**

- [ ] Unkritisch: Winkel < 90°
- [ ] Erhöht: Winkel ≥ 120°
- [ ] Kritisch: Winkel ≥ 150°

- [ ] Bewertung berücksichtigt zusätzlich:
  - Strömung > 0.5 kn
  - Wind > 4 Bft

**Darstellung**

- [ ] Kein neues Menü
- [ ] Darstellung als Badge oder Overlay
- [ ] visuelle Zustände:
  - ✅ ok
  - ⚠ warning
  - 🔴 kritisch

**System**

- [ ] Nur aktiv auf Seiten 0–2
- [ ] Lightbox bleibt unbeeinflusst
- [ ] Funktioniert auf Desktop und Touch

---

### 🧠 Definition of Done

- Nutzer erkennt ohne Zusatzinfos:
  👉 „Hier wird die See unangenehm“
- Bewertung ist in < 2 Sekunden visuell erfassbar
- Keine zusätzliche Interaktion erforderlich

---

### 💡 Nutzen

- realistischere Einschätzung von Seegang
- bessere Entscheidungsgrundlage für Navigation
- erhöhter Sicherheitsaspekt  
  ``

---

# ✅ DONE (DETAILS / HISTORIE)

_(hierher verschieben, wenn erledigt)_

## 🔴 US-001 – Menü vollständig entfernen

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 2 (Topbar + Thumbbar entfernen)

**Beschreibung**  
Als Nutzer möchte ich kein oberes Menü sehen, damit die Anzeige auf die Inhalte fokussiert bleibt.

**Akzeptanzkriterien**

- Menü wird nicht angezeigt
- Keine Funktionen gehen verloren

---

## 🔴 US-002 – Navigation über Gesten/Tasten

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 3 (Navigation zyklisch)

**Beschreibung**  
Als Nutzer möchte ich per Pfeiltasten (Desktop) und Swipe (Mobile) navigieren.

**Akzeptanzkriterien**

- Links-/Rechts-Tasten funktionieren am PC
- Swipe funktioniert auf iPad/iPhone
- Navigation ist zyklisch

---

## 🟡 US-003 – Aktualisierung per Pull-to-Refresh

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 4 (Pull-to-Refresh)

**Beschreibung**  
Als Nutzer möchte ich durch Herunterziehen aktualisieren statt eines Buttons.

**Akzeptanzkriterien**

- Pull-to-Refresh funktioniert auf Touch-Geräten und Trackpad
- Nur auf Seiten 0–2 aktiv
- Nur im oberen Startzustand aktiv
- Kein zusätzlicher visueller Hinweis

---

## 🟡 US-004 – Dark Mode automatisch übernehmen

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 5 (Theme automatisch)

**Beschreibung**  
Als Nutzer möchte ich keinen Night-Mode-Schalter, sondern eine automatische Anpassung an das System.

**Akzeptanzkriterien**

- System-Dark-Mode wird erkannt
- Live-Wechsel wird übernommen
- Kein Toggle vorhanden

---

## 🟢 US-005 – Metadaten entfernen

**Status:** DONE  
**Priorität:** Niedrig

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 6 (Statuslogik bereinigen)

**Beschreibung**  
Land, Höhe und Seegang sollen nicht mehr als Text dargestellt werden.

**Akzeptanzkriterien**

- Keine sichtbaren Titel (Land, See, Höhe)
- Keine globale Statusanzeige
- Bild bleibt alleinige Informationsquelle

---

## 🎨 US-007 – Visuelle Qualität und ruhige Darstellung optimieren

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „UI-Polish / Visual Refinement“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich eine ruhige, klare und visuell hochwertige Darstellung der Wetterkarten  
damit ich die Inhalte schnell erfassen kann, ohne durch UI-Elemente oder harte Übergänge abgelenkt zu werden

---

### 🎯 Zielbild

- maximale Fokussierung auf die Bilder
- minimale, aber klare visuelle Rückmeldungen
- konsistente und „ruhige“ Benutzeroberfläche

---

### ✅ Akzeptanzkriterien

**Karten-Darstellung**

- [ ] Karten haben abgerundete Ecken (z. B. Border-Radius)
- [ ] Karten haben einen subtilen Schatten (Depth-Effekt)
- [ ] Keine visuellen Artefakte beim Skalieren oder Wechseln

---

**Bild-Ladevorgang**

- [ ] Bilder erscheinen weich (Fade-in statt hartem Laden)
- [ ] Keine abrupten Layout-Sprünge
- [ ] Ladezustände bleiben über Badge erkennbar

---

**Navigation / Animation**

- [ ] Seitenwechsel erfolgt mit sanfter Animation
- [ ] Keine ruckartigen Bewegungen
- [ ] Verhalten konsistent auf Desktop und Touch

---

**Status-Badges**

- [ ] Einheitliche Position (oben rechts auf Karten)
- [ ] einheitlicher Stil (Größe, Farbe, Transparenz)
- [ ] vorbereitet für zukünftige Zustände (z. B. ⚠, 🔴)

---

**Interaktion**

- [ ] Dezente Hover-Effekte (nur Desktop)
- [ ] Edge-Tap bleibt erhalten, optional mit leichtem visuellem Feedback
- [ ] Keine zusätzlichen sichtbaren UI-Elemente

---

**Dark Mode**

- [ ] Darstellung ist im hellen und dunklen Modus konsistent
- [ ] Farben wirken in beiden Modi angenehm und nicht grell

---

### 🧠 Definition of Done

- UI wirkt „ruhig“ und nicht technisch oder unruhig
- Nutzer kann sich vollständig auf die Bilder konzentrieren
- Übergänge und Interaktionen wirken flüssig
- keine zusätzliche UI-Komplexität wurde eingeführt

---

### 💡 Nutzen

- bessere Lesbarkeit der Wetterkarten
- geringere kognitive Belastung
- hochwertiger Gesamteindruck
- ideale Grundlage für spätere „smarte“ Features (z. B. Wind-gegen-Strom)

---

# 💡 IDEEN (UNSORTIERT)

## 🔄 Refresh-Zyklus optimieren

**Idee:**  
Die DWD-Bilddaten werden in festen Intervallen aktualisiert. Zwischen diesen Intervallen liefern erneute Requests identische Inhalte. Der aktuelle Refresh-Mechanismus berücksichtigt diesen Veröffentlichungsrhythmus nicht.

**Ziel:**

- Anpassung der Refresh-Logik an den tatsächlichen Veröffentlichungszyklus der Datenquelle
- Reduktion redundanter Netzwerkanfragen

**Nutzen:**

- weniger Datenverbrauch (insbesondere mobil)
- effizientere Nutzung der API/Quelle
- verbesserte Performance und Responsiveness

## 🌊 Gezeiten- und Stromdaten integrieren

**Idee:**  
Ergänzung des Dashboards um Gezeiten- und Strömungsdaten für die Nordsee zur besseren Bewertung von Wind-gegen-Strom-Situationen.

**Ziel:**

- Kombination von Wetterdaten mit Tiden-/Strömungsinformationen
- Erkennung potenziell kritischer Seezustände durch gegenläufige Effekte

**Nutzen:**

- realistischere Einschätzung der Seebedingungen
- erhöhte Sicherheit bei Navigation in küstennahen Revieren
- bessere Entscheidungsgrundlage für Nutzer unterwegs

## Animation beim Bildwechsel

**Idee:** Weiche Transition beim Seitenwechsel
👉 **Mögliche Umsetzung:** neuer Copilot-Task erforderlich

## Offline-Modus erweitern

**Idee:** Offline-Nutzung verbessern
👉 **Mögliche Umsetzung:** basiert auf bestehendem Service Worker (`sw.js`)
