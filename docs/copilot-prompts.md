# GitHub Copilot Pro – Prompts für das DWD Dashboard

> Release-1.6 (2026-08-20): Die Prompts sind auf den aktuellen Implementierungsstand abgestimmt. US-006 (Wind-gegen-Strom-Erkennung) bleibt eine fachliche Idee und ist nicht implementiert.

Diese Prompts ergänzen die aktuelle [Copilot-Checklist](copilot-checklist.md). Sie sind für das bestehende Vanilla-JavaScript-Projekt formuliert und sollen kleine, überprüfbare Änderungen unterstützen.

## Projektkontext

```text
Projektkontext:
- Vanilla JavaScript ohne Framework
- HTML und modularisiertes CSS
- Desktop- und Touch-Nutzung
- Carousel mit Seiten- und Lightbox-Navigation
- Lightbox mit Zoom, Pan, Peek und zyklischem Bildwechsel
- Service Worker und Cache-First-/Offline-Verhalten vorhanden
- DWD-Bilder, Seewettertexte und Seewetter-Zeitreihen als Datenquellen
- bestehende Bildquellen und Badge-Logik nicht verändern
- aria-label- und alt-Texte erhalten
- keine neue Bibliothek und keine unnötigen Refactorings
```

## 1) Analyse zuerst

```text
Analysiere vor einer Änderung die betroffenen Dateien, Symbole, Tests und
benachbarten Aufrufer.

Liefere zuerst nur:
- den direkt steuernden Codepfad,
- eine falsifizierbare lokale Hypothese zur Ursache oder gewünschten Regel,
- einen möglichst kleinen Test, der die Hypothese prüfen kann,
- die kleinste sinnvolle Änderung,
- relevante Risiken.

Noch keinen Code schreiben. Bestehende Karten-, Lightbox-, Navigations-, Cache-
und Offline-Logik bleibt unverändert, sofern sie nicht ausdrücklich betroffen ist.
```

## 2) Seewetter-Zeitreihen prüfen und erweitern

```text
Prüfe die bestehende DWD-Seewetter-Zeitreihen-Integration minimal-invasiv.

Anforderungen:
- Nordsee- und Ostsee-Zeitreihen in den jeweiligen Seegang-Lightboxen getrennt
  behandeln
- Vorhersagezeitpunkte horizontal anordnen
- Seegebiete in eigenen Zeilen darstellen
- Windrichtung, Beaufort-Wert, Böen, Wellenhöhe und Wetterereignisse kompakt
  darstellen
- textuelle Wetterlage unmittelbar vor der Zeitreihe anzeigen
- Wetterlage und Zeitreihe auf denselben Datenstand beziehen
- Zeitreihe initial eingeklappt und unabhängig scrollbar halten
- vollständigen Text und Offline-Fallback erhalten

Keine Änderung an Bildquellen, Refresh-Zyklen, Service Worker, Navigation oder
Lightbox-Gesten. Bestehende Parsing- und Rendering-Funktionen wiederverwenden.
Prüfe danach die passenden Parsing- und Rendering-Tests.
```

## 3) Gezeitenphase in der Nordsee-Zeitreihe

```text
Prüfe oder erweitere den Gezeitenphasenindikator ausschließlich in der
DWD-Nordsee-Zeitreihe.

Anforderungen:
- verständliche UI-Bezeichnung "Gezeitenphase" verwenden
- Spring-, Mitt- und Nipp-Phasen darstellen
- farbige Segmente synchron zu den Zeitspalten halten
- auf schmalen Displays Sp, Mt und Np verwenden
- astronomische Mondphasen und vorhandene BSH-Referenzdaten als Grundlage
  beibehalten
- die Darstellung als Orientierungshilfe, nicht als amtliche Gezeitenvorhersage,
  behandeln
- keine Gezeitenphase in der Ostsee-Zeitreihe ergänzen, sofern nicht ausdrücklich
  beauftragt

Bestehende Generator-, Referenzdaten- und Testlogik nicht durch eine neue
vereinfachte Berechnung ersetzen. Führe danach die Tide-Regressionstests aus.
```

## 4) Wetterlage-Overlay und Offline-Cache

```text
Prüfe die Wetterlage-Integration im Zoom-Modus der relevanten Bodenwetterkarte.

Anforderungen:
- DWD-Seewetterbericht als Primärquelle und bestehende Fallback-Reihenfolge
  beibehalten
- Latin-1-Inhalt korrekt dekodieren
- Abschnitt "Aktuelle Wetterlage" inklusive vollständigem Vorhersageblock
  extrahieren
- Overlay nur bei der relevanten Karte im Zoom-Modus anzeigen
- Text scrollbar und mit Stand-/Veraltet-Hinweis lesbar darstellen
- bereits vorgeladenen oder gecachten Inhalt offline verwenden
- bei fehlendem Cache einen sinnvollen Fallback zeigen
- keinen zusätzlichen Request auslösen, wenn der Datenstand bereits aktuell ist

Keine Änderung an Zoom, Pan, Swipe, Schließen, Bild-Refresh oder Cache-Schlüsseln,
sofern nicht technisch zwingend. Nutze bestehende Parser-, Fetch- und Render-Pfade.
```

