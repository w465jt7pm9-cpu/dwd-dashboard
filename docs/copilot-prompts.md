# GitHub Copilot Pro – Prompts für das DWD Dashboard

> Teststatus (2026-06-20): Erfolgreich abgeschlossen (US-015/US-016, End-to-End geprueft).

Diese Prompts sind auf die vorhandenen Projektdateien zugeschnitten:

- `README.md`: HTML, modularisiertes CSS, Vanilla JavaScript, Fokus auf Desktop + Touch, stabiles Touch-Verhalten, zuverlässige Navigation, robuste Lightbox.
- `index.html`: sichtbare UI in `#topbar` und `.thumbbar`, `#viewport`, `#carousel`, `#lightbox`.
- `app.js`: bestehende Logik für Seitennavigation, Swipe, Edge-Tap, Refresh, Theme, Lightbox und Auto-Refresh.

## Arbeitsweise mit Copilot

Empfohlener Ablauf in VS Code:

1. Relevante Datei öffnen (`index.html` oder `app.js`).
2. Den passenden Prompt unten in Copilot Chat einfügen.
3. Zuerst immer **Analyse** ausführen lassen.
4. Danach erst die konkrete Änderung umsetzen lassen.
5. Nach jeder Änderung kurz manuell testen.

## Globale Randbedingungen für alle Prompts

Nutze diese Randbedingungen in jedem Prompt oder referenziere auf diesen Abschnitt:

```text
Projektkontext:
- Das Projekt ist eine Vanilla-JavaScript-Anwendung ohne Framework.
- Der Tech Stack ist HTML + modularisiertes CSS + Vanilla JavaScript.
- Die Anwendung ist für Desktop und Touch-Geräte optimiert.
- Die bestehende Lightbox ist robust und darf nicht beschädigt werden.
- Bestehende Bilddatenlogik und Bildquellen dürfen nicht verändert werden.
- Bestehende Badge-Logik pro Karte (.card-status) soll erhalten bleiben.
- Accessibility-Texte wie aria-label und alt sollen erhalten bleiben.
- Änderungen bitte minimal-invasiv umsetzen.
- Keine neuen Bibliotheken verwenden.
- Keine unnötigen Refactorings.
- Keine Änderungen an sw.js vornehmen, sofern nicht technisch zwingend erforderlich.
```

---

# 0) Analyse-Prompt (immer zuerst verwenden)

```text
Analysiere die vorhandenen Dateien index.html und app.js und plane die Umsetzung der folgenden Anforderungen minimal-invasiv.

Anforderungen:
1. Das sichtbare obere Menü soll entfernt werden.
2. Die sichtbare untere Thumbbar soll ebenfalls entfernt werden.
3. Sichtbare Titel und sichtbare Status-/Zusammenfassungsinfos sollen entfallen, aber Accessibility-Texte wie aria-label und alt müssen erhalten bleiben.
4. Edge-Tap-Navigation soll erhalten bleiben.
5. Navigation per ArrowLeft / ArrowRight und per Swipe soll erhalten bleiben, aber an den Grenzen zyklisch werden.
6. Aktualisieren soll über Pull-to-Refresh erfolgen:
   - auf Touch-Geräten und Desktop-Trackpad-Gesten,
   - nur auf Bildschirmseiten 0 bis 2,
   - nur wenn die Ansicht am oberen Rand im Startzustand ist,
   - ohne zusätzliches visuelles Feedback.
7. Der manuelle Theme-/Nachtmodus-Schalter soll entfallen.
8. Das Theme soll live auf Systemwechsel reagieren.
9. Die bestehende Lightbox inkl. Zoom, Swipe und Navigation darf nicht regressiv beeinflusst werden.

Bitte liefere zuerst nur eine Analyse mit:
- den betroffenen DOM-Elementen,
- den betroffenen Funktionen,
- einer minimal-invasiven Änderungsstrategie pro Datei,
- möglichen Risiken bzw. Regressionen,
- einer kurzen Teststrategie.

Bitte noch keinen Code schreiben.
```

---

# 1) Prompt: Topbar + Thumbbar entfernen, sichtbare Redundanzen abbauen

## Ziel

- `#topbar` entfernen bzw. nicht mehr sichtbar rendern.
- `.thumbbar` entfernen bzw. nicht mehr sichtbar rendern.
- Keine sichtbaren Titel (`pageTitle`) und keine sichtbaren Status-/Zusammenfassungsinfos (`status`, `pageSummary`) mehr.
- Accessibility-Texte (`aria-label`, `alt`) ausdrücklich erhalten.
- Edge-Tap, Tastatur, Swipe und Lightbox dürfen weiter funktionieren.

