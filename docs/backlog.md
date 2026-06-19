# 📊 DWD Dashboard – Mini Backlog

---

# 🧭 KANBAN ÜBERSICHT

## 🟥 TODO

- (leer)

## 🟨 DOING

- (leer)

## ✅ DONE

- US-001 Menü entfernen
- US-002 Navigation über Gesten
- US-003 Pull-to-Refresh
- US-004 Dark Mode automatisch
- US-005 Metadaten entfernen
- US-007 Visuelle Qualität und ruhige Darstellung optimieren
- US-009 Zoom- und Navigationsverhalten im Bildmodus verbessern
- US-010 Pan- und Zoom-Verhalten im Bildmodus verbessern (Elastic UX)
- US-011 Seegangskarten Nordsee integrieren (dritte Seite)
- US-012 Seegangskarten Ostsee integrieren (vierte Seite)

---

# 📦 BACKLOG DETAILS

---

---

## 🌊 US-012 – Seegangskarten Ostsee integrieren (vierte Seite)

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seegangskarten Ostsee“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich zusätzlich zur Nordsee-Seite auch Seegangskarten für die Ostsee sehen  
damit ich eine vollständige Übersicht über die Wellen- und Seegangsituation in beiden deutschen Seegebieten erhalte

---

### 🎯 Zielbild

- neue Seite direkt im Anschluss an die Nordsee-Seite
- identischer Aufbau und Bedienung wie bei den Nordsee-Seegangskarten
- kompakte Darstellung der relevanten Vorhersagezeitpunkte

---

### ✅ Akzeptanzkriterien

**Seitenintegration**

- [x] Es gibt eine neue Seite für „Seegang Ostsee“
- [x] Seite folgt direkt auf die Nordsee-Seite im Carousel
- [x] Navigation (Swipe, Tastatur, Edge-Tap) funktioniert identisch

---

**Bildquellen**

- [x] Bilder werden über `data-base=\"WX_SEE\"` plus `data-path=\"ostsa_..png\"` geladen

- [x] Unterstützte Vorhersagezeiten:
  - 00
  - 24
  - 48
  - 72

---

**Layout (zweizeilig)**

**Zeile 1:**

- [x] ostsa_00.png
- [x] ostsa_24.png

**Zeile 2:**

- [x] ostsa_48.png
- [x] ostsa_72.png

---

**Visualisierung**

- [x] Gleichmäßige und ruhige Darstellung der Karten
- [x] Konsistente Größen, Abstände und Darstellung wie bei der Nordsee-Seite
- [x] Responsives Verhalten auf allen Geräten

---

**Aktualisierung**

- [x] Aktualisierung erfolgt nur in sinnvollen Zeitfenstern (~07 und ~19 UTC)
- [x] Integration in bestehende Datenzyklus-Logik (US-008)
- [x] Kein unnötiger Refresh zwischen Veröffentlichungen

---

**Integration mit bestehenden Features**

- [x] Unterstützung für:
  - Zoom (US-009)
  - Peek-Navigation (US-009)
  - Elastic Pan (US-010)
- [x] Kompatibel mit Cache- und Offline-Strategie
- [x] Badge-Logik funktioniert identisch

---

### 🧠 Definition of Done

- Nutzer kann Nordsee- und Ostsee-Seegang nahtlos vergleichen
- Seite wirkt konsistent mit der Nordsee-Seite
- Struktur ist intuitiv (früh → spät)
- Navigation und Interaktion verhalten sich identisch zu allen anderen Seiten

---

### 💡 Nutzen

- vollständige Abdeckung der deutschen Seegebiete
- bessere Vergleichbarkeit von Seegang (Nordsee vs. Ostsee)
- logische Erweiterung der bestehenden Kartenstruktur
- ideale Basis für kombinierte Analysen (z. B. Wind + Seegang + Strom)

---

## 🌊 US-011 – Seegangskarten Nordsee integrieren (dritte Seite)

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seegangskarten Nordsee“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich eine eigene Seite mit Seegangskarten für die Nordsee sehen  
damit ich Wellenentwicklung und Seegangsvorhersage übersichtlich und im gleichen Stil wie die anderen Karten interpretieren kann

---

