# Tests und Qualitätssicherung

> Release-1.6 (2026-08-20): Die vollständige automatisierte Testsuite ist erfolgreich durchgelaufen.

## Zweck

Diese Datei beschreibt, wie das DWD Dashboard geprüft wird. Sie ergänzt die
fachlichen Akzeptanzkriterien im [Backlog](backlog.md) und die Arbeitsregeln in
der [Copilot-Checklist](copilot-checklist.md).

## Automatisierte Tests

Die zentrale Testsuite wird mit folgendem Befehl ausgeführt:

```bash
bash scripts/run-tests.sh
```

Sie führt alle JavaScript-Tests in `tests/*.test.js` und anschließend den
Python-Smoke-Test aus. Voraussetzungen sind Node.js und Python 3; zusätzliche
Pakete werden nicht benötigt.

### Testbereiche

| Testdatei | Prüft |
| --- | --- |
| `boden-refresh-cycle.test.js` | Veröffentlichungs- und Modelllauf-Zyklen für Bodenwetterkarten |
| `sea-timeseries-parsing.test.js` | Parsing und Struktur der DWD-Seewetter-Zeitreihen |
| `seewetter-highlighting.test.js` | Strukturierung, Windwarnungen und Hervorhebungen im Seewettertext |
| `tide-phase.test.js` | Gezeitenphasen-Generator gegen BSH-Referenzdaten und Mondphasen-Zeitpunkte |
| `wetterlage-text-extraction.test.js` | Extraktion von Wetterlage und vollständigem Vorhersageblock |
| `wind-weather-rendering.test.js` | Rendering von Wind- und Wetterwerten in Zeitreihen |
| `smoke_nordsee_tide_test.py` | Smoke-Prüfung des Nordsee-Gezeiten-Markups |

Die BSH-Referenzdateien in `tests/` sind Bestandteil der Regressionstests und
sollen bei fachlichen Änderungen nicht stillschweigend ersetzt werden.

## Tests nach Änderungen

Nach einer kleinen Codeänderung:

1. den fokussierten Test des betroffenen Bereichs ausführen,
2. anschließend `bash scripts/run-tests.sh` ausführen,
3. mit `git diff --check` Formatfehler prüfen,
4. bei UI- oder Interaktionsänderungen manuell im Browser testen.

Beispiele für fokussierte Tests:

```bash
node tests/tide-phase.test.js
node tests/sea-timeseries-parsing.test.js
node tests/wetterlage-text-extraction.test.js
python3 tests/smoke_nordsee_tide_test.py
```

## Manuelle UI-Prüfung

### Navigation

- [ ] ArrowLeft und ArrowRight wechseln die Dashboard-Seiten.
- [ ] Navigation ist an den Seitenrändern zyklisch.
- [ ] Horizontaler Swipe und Edge-Tap funktionieren.
- [ ] Lightbox-Navigation bleibt von der Seitennavigation getrennt.

### Lightbox und Overlays

- [ ] Karte öffnet die Lightbox per Klick oder Tap.
- [ ] Zoom per Pinch, Mausrad oder Double-Tap funktioniert.
- [ ] Pan mit elastischem Snap-Back funktioniert.
- [ ] Peek-Nachbarbilder bleiben sichtbar.
- [ ] Wetterlage erscheint nur bei der relevanten Bodenwetterkarte.
- [ ] Nordsee- und Ostsee-Zeitreihen erscheinen in der richtigen Lightbox.
- [ ] Die Gezeitenphase erscheint nur in der Nordsee-Zeitreihe.
- [ ] Zeitreihen sind scrollbar und initial eingeklappt, wo vorgesehen.

### Offline und Aktualisierung

- [ ] Gecachte Karten bleiben offline sichtbar.
- [ ] Der gecachte Seewettertext bleibt offline verfügbar.
- [ ] Offline- und Veraltet-Hinweise sind verständlich.
- [ ] Pull-to-Refresh ist nur im vorgesehenen Seiten- und Startzustand aktiv.
- [ ] Refreshes erfolgen nicht unnötig zwischen DWD-Veröffentlichungsfenstern.

### Darstellung und Accessibility

- [ ] Helles und dunkles Systemtheme werden korrekt übernommen.
- [ ] Keine sichtbare Topbar oder Thumbbar erscheint.
- [ ] Karten-Badges bleiben lesbar.
- [ ] Tastaturbedienung und `ESC` zum Schließen funktionieren.
- [ ] `aria-label`- und `alt`-Texte bleiben vorhanden.
- [ ] Desktop- und Touch-Darstellung ohne Überlappungen prüfen.

## CI und Git-Hooks

GitHub Actions führt die Testsuite bei jedem Push und Pull Request auf `main`
aus: [.github/workflows/tests.yml](../.github/workflows/tests.yml).

Optional können die versionierten Hooks aktiviert werden:

```bash
bash scripts/setup-git-hooks.sh
```

Danach laufen die Tests automatisch vor `commit` und `push`. Ein fehlschlagender
Test bricht den jeweiligen Git-Schritt ab.

## Grenzen der Tests

Die automatisierten Tests prüfen Parsing, Zeitlogik, Rendering-Markup und
Regressionen. Sie ersetzen keine vollständige Browserprüfung von Touch-Gesten,
Layout, Offline-Wechseln und Lightbox-Interaktionen.

Die Wind-gegen-Strom-Erkennung (US-006) ist nicht implementiert und daher nicht
Bestandteil der Testsuite.