```text
Bitte implementiere die folgende UI-Reduktion minimal-invasiv in index.html und app.js.

Ziel:
- Das sichtbare obere Menü mit id="topbar" soll entfernt oder vollständig unsichtbar gemacht werden.
- Die sichtbare untere Thumbbar mit class="thumbbar" soll ebenfalls entfernt oder vollständig unsichtbar gemacht werden.
- Die sichtbaren Elemente pageTitle, status und pageSummary sollen für Nutzer nicht mehr erscheinen.
- Accessibility-Texte wie aria-label und alt müssen erhalten bleiben.
- Die bestehende Navigation per Tastatur, Swipe und Edge-Tap muss weiter funktionieren.
- Die bestehende Lightbox darf nicht beschädigt werden.

Wichtige Hinweise aus dem Bestand:
- In index.html existieren #topbar und .thumbbar als sichtbare Bedienelemente.
- In app.js hängen Event-Listener an prevBtn, nextBtn, refreshBtn, modeBtn sowie thumbPrev, thumbNext, thumbRefresh, thumbMode.
- pageTitle, status und pageSummary werden aktuell in app.js aktiv beschrieben.
- Die eigentliche Seitennavigation läuft bereits über goToPage(), Tastatur-Handling, Swipe und Edge-Tap.

Erwartete Umsetzung:
1. Passe index.html so an, dass #topbar und .thumbbar nicht mehr als sichtbare Steuerleisten auftreten.
2. Räume app.js so auf, dass entfernte bzw. nicht mehr vorhandene UI-Elemente keine Fehler verursachen.
3. Entferne oder deaktiviere ausschließlich die sichtbare Redundanz, aber nicht die zugrunde liegende Bild- oder Navigationslogik.
4. Lasse aria-label-, alt- und sonstige semantische Accessibility-Attribute unverändert.
5. Lasse offlineBanner, installHint, viewport, carousel, lightbox und dimOverlay funktional intakt.

Technische Akzeptanzkriterien:
- #topbar ist nicht sichtbar.
- .thumbbar ist nicht sichtbar.
- pageTitle, status und pageSummary sind für Nutzer nicht sichtbar.
- Es bleiben keine Laufzeitfehler durch fehlende Buttons zurück.
- Edge-Tap funktioniert weiterhin.
- ArrowLeft / ArrowRight funktionieren weiterhin.
- Swipe zwischen Seiten funktioniert weiterhin.
- Lightbox funktioniert unverändert.

Bitte führe die Änderung direkt im Code aus und kommentiere nur kurz die wirklich wichtigen Stellen.
```

---

# 2) Prompt: Zyklische Navigation an den Grenzen

## Ziel

- Navigation soll nicht mehr am ersten/letzten Screen stoppen.
- Stattdessen zyklisch: letzte -> erste, erste -> letzte.
- Gilt für ArrowLeft / ArrowRight, Swipe, Edge-Tap und bestehende Button-/Funktionspfade.
- Lightbox-Navigation bleibt separat und unverändert.

```text
Bitte passe die Seitennavigation in app.js minimal-invasiv auf zyklisches Verhalten an.

Aktuelles Verhalten:
- goToPage(pageIndex) begrenzt den Index aktuell auf 0 bis PAGE_NAMES.length - 1.
- Dadurch stoppt die Navigation an den Grenzen.

Neues Verhalten:
- Die Dashboard-Seiten sollen zyklisch navigierbar sein.
- Wenn die Navigation über das letzte Dashboard hinausgeht, soll wieder die erste Seite angezeigt werden.
- Wenn die Navigation vor die erste Dashboard-Seite geht, soll die letzte Seite angezeigt werden.

Geltungsbereich:
- ArrowLeft / ArrowRight auf Dokumentebene
- Swipe-Navigation im viewport
- Edge-Tap-Navigation
- alle bestehenden Aufrufe von goToPage(currentPageIndex +/- 1)

Wichtige Einschränkung:
- Die Lightbox-Navigation (showPreviousLightboxImage / showNextLightboxImage) hat bereits eigene Logik und darf nicht verändert oder regressiv beeinflusst werden.

Technische Akzeptanzkriterien:
- Seitenwechsel ist überall zyklisch.
- Kein Stoppen mehr an Index 0 oder PAGE_NAMES.length - 1.
- Edge-Tap links am Anfang springt zur letzten Seite.
- Edge-Tap rechts am Ende springt zur ersten Seite.
- Keyboard und Swipe verhalten sich identisch.
- Lightbox funktioniert unverändert.

Bitte implementiere nur die minimal nötigen Änderungen in app.js.
```

---

# 3) Prompt: Pull-to-Refresh statt Refresh-Buttons

## Ziel

- Refresh-Buttons entfallen als Bedienkonzept.
- Aktualisieren erfolgt per Pull-to-Refresh.
- Gilt auf Touch-Geräten und für Desktop-Trackpad-Gesten.
- Nur auf Seiten 0 bis 2.
- Nur wenn die Ansicht am oberen Rand im Startzustand ist.
- Kein zusätzliches visuelles Feedback.
- Lightbox darf nicht betroffen sein.