### 🎯 Zielbild

- neue Seite im Dashboard (zusätzlich zu bestehenden Seiten)
- klare, strukturierte Darstellung der Vorhersagezeitpunkte
- visuell konsistent mit bestehendem Grid

---

### ✅ Akzeptanzkriterien

**Seitenintegration**

- [x] Es gibt eine neue Seite im Carousel (Seite für „Seegang Nordsee“)
- [x] Navigation per Swipe, Tastatur und Edge-Tap funktioniert wie auf den anderen Seiten
- [x] Seite fügt sich ohne Layout-Brüche in das bestehende System ein

---

**Bildquellen**

- [x] Bilder werden über `data-base=\"WX_SEE\"` plus `data-path=\"nordsa_..png\"` geladen
- [x] Unterstützte Zeitpunkte:
  - 00
  - 12
  - 24
  - 48
  - 72

---

**Layout (zweizeilig)**

- [x] Darstellung erfolgt in zwei Reihen:

**Zeile 1:**

- [x] nordsa_00.png
- [x] nordsa_12.png

**Zeile 2:**

- [x] nordsa_24.png
- [x] nordsa_48.png
- [x] nordsa_72.png

---

**Visualisierung**

- [x] Bilder werden gleichmäßig verteilt angezeigt
- [x] Karten haben konsistente Größen und Abstände
- [x] Layout ist responsive (Desktop / Tablet / Mobile)

---

**Aktualisierung**

- [x] Seegangskarten werden nur zu sinnvollen Zeitpunkten aktualisiert (~07 UTC und ~19 UTC)
- [x] Kein unnötiger Refresh zwischen den bekannten Veröffentlichungsfenstern
- [x] Integration in bestehende Refresh-Logik (US-008)

---

**Integration mit bestehenden Features**

- [x] Karten unterstützen:
  - Zoom (US-009)
  - Elastic Pan (US-010)
- [x] Karten funktionieren im Offline-Modus (Cache-Strategie)
- [x] Badge-Logik bleibt kompatibel

---

### 🧠 Definition of Done

- Nutzer kann schnell alle relevanten Seegangsvorhersagen erfassen
- Struktur ist intuitiv (früh → spät von oben nach unten)
- Darstellung wirkt ruhig und konsistent mit bestehenden Seiten
- Navigation und Interaktion funktionieren identisch zu anderen Karten

---

### 💡 Nutzen

- Ergänzung der Wetteranalyse um Seegangsdaten
- bessere Einschätzung realer Bedingungen auf See
- logische Erweiterung der bestehenden Kartenstruktur
- Grundlage für spätere Verknüpfung mit Strom-/Windanalyse (US-006)

---

## 🧭 US-010 – Pan- und Zoom-Verhalten im Bildmodus verbessern (Elastic UX)

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Elastic Pan & Clamp Verhalten“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich Bilder im Zoom-Modus frei verschieben können und dabei ein natürliches, „physikalisches“ Verhalten erleben  
damit die Interaktion nicht blockierend wirkt und sich flüssig sowie intuitiv anfühlt

---

### 🎯 Zielbild

- Zoomen und Verschieben fühlt sich frei und natürlich an
- Bewegungen werden nicht abrupt gestoppt
- Bild kann leicht über den Rand hinaus verschoben werden
- nach dem Loslassen kehrt es sanft in den gültigen Bereich zurück

---

### ✅ Akzeptanzkriterien

**Pan-Verhalten**

- [x] Bild kann nach dem Zoomen in alle Richtungen verschoben werden
- [x] Bewegung wird nicht abrupt durch harte Grenzen gestoppt
- [x] Leichte Überbewegung über den sichtbaren Bereich hinaus ist möglich

---

**Elastic / „Gummiband“-Effekt**

- [x] Beim Ziehen über den Rand entsteht ein gedämpfter Widerstand
- [x] Bewegung wird bei zunehmender Entfernung langsamer („Resistance“)
- [x] Verhalten fühlt sich „weich“ statt technisch an

---

**Zurückspringen (Clamp)**

- [x] Beim Loslassen kehrt das Bild automatisch in den gültigen Bereich zurück
- [x] Rückbewegung erfolgt animiert (kein Sprung)
- [x] Animation ist kurz, weich und nicht störend

