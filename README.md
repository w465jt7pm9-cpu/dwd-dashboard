# DWD Wetter Dashboard

Das DWD Wetter Dashboard ist eine touch-freundliche Übersicht für Wetterkarten, Seewetterberichte und Seegangsvorhersagen des Deutschen Wetterdienstes.
Es ist für die Nutzung vor dem Ablegen und unterwegs auf dem Wasser gedacht. Zuletzt geladene Inhalte bleiben auch bei eingeschränkter Verbindung verfügbar.

## Aktueller Release

`Release-1.8` macht das Dashboard auf mobilen Displays übersichtlicher: Die
Startseite zeigt im Portrait eine gezielte Auswahl von sechs Karten, und auf
den Seewetter- und Höhenwetter-Seiten sind jeweils zwei Karten pro Zeile
sichtbar. Die vergrößerte Bodenluftdruckkarte bewahrt auch beim Zoomen ihr
natürliches Seitenverhältnis.

## Live-Version

[Live-Dashboard](https://dwd-dashboard.pages.dev)

## Funktionsumfang

### Das Wetter im Überblick

Vom Boden bis in die Höhe: Entdecke DWD-Wetterkarten, Seewetterberichte und
Seegangsvorhersagen für Nord- und Ostsee. Mehrere Seegebiete und
Vorhersagezeitpunkte machen Entwicklungen auf einen Blick vergleichbar.

### Reinzoomen. Zusammenhänge erkennen.

Öffne eine Karte groß, zoome hinein und verschiebe sie, um Details genauer
anzusehen. Beim Blättern bleiben die Nachbarkarten griffbereit. Die Darstellung
bewahrt dabei das natürliche Seitenverhältnis der Bildquelle.

Für Nord- und Ostsee fassen kompakte Zeitreihen Wind, Böen, Welle und
Wetterentwicklung zusammen. Die textuelle Wetterlage liefert zusätzlichen
Kontext; in der Nordsee-Zeitreihe zeigt die Gezeitenphase, ob gerade Spring-,
Mitt- oder Nipptide herrscht.

### Für kleine Displays und draußen

Das Kartenraster passt sich der Ausrichtung an: Im Mobiltelefon-Portrait zeigt
die Startseite sechs Karten. Auf der Seewetter- und Höhenwetter-Seite stehen
jeweils zwei Karten pro Zeile bereit. Im Landscape sind wieder alle zehn
Startseitenkarten und alle Karten der beiden Vorhersageseiten sichtbar. Die
Nordsee-Zeitreihe nutzt im Querformat den Platz, ohne Displayränder oder
Aussparungen zu überdecken.

Wische oder tippe dich durchs Dashboard, nutze die Tastatur oder zoome direkt
in die Karte. Zuletzt geladene Karten und Texte bleiben bei eingeschränkter
Verbindung verfügbar. Der Dark Mode richtet sich automatisch nach deinem Gerät.

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

Zusätzlich läuft die Testsuite über GitHub Actions bei jedem Push auf `main`,
`feature/portrait-weather-grid`, `feature/us-027-lightbox-portrait`,
`feature/us-028-seewetter-portrait-cards` und
`feature/us-029-upperair-portrait-cards` sowie bei Pull Requests nach `main`
(`.github/workflows/tests.yml`) als serverseitiges Sicherheitsnetz.

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