```text
Bitte ersetze das manuelle Aktualisieren per Buttons in app.js durch Pull-to-Refresh als primäres Bedienkonzept.

Zielverhalten:
- Refresh soll durch Pull-to-Refresh ausgelöst werden.
- Das gilt für Touch-Geräte und Desktop-Trackpad-Gesten.
- Pull-to-Refresh darf nur auf Seiten 0 bis 2 auslösen.
- Pull-to-Refresh darf nur auslösen, wenn sich die Ansicht am oberen Rand im Startzustand befindet.
- Es soll kein zusätzliches visuelles Feedback eingeführt werden.
- Die bestehende Funktion refreshVisibleImages() soll wiederverwendet werden.
- Die Lightbox darf davon nicht beeinflusst werden.

Wichtige Hinweise aus dem Bestand:
- refreshVisibleImages() existiert bereits und aktualisiert die sichtbaren Bilder.
- Es gibt aktuell refreshBtn und thumbRefresh als Button-Auslöser.
- Der viewport ist das zentrale Dashboard-Interaktionselement.
- Es gibt bereits Touch-Gesten für Swipe-Navigation.
- Die Lightbox hat eigene Touch-Logik.

Bitte setze die Änderung so um:
1. Entferne die Bedienabhängigkeit von refreshBtn und thumbRefresh.
2. Implementiere eine Pull-to-Refresh-Erkennung für den normalen Dashboard-Zustand außerhalb der Lightbox.
3. Die Erkennung soll nur aktiv sein, wenn currentPageIndex <= 2.
4. Die Erkennung soll nur aktiv sein, wenn die Ansicht am oberen Rand / im Startzustand ist.
5. Vertikale Geste zum Refresh darf horizontale Swipe-Navigation nicht unnötig stören.
6. Kein Spinner, kein Overlay und kein sonstiges neues Feedback einführen.
7. Bestehendes automatisches Refresh-Intervall unverändert lassen, sofern kein Konflikt entsteht.

Wichtig:
- Bitte prüfe, welches DOM-Element sich für die Geste am besten eignet, ohne Lightbox und bestehende Swipe-Navigation zu beschädigen.
- Bitte verwende keine neue Bibliothek.
- Bitte arbeite minimal-invasiv.

Technische Akzeptanzkriterien:
- Refresh-Buttons sind nicht mehr nötig.
- Pull-to-Refresh löst refreshVisibleImages() korrekt aus.
- Das funktioniert nur auf Seiten 0 bis 2.
- Das funktioniert nur am oberen Rand im Startzustand.
- Kein zusätzliches visuelles Feedback.
- Horizontale Swipe-Navigation bleibt benutzbar.
- Lightbox bleibt unverändert funktionsfähig.

Bitte implementiere die Änderung direkt im Code und erläutere kurz, welche Event-Logik du ergänzt oder angepasst hast.
```

---

# 4) Prompt: Theme automatisch aus dem System ableiten und live nachführen

## Ziel

- Kein manueller Theme-Schalter mehr.
- Keine lokale Theme-Persistenz mehr als führende Quelle.
- Theme folgt `prefers-color-scheme`.
- Änderungen des Systemthemes sollen live übernommen werden.
- Buttons `modeBtn` und `thumbMode` entfallen bzw. bleiben ungenutzt.

```text
Bitte stelle die Theme-Logik in app.js minimal-invasiv von manuellem Toggle auf automatische Systemerkennung um.

Aktueller Zustand:
- app.js verwendet THEME_STORAGE_KEY = 'dwdTheme'.
- initTheme() liest aktuell den Theme-Wert aus localStorage.
- toggleTheme() wechselt zwischen day und night.
- applyTheme(theme) setzt data-theme auf document.documentElement und aktualisiert modeBtn / thumbMode.

Neues Zielverhalten:
- Es gibt keinen manuellen Theme-Schalter mehr.
- Das Theme soll aus der Systempräferenz abgeleitet werden.
- Die App soll live auf Systemwechsel reagieren, also auch während sie geöffnet ist.
- Der bestehende Mechanismus über data-theme auf dem html-Element darf weiter genutzt werden, wenn das minimal-invasiv ist.

Bitte so umsetzen:
1. Entferne die Bedienlogik für modeBtn und thumbMode.
2. Ersetze initTheme() so, dass das Theme aus window.matchMedia('(prefers-color-scheme: dark)') abgeleitet wird.
3. Ergänze einen Listener, damit Theme-Wechsel des Betriebssystems live übernommen werden.
4. Entferne lokale Theme-Persistenz als führende Quelle.
5. Lasse applyTheme(theme) nur noch die notwendige Theme-Anwendung durchführen.
6. Falls modeBtn und thumbMode im DOM entfernt wurden, darf app.js dadurch keine Fehler werfen.

Technische Akzeptanzkriterien:
- Kein manueller Theme-Toggle mehr.
- Theme folgt der Systemeinstellung.
- Live-Wechsel des Systemthemes wird übernommen.
- Keine unnötigen zusätzlichen Zustände.
- Keine Regression bei bestehender UI oder Lightbox.

Bitte implementiere die Änderung direkt in app.js und bereinige tote Theme-Logik.
```

---

# 5) Prompt: Bereinigung redundanter Statuslogik ohne Verlust der Badge-Logik

## Ziel

- Globale sichtbare Metainformationen weg.
- Pro-Karte-Badges bleiben.
- Kein globaler sichtbarer Zeitstempel.
- Keine globale sichtbare Zusammenfassung "lädt / offline / Fehler".
- Interne Logik darf bestehen bleiben, wenn sie technisch nützlich ist, aber soll nicht mehr sichtbar sein.

```text
Bitte bereinige in app.js die sichtbare Status- und Zusammenfassungslogik minimal-invasiv, ohne die bestehende Bild- und Badge-Logik zu verschlechtern.

Ausgangslage:
- setStatusLabel() schreibt in das Element status.
- refreshVisibleImages() setzt z. B. 'Aktualisiert HH:MM:SS'.
- updateOfflineUi() schreibt Offline-Status in status und offlineBanner/offlineStamp.
- updatePageSummary() schreibt aggregierte Zustände wie 'offline', 'Fehler' oder 'lädt' in pageSummary.
- setCardState() pflegt weiterhin die wichtigen Zustands-Badges pro Karte.

Ziel:
- Globale sichtbare Statusanzeige und globale sichtbare Zusammenfassung sollen für Nutzer entfallen.
- Die pro Karte sichtbaren Badges (.card-status) sollen erhalten bleiben.
- Die bestehende Offline-Funktionalität soll nicht kaputtgehen.
- Accessibility und Robustheit sollen erhalten bleiben.

Bitte analysiere zuerst kurz, ob es besser ist,
- status / pageSummary gar nicht mehr zu beschreiben,
- oder sie nur unsichtbar zu lassen,
- oder die Logik teilweise als interne Logik beizubehalten.

Danach bitte minimal-invasiv umsetzen.

Technische Akzeptanzkriterien:
- Kein global sichtbarer Zeitstempel für 'Aktualisiert ...'.
- Keine global sichtbare Ladeanzahl / Zusammenfassung mehr.
- card-status pro Bild bleibt erhalten.
- Offline-Funktionalität bleibt stabil.
- Keine Laufzeitfehler durch entfernte Status-Elemente.
```

