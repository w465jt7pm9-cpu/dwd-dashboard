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
| `dwd-source-format-contracts.test.js` | DWD-Quellformat-Verträge und Regressionen bei geänderten Markern |

Die BSH-Referenzdateien in `tests/` sind Bestandteil der Regressionstests und
sollen bei fachlichen Änderungen nicht stillschweigend ersetzt werden.

### DWD-Quellformat-Verträge (US-024)

Mehrere Parser hängen an stabilen Text- und HTML-Markern der DWD-Quellen. Diese
Annahmen werden vor der Implementierung von US-024 als explizite Verträge
dokumentiert und anschließend mit versionierten, anonymisierten Fixtures
abgesichert. Die Tests dürfen keine Live-DWD-Seite benötigen, damit ein
vorübergehender Netz- oder Seitenfehler nicht mit einer Formatänderung
verwechselt wird.

Mindestens abzusichern sind:

- Feed: Abschnitt `Aktuelle Wetterlage`, vollständiger Vorhersageblock und
  Abschlussmarker vor Footer/Copyright.
- Seewetterbericht-HTML: Überschrift `Seewetterbericht für Nord- und Ostsee`,
  Start bei `Aktuelle Wetterlage` und bekannte Endmarker.
- Regionale HTML-Seiten: `Wetterlage und -entwicklung:` sowie der Beginn der
  Vorhersagetabelle bei `Vorhersagen von`.
- Zeitreihen-HTML: Tabellenzeilen, Gebietszeile mit Position und `WT:`,
  Wochentag, zweistellige Stunde sowie die sieben erwarteten Datenzellen.
- Zeichensatz: Latin-1-Decodierung des OpenData-Feeds einschließlich mindestens
  eines deutschen Sonderzeichens.

Jeder Vertrag soll mindestens einen positiven Fall, den Erhalt des relevanten
Inhalts und einen Negativfall für einen fehlenden oder veränderten Marker
enthalten. Eine Fixture darf nur zusammen mit einer bewussten Parser- oder
Vertragsänderung aktualisiert werden; die Änderung muss im Test und im
Backlog nachvollziehbar bleiben.

Die US-024-Fixtures decken deshalb den Feed-Endmarker `$$`, alle bekannten
HTML-Endmarker, getrennte Nordsee- und Ostsee-Varianten sowie sämtliche
Zeitreihenfelder ab. Die Nordsee-Fixture ergänzt die bestehende Ostsee-Fixture;
die zusätzlichen Varianten sind absichtlich klein gehalten, damit Änderungen
an einzelnen Quellformat-Verträgen im Testdiff eindeutig erkennbar bleiben.

### Live-Smoke-Test als Frühwarnsystem

Der optionale Live-Test ruft die aktuell konfigurierten DWD-Quellen ab und
prüft HTTP-Erreichbarkeit, Antwortgröße und die wichtigsten Quellformatmarker:

```bash
node scripts/live-dwd-smoke-test.js
```

Der Standardlauf meldet Abweichungen, ohne den Aufruf als Fehler zu beenden.
Für einen automatisierten Überwachungsjob beendet `--strict` den Prozess mit
Exit-Code 1, sobald eine Quelle nicht erreichbar ist oder ein Marker fehlt:

```bash
node scripts/live-dwd-smoke-test.js --strict
```

Der Test darf niemals automatisch Fixtures aktualisieren. Eine gemeldete
Abweichung wird zunächst als Netzwerk-/Verfügbarkeitsproblem oder als echte
Quellformatänderung bewertet. Erst danach werden Parseränderung, Fixture und
Regressionstest bewusst als separate Änderung eingeplant.

Beim ersten Lauf am 24.08.2026 waren die regionalen Nordsee- und Ostseequellen
erreichbar. Der maritime Feed wich jedoch vom lokalen Vertrag ab und lieferte
unter anderem `FQDL50`, `Wetterlage:` und den Abschlussmarker `=` statt der
bisher erwarteten Struktur. Dieser Befund ist ein offener Prüfpunkt für eine
gezielte Parseranpassung; die lokalen Regressionstests bleiben unverändert
maßgeblich.

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
