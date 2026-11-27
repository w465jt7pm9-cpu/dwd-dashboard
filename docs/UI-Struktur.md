## UI-Struktur

> US-030 (Nordatlantik) ist abgeschlossen. US-031 (regionale
> Seegangsvorhersagen) wird umgesetzt; die Offline-Abnahme ist noch offen.
> Die Story-Historie steht im [Backlog](backlog.md).

Die Oberfläche zeigt ruhige, bildschirmfüllende Wetterkarten ohne sichtbares
Menü mit natürlicher Navigation und automatischem Dark Mode.

- Carousel mit elf Seiten: die bisherigen sieben Seiten bleiben bestehen;
  vier integrierte Seiten ergänzen Nordsee, Ostsee sowie westliches und
  östliches Mittelmeer.
- Navigation per Swipe, Pfeiltasten und Edge-Tap; Aktualisierung über den
  automatischen Datenzyklus (Seegangskarten gemeinsam ~07/~19 UTC) und
  Pull-to-Refresh.
- Lightbox: Karten werden anhand ihrer intrinsischen Abmessungen in den
  Viewport eingepasst und behalten ihr Seitenverhältnis auch beim Zoomen;
  elastisches Pan- und Zoom-Verhalten mit Snap-Back, subtile Peek-Nachbarn und
  zyklische Bildnavigation.
- Gezoomte Bodenanalyse: Wetterlage-Overlay mit scrollbarem DWD-Text und
  Stand-Hinweis.
- Seegang-Lightboxen Nordsee und Ostsee: gemeinsames Inhaltsfenster mit
  getrennten Zeitreihen (Wind, Böen, Welle, Wetter), initial eingeklappt und
  unabhängig scrollbar; Safe-Area-Insets werden berücksichtigt. Die
  Gezeitenphase (Sp/Mt/Np auf schmalen Displays) erscheint nur in der
  Nordsee-Zeitreihe.
- Seite Seegang Nordatlantik: vier Seegangskarten (+00/+36/+60/+84h) und ein
  Panel mit dem Streckenwetterbericht Englischer Kanal bis Kanarische Inseln.
  Die Zeitreihe ordnet die Berichtswerte den UTC-Zeitpunkten zu, markiert
  Kartenhorizonte und den aktuellen Zeitpunkt; die variable Wetterlage ist
  einklappbar und wird bei kleinen Displays initial kompakt dargestellt.
- Vier regionale Integrationsseiten zeigen je vier Seegangskarten
  (+00/+24/+48/+72h) sowie die zugehörige DWD-Zeitreihe mit Wetterlage,
  Ausgabestand und dynamischem Vorhersagebeginn. Die bisherigen Kartenbereiche
  und ihre Lightbox-Zeitreihen bleiben unverändert.
- Regionale Berichte werden beim App-Start, bei Netzrückkehr und Pull-to-Refresh
  vorab geladen. Die 16 zugehörigen Karten werden nur im Seegang-Zeitfenster
  (07/19 UTC ± 90 Minuten) mit stabilen URLs und `cache: no-cache` zur
  HTTP-Revalidierung abgerufen und im Service-Worker-Karten-Cache gespeichert.
- Offline: Der letzte erfolgreiche Bildstand je Karte bleibt sichtbar, auch
  nach Resize- oder Orientation-Änderungen; ein Offline-Banner zeigt den
  Zustand an. Berichte stehen offline nur zur Verfügung, wenn ein erfolgreicher
  Abruf lokal gespeichert wurde; andernfalls zeigt die Seite den fehlenden
  Stand an.
- Mobiltelefon-Portrait (Viewports bis 767 px): Die Startseite zeigt sechs
  Karten – die beiden sichtbaren Europa-+36h-Karten stehen rechts neben der
  Bodenanalyse, die drei unteren Wetterkarten in drei gleich breiten Spalten.
  Auf der Seewetter- und Höhenwetter-Seite sind je Zeile nur die ersten beiden
  Karten sichtbar. Im Landscape bleiben alle Karten erhalten.

```mermaid
flowchart TD
  App[App Container] --> Pages[Carousel / Pages]
  Pages --> Land[Landkarte]
  Pages --> See[Seewetter]
  Pages --> Hoehenwetter[Höhenwetter]
  Pages --> Nordatlantik[Seegang Nordatlantik]
  Pages --> Nordsee[Seegang Nordsee]
  Pages --> Ostsee[Seegang Ostsee]
  Pages --> Texte[Seewetter Texte]
  Pages --> NordseeBericht[Seegang Nordsee mit Zeitreihe]
  Pages --> OstseeBericht[Seegang Ostsee mit Zeitreihe]
  Pages --> MittelmeerWest[Seegang Mittelmeer West mit Zeitreihe]
  Pages --> MittelmeerOst[Seegang Mittelmeer Ost mit Zeitreihe]
  Nordatlantik --> NaKarten[Seegangskarten +00/+36/+60/+84h]
  Nordatlantik --> NaBericht[Streckenwetterbericht-Panel]
  NordseeBericht --> RegionaleZeitreihe[DWD-Zeitreihe und Kartenabgleich]
  OstseeBericht --> RegionaleZeitreihe
  MittelmeerWest --> RegionaleZeitreihe
  MittelmeerOst --> RegionaleZeitreihe
  Pages --> Cards[Overlay Karten]
  Cards --> Lightbox[Lightbox]
  Lightbox --> Image[Hauptbild - Seitenverhältnis bleibt erhalten]
  Lightbox --> Peek[Peek links / rechts]
  Lightbox --> Arrows[Pfeile dynamisch]
  Lightbox --> Elastic[Elastic Pan + Soft Clamp]
  Lightbox --> Overlay[Hintergrund / Overlay]
  Lightbox --> Wetterlage[Wetterlage-Overlay Bodenanalyse]
  Lightbox --> SeaWindow[Inhaltsfenster Seegang]
  SeaWindow --> SafeArea[Responsive Safe Area]
  SeaWindow --> NordseeWindow[Nordsee-Zeitreihe]
  SeaWindow --> OstseeWindow[Ostsee-Zeitreihe]
  NordseeWindow --> Meteogram[Zeitreihe links nach rechts]
  NordseeWindow --> Areas[Seegebiete untereinander]
  NordseeWindow --> Tide[Gezeitenphase]
  OstseeWindow --> Meteogram
  OstseeWindow --> Areas
  App --> Gestures[Gesten / Pfeiltasten]
  App --> Theme[Automatischer Dark Mode]
  App --> Refresh[Auto-Zyklus + Pull-to-Refresh]
  App --> OfflineBanner[Offline-Banner]
  App --> Persistence[Letzter Bildstand je Karte]
```