---

---

---

# 5a) Prompt: Globaler Seegang-Datenzyklus (US-013)

## Ziel

- Einheitlicher Aktualisierungszyklus fuer alle Seegangskarten (alle WX_SEE-Gebiete)
- Zentrale Zeitlogik mit den bekannten Fenstern um ca. 07 und 19 UTC
- Keine gebiets- oder seitenbezogene Sonderlogik
- Manuelle Aktualisierung bleibt moeglich

```text
Bitte erweitere die bestehende Refresh-Logik in app.js minimal-invasiv fuer US-013
(globaler Seegang-Datenzyklus).

Ziel:
- Alle Seegangskarten (alle Bilder mit data-base="WX_SEE") nutzen dieselbe Zeitlogik.
- Aktualisierung fuer Seegang erfolgt automatisch nur in den bekannten Fenstern
  um ca. 07 und 19 UTC.
- Zwischen den Fenstern werden fuer Seegang keine unnoetigen Requests ausgeloest.
- Manuelle Aktualisierung soll weiterhin moeglich bleiben.

Kontext aus dem Bestand:
- Es gibt bereits eine Zeitfenster-Logik fuer Seegang in app.js.
- Es existieren mehrere Seegang-Seiten (Nordsee, Ostsee, weitere Seegebiete).
- Refresh laeuft ueber refreshVisibleImages() und Interaktionen ueber Pull-to-Refresh.

Umsetzung:
1. Ersetze seitenbezogene Seegang-Sonderbehandlung durch eine globale Erkennung:
  - Seegang-Seite = Seite enthaelt mindestens ein Bild mit data-base="WX_SEE".
2. Halte Zeitfenster zentral (07/19 UTC, tolerantes Fenster wie im Bestand).
3. Speichere den letzten Seegang-Refresh pro aktivem Zeitfenster global,
  nicht pro Gebiet/Seite.
4. Lass automatische Refreshes ausserhalb der Seegang-Fenster aus.
5. Erlaube weiterhin manuelles Refresh (Force-Refresh), auch wenn kein
  Seegang-Fenster aktiv ist.
6. Keine Aenderungen an Bildquellen, Lightbox, Navigation und Badge-System.

Technische Akzeptanzkriterien:
- Alle WX_SEE-Karten folgen derselben Zeitlogik.
- Keine Duplikation der Zeitlogik pro Gebiet.
- Neue Seegang-Gebiete funktionieren ohne Anpassung der Zeitlogik.
- Pull-to-Refresh bleibt fuer Karten-Seiten verfuegbar.
- Keine Regressionen bei Lightbox, Swipe, Edge-Tap und Keyboard-Navigation.

Bitte fuehre die Aenderungen minimal-invasiv direkt im Code aus.
```

---

# 5b) Prompt: Offline-Kartenzugriff mit gecachten Daten (US-014)

## Ziel

- Gecachte Karten auch offline anzeigen, auch auf Seiten, die noch nie explizit geladen wurden
- Service Worker Cache richtig nutzen
- Offline-Navigation bleibt flüssig

```text
Bitte erweitere app.js minimal-invasiv, um gecachte Bilder im Offline-Modus besser zu nutzen (US-014).

Szenario:
- Nutzer lädt im Hafen Wetterkarten (alle Seiten)
- Geht Offline (Flugmodus/Schiff auf See)
- Wechselt zu Seiten, die er noch nie manuell geöffnet hat
- Problem: Diese Seiten zeigen leere/Fehler-Badges, obwohl die Bilder im Cache sind

Ziel:
- Seiten sollten gecachte Bilder anzeigen, auch offline
- Service Worker liefert Images bereits korrekt
- App.js sollte differenzieren: „nie geladen" vs. „offline, aber im Cache"

Kontext:
- Service Worker (sw.js) cached bereits Bilder mit Cache-First-Strategie
- app.js ruft bei Seitenwechsel refreshVisibleImages() auf
- Bei Resize/Orientation-Change im Offline-Modus dürfen vorhandene Bilder nicht durch neue Cache-Buster-URLs ersetzt werden
- Stattdessen muss die letzte erfolgreiche Bild-URL pro Karte wiederverwendet werden

Umsetzung:
1. In refreshVisibleImages():
   - Prüfe, ob navigator.onLine false ist
   - Wenn offline: Versuche trotzdem, .src zu setzen (Service Worker wird liefern)
   - Setze Badge auf 'offline' statt 'error'

2. Unterscheidung:
   - 'offline': Bild im Cache, aber kein Netzwerk
   - 'error': Versuch fehlgeschlagen

3. Beim Online-Event:
   - Bilder, die offline waren, sollten neu geladen werden
   - aber ohne Animationen (transparent)

4. Keine Änderungen an:
   - Service Worker
   - Bildquellen-Logik
   - Lightbox
   - Navigation

Technische Akzeptanzkriterien:
- Offline-Seitenwechsel zeigt gecachte Bilder
- Resize/Orientation-Change offline lässt bereits geladene Bilder sichtbar
- Badges zeigen 'offline' (•), nicht 'error' (✖) für gecachte Bilder
- Beim Online-Rückkehr aktualisieren sich Bilder automatisch
- Keine Regressionen bei Lightbox oder Badge-System
- Manuelle Testung: Hafen laden, Flugmodus, Seiten durchblättern, alles sichtbar

Bitte fuehre die Aenderungen minimal-invasiv direkt im Code aus.
```