---

**Zoom-Kombination**

- [x] Verhalten funktioniert unabhängig davon, ob echtes Overflow vorhanden ist
- [x] Auch bei Bildern, die vollständig in den Viewport passen, ist Bewegung möglich
- [x] Zoom + Pan wirken als zusammenhängendes System

---

**Integration**

- [x] Bestehende Lightbox-Struktur wird beibehalten
- [x] Keine Beeinträchtigung von:
  - Swipe-Navigation
  - Zoom-Gesten (Pinch)
- [x] Funktioniert auf Touch- und Desktop-Geräten

---

### 🧠 Definition of Done

- Nutzer kann ein Bild intuitiv bewegen, ohne „gegen Grenzen zu kämpfen“
- Interaktion wirkt flüssig und hochwertig
- Übergang zwischen Ziehen und Zurückspringen ist visuell konsistent
- Verhalten entspricht bekannten Mustern moderner Apps (z. B. Bilder-Viewer)

---

### 💡 Nutzen

- deutlich bessere Benutzererfahrung im Zoom-Modus
- Vermeidung von Frustration durch blockierende Interaktion
- natürlicheres Gefühl bei Touch-Gesten
- Grundlage für erweitertes Zoom- und Navigationsverhalten

## 🔍 US-009 – Zoom- und Navigationsverhalten im Bildmodus verbessern

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Zoom & Peek Navigation“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich ein Bild im Detailmodus vergrößert betrachten können und gleichzeitig die Nachbarbilder angedeutet sehen  
damit ich Inhalte besser erkennen kann und stets die räumliche Orientierung innerhalb der Bildnavigation behalte

---

### 🎯 Zielbild

- Bild nutzt optimal die verfügbare Bildschirmhöhe
- benachbarte Bilder werden leicht angeschnitten sichtbar
- Navigation erfolgt fließend und nachvollziehbar

---

### ✅ Akzeptanzkriterien

**Zoom-Verhalten**

- [x] Vergrößertes Bild richtet sich primär nach der verfügbaren Fensterhöhe (Viewport-Höhe)
- [x] Das Bild bleibt vollständig sichtbar (kein ungewolltes Abschneiden)
- [x] Seitenverhältnis bleibt erhalten (keine Verzerrung)
- [x] Bild passt sich responsiv an verschiedene Geräte an

---

**Peek-Navigation (Orientierung)**

- [x] Links und rechts vom aktuellen Bild sind angrenzende Bilder leicht angeschnitten sichtbar
- [x] Die Vorschau ist visuell reduziert (z. B. geringere Opacity)
- [x] Nutzer erkennt sofort, dass weitere Inhalte vorhanden sind

---

**Navigation**

- [x] Wischen oder Pfeiltasten verschieben den Fokus fließend zum nächsten/vorherigen Bild
- [x] Das aktuelle Bild gleitet animiert zur Seite, das nächste wird zentral
- [x] Übergänge sind weich und nicht ruckartig

---

**Zyklisches Verhalten**

- [x] Navigation ist endlos (letztes → erstes Bild, erstes → letztes Bild)
- [x] Keine Sackgassen im Navigationsfluss

---

**Integration**

- [x] Bestehende Lightbox-/Zoom-Logik wird erweitert oder ersetzt (keine Doppel-Logik)
- [x] Funktion beeinflusst keine bestehenden Grid- oder Ladefunktionen
- [x] Funktioniert auf Desktop und Touch-Geräten

---

### 🧠 Definition of Done

- Nutzer erkennt intuitiv die Navigation ohne zusätzliche Hinweise
- Bilddarstellung wirkt ruhig, kontrolliert und hochwertig
- Navigation fühlt sich „natürlich“ und flüssig an
- Orientierung innerhalb der Bildfolge ist jederzeit gegeben

---

### 💡 Nutzen

- bessere Lesbarkeit der Wetterkarten
- deutlich verbesserte Benutzerführung
- Reduktion von „Verlorenheitsgefühl“ beim Navigieren
- Vorbereitung für spätere Features (z. B. Vergleich oder Analyse mehrerer Karten)
  ``

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
```
