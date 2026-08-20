# DWD Wetter Dashboard

Das DWD Wetter Dashboard ist eine touch-freundliche Übersicht für Wetterkarten, Seewetterberichte und Seegangsvorhersagen des Deutschen Wetterdienstes.
Es ist für die Nutzung vor dem Ablegen und unterwegs auf dem Wasser gedacht. Zuletzt geladene Inhalte bleiben auch bei eingeschränkter Verbindung verfügbar.

## Aktueller Release

`Release-1.6` umfasst kompakte DWD-Seewetter-Zeitreihen für Nord- und Ostsee,
die textuelle Wetterlage sowie die Gezeitenphase für die Nordsee. Die
zugehörigen Daten bleiben über die bestehende Cache- und Offline-Logik verfügbar.

## Live-Version

[Live-Dashboard](https://dwd-dashboard.pages.dev)

## Funktionsumfang

- Wetterkarten, Seewetterberichte und Seegangsvorhersagen für Nordsee und Ostsee.
- Seegangsübersichten mit mehreren Zeitpunkten und Seegebieten.
- Kompakte Zeitreihen für Wind, Böen, Welle und Wetterentwicklung.
- Textuelle Wetterlage als Kontext zur Seewetter-Zeitreihe.
- Gezeitenphase mit Spring-, Mitt- und Nipp-Phasen in der Nordsee-Zeitreihe.
- Navigation per Wischen, Tippen, Tastatur und Zoom.
- Vergrößerte Kartenansicht mit Wechsel zwischen Nachbarkarten.
- Offline-Nutzung zuletzt geladener Karten und Texte.
- Automatische Anpassung an den System-Dark-Mode.

## Daten und Aktualisierung

Die Inhalte stammen aus Produkten des Deutschen Wetterdienstes und werden ohne fachliche Veränderung für die Anzeige aufbereitet.
Aktualisierungen orientieren sich an den Veröffentlichungszyklen der verwendeten DWD-Produkte, um unnötige Abrufe zu reduzieren.

## Bedienung

- Seitlich wischen oder Pfeiltasten nutzen, um zwischen Ansichten zu wechseln.
- Karten antippen oder anklicken, um sie vergrößert zu öffnen.
- In der vergrößerten Ansicht zoomen und die Karte verschieben.

## Technischer Rahmen

- HTML
- CSS, modular strukturiert
- Vanilla JavaScript
- Service Worker für Cache- und Offline-Unterstützung
- Deployment über Cloudflare Pages

## Tests

Alle Tests liegen in `tests/` und laufen ohne zusätzliche Abhängigkeiten (nur Node.js und Python 3):

Die vollständige Testbeschreibung mit Testbereichen, manueller UI-Prüfung und
CI-/Git-Hook-Verhalten steht in [docs/TESTING.md](docs/TESTING.md).

```bash
bash scripts/run-tests.sh
```

Damit kein fehlerhafter Stand committet oder gepusht wird, gibt es versionierte Git-Hooks, die den gesamten Testlauf automatisch vor jedem `commit`/`push` ausführen und diesen bei Fehlern abbrechen. Einmalig aktivieren:

```bash
bash scripts/setup-git-hooks.sh
```

Zusätzlich läuft die Testsuite über GitHub Actions bei jedem Push/PR auf `main` (`.github/workflows/tests.yml`) als serverseitiges Sicherheitsnetz.

## Entwicklung

Dieses Projekt wurde mit Unterstützung von KI entwickelt. Die Idee, Konzeption, Priorisierung der Funktionen sowie die fachliche Ausrichtung stammen vom Autor. KI wurde als Werkzeug zur Unterstützung von Entwurf, Implementierung, Dokumentation und Qualitätssicherung eingesetzt. Alle fachlichen und gestalterischen Entscheidungen wurden durch den Autor getroffen.

## Projektunterlagen

- Weitere Architektur-, UI- und Interaktionsdokumente liegen im Ordner `docs/`.
- User Stories und Umsetzungsstand siehe `docs/backlog.md`.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Details siehe Datei `LICENSE`.

## Projekt unterstützen

Wenn dir dieses Projekt hilft, kannst du seine Weiterentwicklung über GitHub Sponsors unterstützen.

❤️ Sponsor werden

## Hinweis

Das Dashboard ersetzt keine eigene nautische Beurteilung und keine offiziellen Warnungen.