---

# 🌊 Feature: Wind-gegen-Strom Erkennung

## Ziel

Erkennen und visuelles Markieren von kritischen Seebedingungen, wenn Wind und Gezeitenströmung gegeneinander laufen.

---

## Copilot Prompt

```text
Implementiere eine minimal-invasive Erkennung von „Wind gegen Strom“-Situationen im bestehenden DWD Dashboard (Vanilla JavaScript).

Kontext:
- HTML + CSS + Vanilla JS
- bestehende Navigation (Swipe, Keyboard, Edge-Tap)
- bestehende Kartenstruktur (.card)
- bestehendes Badge-System (.card-status)
- UI soll minimal bleiben (kein neues Menü!)

Ziel:
Ergänze eine Logik zur Bewertung von Seebedingungen basierend auf Wind- und Strömungsrichtung.

---

1. Daten (initial Mock)
Erzeuge temporäre Testwerte:

- windDirection (Grad 0–360)
- windSpeed (Bft oder m/s)
- currentDirection (Grad 0–360)
- currentSpeed (kn)

→ Diese später leicht austauschbar halten

---

2. Berechnung

Implementiere:

function getAngleDifference(a, b)

→ Ergebnis: Winkel 0–180°

---

3. Bewertungslogik

function evaluateSeaState(windDirection, windSpeed, currentDirection, currentSpeed)

Regeln:

- angleDiff < 90 → 'ok'
- angleDiff ≥ 120 → 'warning'
- angleDiff ≥ 150 → 'critical'

Zusätzlich:
- currentSpeed > 0.5 kn
- windSpeed > 4 Bft

Nur wenn beide erfüllt → Zustand aktiv

---

4. Integration

- Nutze bestehende Karten (.card)
- erweitere Badge-System:

.card-status--warning
.card-status--critical

- kein neues UI-Element erstellen

---

5. Verhalten

- nur aktiv auf Seiten 0–2
- keine Änderung an:
  - Lightbox
  - Navigation
  - Bildlogik

---

6. Visualisierung

- 'warning' → ⚠
- 'critical' → 🔴

→ möglichst subtil

---

7. Constraints

- keine neuen Libraries
- minimal-invasive Änderungen
- bestehende Struktur respektieren

---

Vorgehen:

1. Analyse der bestehenden card-status Logik
2. Implementierung der Bewertungsfunktion
3. Integration in bestehende Kartenanzeige

Kurze Kommentare im Code hinzufügen.
Keine unnötigen Refactorings durchführen.
```

---

---

---

# 🎨 Feature: UI-Polish / Visual Refinement

## Ziel

Verbesserung der visuellen Qualität und Wahrnehmung des Dashboards, ohne zusätzliche UI-Komplexität einzuführen.

---

## Copilot Prompt

```text
Verbessere die visuelle Darstellung des bestehenden DWD Dashboards minimal-invasiv.

Kontext:
- Vanilla JavaScript, kein Framework
- Kartenstruktur basiert auf .card
- Navigation über Carousel
- bestehende Badge-Logik (.card-status)
- Fokus liegt auf minimaler UI und Bilddarstellung

Ziel:
Das UI soll ruhiger, moderner und hochwertiger erscheinen, ohne zusätzliche Bedienelemente einzuführen.

---

1. Karten-Layout

- Ergänze:
  - border-radius (ca. 10–12px)
  - subtiler box-shadow
- keine Layout-Änderung

---

2. Bild-Laden (wichtig)

- Implementiere Fade-in:
  - initial opacity: 0
  - nach load: opacity → 1
- nutze vorhandene load-Events

---

3. Navigation

- Ergänze CSS:
  - transition für carousel transform
- Dauer:
  - ca. 200–300ms
- easing: ease

---

4. Badge-System

- Vereinheitliche:
  - Position: oben rechts
  - Hintergrund: leicht transparent (dunkel)
  - Schrift: klar lesbar

- bereite Erweiterungen vor:
  - card-status--warning
  - card-status--critical

---

5. Interaktion

- Ergänze optional:
  - leichter Hover-Effekt für .card (nur Desktop)
- keine Animationen auf Touch erzwingen

---

6. Dark Mode

- nutze prefers-color-scheme im CSS
- keine komplexe JS-Logik nötig

---

7. Constraints

- keine neuen Libraries
- keine Änderungen an:
  - Lightbox
  - Navigation
  - Datenlogik
- nur visuelle Verbesserungen

---

Vorgehen:

1. CSS minimal erweitern
2. kleine JS-Ergänzungen für Fade-in
3. keine strukturellen Änderungen

Bitte kurz kommentieren, aber keine unnötigen Refactorings durchführen.
```

---

---

# 6) Abschluss-Prompt: Code-Review, Regression Check und Testliste

Diesen Prompt nach der Umsetzung verwenden.