## 5) Seewettertext vorab laden

```text
Prüfe das stille Preload des Seewettertexts außerhalb der Lightbox.

Anforderungen:
- nur online vorladen
- App-Start oder Land-Seite als vorhandenen Trigger verwenden
- aktuellen Cache-Stand nicht unnötig erneut laden
- neuen Bericht pro Datenstand in den bestehenden Cache schreiben
- Lightbox weiterhin denselben Cache verwenden lassen
- bei Netzrückkehr einen erneuten sinnvollen Versuch erlauben

Keine neue UI, keinen zusätzlichen Button und keine Änderung an der
Bild-Refresh-Logik einführen. Prüfe insbesondere, dass Offline-Nutzung ohne
vorheriges Öffnen der Lightbox möglich bleibt.
```

## 6) Gemeinsames Seegang-Inhaltsfenster

```text
Prüfe die Lightbox-Integration der Seegang-Zeitreihen.

Das gemeinsame Inhaltsfenster darf nicht nur "OstseeWindow" heißen, wenn es
Nordsee- und Ostsee-Zeitreihen enthält. Verwende eine neutrale gemeinsame Ebene
und ordne darunter getrennte Nordsee- und Ostsee-Ansichten an.

Anforderungen:
- Nordsee- und Ostsee-Zeitreihe fachlich getrennt halten
- Gezeitenphase nur der Nordsee zuordnen
- Collapse-/Expand-Verhalten und Scrollbarkeit erhalten
- Zoom-, Pan-, Swipe- und Schließen-Gesten nicht blockieren
- keine parallele zweite Lightbox-Logik einführen

Aktualisiere bei Bedarf docs/UI-Struktur.md und prüfe Diagrammbegriffe auf
Konsistenz mit README.md und docs/Gesamtarchitektur.md.
```

## 7) Datenzyklus, Cache und Offline-Verhalten

```text
Prüfe eine Änderung an Refresh- oder Cache-Logik gegen die bestehenden DWD-Zyklen.

Anforderungen:
- Seegangskarten gemeinsam nach den bekannten Veröffentlichungsfenstern
  um etwa 07 und 19 UTC behandeln
- Bodenwetter-Analyse und Prognose dem passenden Modelllauf zuordnen
- automatische Refreshes zwischen verfügbaren neuen Daten vermeiden
- manuellen Refresh nicht unbeabsichtigt entfernen
- offline keine neuen Netzwerkabrufe erzwingen
- gecachte Bilder und Seewettertexte sichtbar halten
- Service Worker und app.js nicht redundant für denselben Cache-Fall ändern

Prüfe UTC-Zeit, Cache-Frische, Online-Rückkehr, Resize/Orientation-Change und
Lightbox-Verhalten mit fokussierten Tests.
```

## 8) US-006 – Wind gegen Strom (nur Konzept)

```text
US-006 ist derzeit nicht implementiert. Erstelle zunächst nur eine technische
Analyse und keinen Produktionscode.

Untersuche, welche verlässlichen Datenquellen für Windrichtung, Windstärke,
Strömungsrichtung und Strömungsgeschwindigkeit vorhanden sind. Bewerte:
- Datenverfügbarkeit und räumliche Abdeckung der Nordsee
- Einheiten und Richtungsdefinitionen
- Winkelberechnung 0 bis 180 Grad
- fachliche Schwellen für unkritisch, erhöht und kritisch
- Darstellung als bestehendes Badge oder dezentes Overlay
- Ausschluss von Lightbox und Seiten außerhalb des vorgesehenen Bereichs
- Risiken durch Mock-Daten oder unvollständige reale Daten

Liefere Datenabhängigkeiten, offene Produktentscheidungen, Testfälle und eine
minimal-invasive Umsetzungsskizze. Keine Mock-Bewertung in die laufende App
integrieren.
```

## 9) Abschluss-Review

```text
Prüfe die letzte Änderung auf:
1. korrekten Codepfad und minimalen Änderungsumfang,
2. Regressionen in Carousel, Edge-Tap, Tastatur, Swipe und Lightbox,
3. erhaltene Zoom-, Pan-, Offline- und Cache-Funktionen,
4. konsistente Begriffe für Gezeitenphase und Zeitreihen,
5. korrekten Status von US-006 als nicht umgesetzt,
6. konsistente Aussagen in README.md, docs/backlog.md,
   docs/UI-Struktur.md und docs/Gesamtarchitektur.md,
7. erfolgreiche Ausführung von `bash scripts/run-tests.sh`,
8. erfolgreiches `git diff --check`.

Liefere zuerst Befunde nach Schweregrad, danach offene Risiken und eine kurze
Änderungszusammenfassung. Keine unbeauftragten Refactorings durchführen.
```