```text
Bitte prüfe die zuletzt umgesetzten Änderungen in index.html und app.js auf Konsistenz, tote Logik und mögliche Regressionen.

Prüfe insbesondere:
1. Wurden sichtbare Menüelemente entfernt, ohne dass Event-Listener oder DOM-Zugriffe fehlschlagen?
2. Ist die Seitennavigation zyklisch und konsistent für ArrowLeft / ArrowRight, Swipe und Edge-Tap?
3. Ist Pull-to-Refresh nur auf Seiten 0 bis 2 aktiv und nur im oberen Startzustand?
4. Bleibt die Lightbox vollständig funktionsfähig?
5. Reagiert das Theme live auf prefers-color-scheme-Wechsel?
6. Sind alte Theme- und Refresh-Button-Pfade sauber entfernt oder defensiv abgesichert?
7. Wurden keine unnötigen Refactorings eingeführt?

Liefere:
- eine kurze Liste mit gefundenen Risiken,
- konkrete kleine Bereinigungsvorschläge,
- eine manuelle Testcheckliste.

Bitte noch keinen größeren Refactor durchführen, sondern nur Review + Empfehlungen liefern.
```

---

# 7) Manuelle Test-Checkliste

```markdown
## Sichtbarkeit / UI

- [ ] Topbar ist nicht sichtbar.
- [ ] Thumbbar ist nicht sichtbar.
- [ ] Kein sichtbarer Titel für Land / See / Höhenwetter.
- [ ] Kein global sichtbarer Status / Zeitstempel / Summary.
- [ ] Bild-Badges oben rechts auf Karten funktionieren weiterhin.

## Navigation

- [ ] ArrowLeft / ArrowRight wechseln Seiten.
- [ ] Links von der ersten Seite führt auf die letzte Seite.
- [ ] Rechts von der letzten Seite führt auf die erste Seite.
- [ ] Horizontaler Swipe wechselt Seiten.
- [ ] Edge-Tap links/rechts funktioniert weiterhin.

## Refresh

- [ ] Pull-to-Refresh funktioniert auf Seiten 0, 1 und 2.
- [ ] Pull-to-Refresh funktioniert nicht auf der Textseite.
- [ ] Pull-to-Refresh wird nur im oberen Startzustand ausgelöst.
- [ ] Kein zusätzliches visuelles Refresh-Feedback erscheint.

## Theme

- [ ] System dunkel -> App dunkel.
- [ ] System hell -> App hell.
- [ ] Wechsel des Systemthemes bei geöffneter App wird übernommen.

## Lightbox

- [ ] Öffnen per Bildklick funktioniert.
- [ ] Navigation in der Lightbox funktioniert.
- [ ] Zoom / Pan / Double-Tap funktionieren.
- [ ] Swipe down zum Schließen funktioniert weiterhin.
```

---

# 8) Mein Rat für den effizientesten Einsatz in VS Code

Arbeite nicht mit nur einem einzigen Mega-Prompt. Nutze stattdessen diese Reihenfolge:

1. **Analyse-Prompt**
2. **Topbar + Thumbbar entfernen**
3. **Zyklische Navigation**
4. **Pull-to-Refresh**
5. **Theme-Automatik**
6. **Statuslogik bereinigen**
7. **Abschluss-Review**

So steigt die Chance deutlich, dass Copilot präzise und minimal-invasiv arbeitet.

---

# 🌍 Feature: Bodenwetter-Datenzyklus (Analyse & Prognose)

## Ziel

Sicherstellen, dass Bodenwetter-Analyse- und Prognosekarten nur dann aktualisiert werden, wenn tatsächlich neue Daten aus dem Modelllauf verfügbar sind.

---

## Copilot Prompt

````text
Optimiere das bestehende DWD Dashboard (Vanilla JavaScript) so, dass Bodenwetter-Analyse- und Prognosekarten entsprechend ihres tatsächlichen Modell- und Veröffentlichungszyklus behandelt werden.

Kontext:
- Dashboard lädt regelmäßig Wetterkarten (Analyse + Prognose)
- Aktuell werden Bilder ggf. zu häufig neu geladen
- DWD-Daten haben feste Aktualisierungszeiten und Modellläufe (00 und 12 UTC)

Ziel:
- Vermeidung unnötiger Requests
- Nur Aktualisierung bei tatsächlich neuen Daten
- klare Trennung zwischen Analyse und Prognose

---

1. Zeitmodell implementieren

- Modellläufe:
  - 00 UTC
  - 12 UTC

- Verfügbarkeit:
  - 00 UTC Lauf → verfügbar ab ca. 07 UTC
  - 12 UTC Lauf → verfügbar ab ca. 19 UTC

---

2. Analysekarten

- gelten als „neu“ nur zu:
  - 00 UTC
  - 12 UTC
- außerhalb dieser Zeiten:
  → keine Aktualisierung durchführen

---

3. Prognosekarten

- gehören zu einem Modelllauf (00 oder 12 UTC)
- Vorhersagezeiten:
  - H+24, H+36, H+48 etc.
- Interpretation:
  - H+X = Stunden relativ zum Modellstart

---

4. Refresh-Logik anpassen

- prüfe aktuelle UTC-Zeit
- bestimme gültigen Modelllauf:
  - zwischen 07–19 UTC → 00 UTC Lauf
  - zwischen 19–07 UTC → 12 UTC Lauf

- nur neu laden wenn:
  - neuer Modelllauf verfügbar
  - oder manuell ausgelöst

---

5. Integration mit bestehender Logik

- Integration in:
  - refreshVisibleImages()
  - bestehende Timer-Logik

- keine Änderung an:
  - Bild-URLs
  - DOM-Struktur
  - Navigation

---

6. Cache-Verhalten

- speichere:
  - lastModelRun (00 oder 12)
- wenn Modelllauf unverändert:
  - keine neuen Requests senden

---

7. Constraints

- keine neuen Libraries
- minimal-invasive Änderungen
- bestehende Architektur beibehalten
- Kompatibilität mit Service Worker sicherstellen

---

Vorgehen:

1. Analyse der aktuellen Refresh-Implementierung
2. Einbau einer zentralen Zeitentscheidung (UTC)
3. Verknüpfung mit Cache-Zustand
4. Tests mit verschiedenen Tageszeiten

Keine unnötigen Refactorings durchführen.

```text
Behandle Zeit immer in UTC (nicht lokale Zeit)


---

# 🧭 Feature: Wetterlage-Overlay & Offline-Cache

## Ziel

Einblendung der aktuellen Wetterlage aus dem DWD-Seewetterbericht im Zoom-Modus der Bodenwetterkarte, inklusive Offline-Unterstützung durch Caching.

---

## Copilot Prompt

```text
Erweitere das bestehende DWD Dashboard um ein Wetterlage-Overlay im Zoom-Modus der Bodenwetter-Analysekarte.

Kontext:
- bestehende Lightbox / Zoom-Ansicht
- bestehender Service Worker mit Cache-Strategie
- Bilder werden bereits gecacht
- Dashboard nutzt Vanilla JavaScript

Ziel:
- Anzeige der aktuellen Wetterlage (Text) über der Karte
- Offline-Verfügbarkeit des letzten Berichts
- minimale UI-Erweiterung

---

1. Datenquelle

Verwende den dedizierten DWD-Seewetterbericht als Primärquelle:
- https://www.dwd.de/DE/leistungen/seewetternordostsee/seewetternordostsee.html
- optionaler technischer Fallback: maritime Open-Data-Datei `https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST`

Wichtig:
- Response ist NICHT UTF-8
- Verwende:
  - response.arrayBuffer()
  - TextDecoder('latin1')

---

2. Parsing

- Extrahiere den Abschnitt ab:
  - "Aktuelle Wetterlage"
- Ergänze den vollständigen nachfolgenden Vorhersageblock
- Ende erst beim nächsten fachfremden Seiten-/Feed-Abschnitt
- Rückgabe als String

---

3. Overlay (Integration)

- erweitere bestehende Lightbox:
  - Overlay am unteren Rand
- Eigenschaften:
  - halbtransparent
  - scrollbar
  - nicht störend

- kein neues Menü oder Navigation hinzufügen

---

4. Anzeige-Logik

- Overlay nur anzeigen:
  - bei Bodenwetter-Analysekarte
  - im Zoom-Modus

- Overlay automatisch befüllen beim Öffnen der Lightbox

---

5. Offline-Unterstützung (wichtig)

Integration in bestehenden Service Worker:

Strategie:
- Cache First für Wetterlage-Text

Verhalten:
- wenn im Cache:
  - zeige den letzten gespeicherten Wetterlage-Text
  - markiere optional als „letzter Stand"
- wenn offline und kein Cache vorhanden:
  - zeige Fallback-Text: „Keine Wetterlage offline verfügbar"

---

6. Aktualisierungslogik

- orientiere den Fetch an bestehender Datenzyklus-Logik (US-013 / US-015)
- kein erneuter Download, wenn Modelllauf unverändert
- Cache-Eintrag pro Modelllauf überschreiben (kein Wachstum)

---

7. Constraints

- keine neuen Libraries
- bestehende Architektur beibehalten
- Lightbox-Interaktionen (Zoom, Pan, Swipe) nicht beeinträchtigen
- minimal-invasive Änderungen

---

Vorgehen:

1. Analyse der bestehenden Lightbox-Integration
2. Einbau von Fetch + Latin‑1 Decoding + Parser
3. Overlay-Rendern nur für Bodenanalyse im Zoom
4. Cache-First Verhalten mit Offline-Fallback

Keine unnötigen Refactorings durchführen.
```

## Hinweis zum Umsetzungsstand

- Die aktuelle Implementierung verwendet den dedizierten DWD-Seewetterbericht als Primärquelle, extrahiert den Abschnitt ab „Aktuelle Wetterlage“ inklusive vollständigem Vorhersageblock und zeigt ihn als Overlay an.
- Als technische Rückfallebene dient die maritime Open-Data-Datei `https://opendata.dwd.de/weather/maritime/forecast/german/FQEN50_EDZW_LATEST`, inklusive Latin‑1-Decoding und bestehendem Offline-Cache-Verhalten.
````

---

# 🧭 Feature: Seewettertext vorab online cachen

## Ziel

Der Seewettertext soll bereits bei normaler Online-Nutzung der App im Hintergrund geladen und lokal gespeichert werden, damit er nach dem Ablegen auch ohne vorheriges Öffnen der Lightbox offline verfügbar bleibt.

---

## Copilot Prompt

```text
Erweitere das bestehende DWD Dashboard so, dass der aktuelle Seewettertext bereits im Hintergrund vorgeladen und lokal gespeichert wird, bevor die Bodenanalyse-Lightbox geöffnet wird.

Kontext:
- bestehende Wetterlage-Logik in app.js
- bestehender Cache in localStorage für Wetterlage-Text, Modelllauf, Quelle und Zeitstempel
- bestehende Lightbox soll weiterhin denselben Cache nutzen
- keine neue UI, kein zusätzlicher Button

Ziel:
- stilles Preload bei normaler Online-Nutzung
- offline soll der zuletzt geladene Seewettertext auch dann verfügbar sein, wenn die Lightbox vor Netzverlust nie geöffnet wurde
- bestehende Daten- und Lightbox-Logik minimal-invasiv erweitern

---

1. Trigger-Logik

- Implementiere Option A aus US-019:
  - stilles Preload beim App-Start und/oder beim Aufruf der Land-Seite
- Kein Preload, wenn `navigator.onLine === false`
- Kein unnötiger erneuter Download, wenn der gecachte Inhalt noch aktuell ist

---

2. Cache-Nutzung

- Verwende die bestehenden localStorage-Keys weiter
- Die Lightbox darf später nur auf denselben Cache zugreifen
- Ein neuer Bericht ersetzt den bisherigen Cache-Eintrag

---

3. Aktualisierung

- Orientiere die Aktualisierung an sinnvollen Veröffentlichungszeitpunkten des Seewetterberichts
- Vermeide Mehrfach-Fetches bei unverändertem Stand
- Keine Änderung an der bestehenden Bild-Refresh-Logik

---

4. Constraints

- keine neue Library
- keine neue sichtbare UI
- keine Regression bei Zoom, Pan, Swipe, Edge-Tap oder Lightbox
- bestehende Fetch-Quelle und Fallback-Reihenfolge beibehalten
- minimal-invasive Änderungen in app.js

---

Vorgehen:

1. Analyse der bestehenden Wetterlage-Fetch- und Cache-Logik
2. Einbau eines stillen Preload-Triggers außerhalb der Lightbox
3. Wiederverwendung der bestehenden Cache- und Render-Pfade
4. Prüfung auf Offline-Verfügbarkeit ohne vorheriges Öffnen der Lightbox

Keine unnötigen Refactorings durchführen.
```

## Hinweis zum Umsetzungsstand

- US-019 ist umgesetzt.
- Der Seewettertext wird im Online-Betrieb still im Hintergrund vorgeladen (App-Start/Land-Seite) und bei Netzrückkehr erneut angestoßen.
- Die Bodenanalyse-Lightbox nutzt weiterhin denselben Cache und zeigt offline den zuletzt gespeicherten Stand.

---

# 🧭 Feature: Seewetter-Overlay lesbarer strukturieren

## Ziel

Der bereits vollständig geladene Seewettertext soll in der Lightbox klarer strukturiert dargestellt werden, ohne die Datenlogik oder Interaktionslogik zu verändern.

---

## Copilot Prompt

```text
Verbessere die Lesbarkeit des bestehenden Seewetter-Overlays in der Lightbox minimal-invasiv.

Kontext:
- der vollständige Seewettertext wird bereits geladen und im Overlay angezeigt
- Overlay ist scrollbar und darf Touch-/Zoom-Gesten nicht stören
- keine Änderung an Datenquelle, Cache-Logik oder Fetch-Reihenfolge

Ziel:
- bessere visuelle Struktur für lange Texte
- schnellere Erfassung von `Stand`, `Wetterlage` und `Vorhersage`
- kritische Windstärken (`6-7 Bft` / `8+ Bft`) im Text schneller erkennbar machen
- keine neue Interaktionslogik

---

1. Umfang

- Implementiere Option A aus US-018:
  - `Stand:` optisch klar am Anfang des Overlays anzeigen
  - `Wetterlage` und `Vorhersage` visuell hervorheben
  - Windangaben mit `6-7 Bft` als Starkwind hervorheben
  - Windangaben ab `8 Bft` als Sturmwarnung hervorheben
  - Hervorhebung nur in Windangaben anwenden, nicht auf Seegangshöhen in Metern
  - kein Einklappen, kein Toggle, keine zusätzliche Navigation

---

2. Darstellung

- Der Text muss vollständig erhalten bleiben
- Der Text muss weiterhin scrollbar sein
- Die Strukturierung muss auch bei langen Vorhersagen stabil bleiben

---

3. Technik

- Wenn nötig, erweitere die Overlay-Ausgabe in app.js moderat
- Wenn nötig, ergänze nur das bestehende CSS für das Lightbox-Overlay
- Keine neue Library
- Keine Regression bei Zoom, Pan, Swipe oder Schließen der Lightbox

---

4. Constraints

- Fetch-, Fallback-, Offline- und Cache-Logik unverändert lassen
- keine zusätzliche UI außerhalb des bestehenden Overlays
- minimal-invasive Änderungen

---

Vorgehen:

1. Analyse der aktuellen Overlay-Ausgabe
2. Strukturierung von Zeitstempel und Abschnittsüberschriften
3. gezielte Hervorhebung von `6-7 Bft` / `8+ Bft` in Windangaben
4. gezielte CSS-Anpassung für bessere Lesbarkeit
5. Prüfung, dass Scroll- und Lightbox-Gesten unbeeinträchtigt bleiben

Keine unnötigen Refactorings durchführen.
```

## Hinweis zum Umsetzungsstand

- US-018 ist umgesetzt.
- Der Overlay-Text zeigt `Stand:` als Kopfzeile, hebt `Wetterlage` und `Vorhersage` sichtbar hervor, markiert Seegebiete und Wochentage und kennzeichnet Windangaben mit `6-7 Bft` (Starkwind) sowie `8+ Bft` (Sturmwarnung).
- Die Hervorhebung wird nur in Windzeilen angewandt; Fetch-, Fallback- und Cache-Logik bleiben unverändert.
