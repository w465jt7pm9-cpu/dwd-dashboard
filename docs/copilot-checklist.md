# Copilot Checklist – Kurzprompts für das DWD Dashboard

> Release-1.6 (2026-08-20): Testsuite erfolgreich abgeschlossen; US-015, US-016, US-020, US-022 und US-023 sind umgesetzt. US-006 bleibt eine geplante Idee.

## 1) Vor jeder Änderung

```text
Analysiere zuerst die betroffenen Dateien, Symbole und vorhandenen Tests.
Schreibe noch keinen Code, bis du:
- den direkt steuernden Codepfad identifiziert hast,
- eine konkrete lokale Ursache oder Verhaltensannahme benennen kannst,
- einen möglichst kleinen diskriminierenden Test festgelegt hast.

Behalte bestehende Karten-, Lightbox-, Navigations-, Cache- und Offline-Logik
unverändert, sofern die Aufgabe sie nicht ausdrücklich betrifft.
Nutze vorhandene Vanilla-JavaScript- und CSS-Muster.
```

## 2) Release-1.6 – Zeitreihen und Gezeitenphase

```text
Prüfe die aktuellen Seewetter-Zeitreihen und ihre Lightbox-Integration:
- Nordsee- und Ostsee-Zeitreihen in den jeweiligen Seegang-Lightboxen prüfen
- Zeitachse, Seegebiete, Wind, Böen, Wellenhöhe und Wetterereignisse prüfen
- textuelle Wetterlage vor der Zeitreihe und gemeinsamen Datenstand prüfen
- Zeitreihe initial eingeklappt und unabhängig scrollbar halten
- Gezeitenphase nur in der Nordsee-Zeitreihe anzeigen
- Spring-, Mitt- und Nipp-Phasen inklusive mobiler Kurzbezeichner Sp/Mt/Np prüfen
- bestehende Zoom-, Pan-, Swipe- und Offline-Logik nicht beeinträchtigen
- keine Wind-gegen-Strom-Bewertung ergänzen: US-006 ist noch nicht umgesetzt
```

## 3) UI- und Interaktionsregeln

```text
Bei Änderungen an der Oberfläche prüfen:
- Navigation per Pfeiltasten, Swipe und Edge-Tap bleibt funktionsfähig
- Lightbox-Navigation bleibt von der Seitennavigation getrennt
- Pull-to-Refresh bleibt auf den vorgesehenen Seiten und Zuständen begrenzt
- System-Dark-Mode reagiert weiterhin live
- sichtbare Status- und Summary-Elemente werden nicht wieder eingeführt
- aria-label- und alt-Texte bleiben erhalten
- keine neue Bibliothek und keine unnötige UI-Komplexität einführen
```

## 4) Daten, Cache und Offline

```text
Bei Änderungen an Daten oder Aktualisierung prüfen:
- DWD-Veröffentlichungszyklen und vorhandene Refresh-Logik beibehalten
- offline keine neuen Requests erzwingen
- gecachte Karten und Seewettertexte weiterhin anzeigen
- veraltete Cache-Inhalte sichtbar, aber verständlich kennzeichnen
- Service Worker und App-Logik nicht doppelt für denselben Cache-Fall zuständig machen
```

## 5) Abschluss-Review

```text
Prüfe nach der Änderung:
1. Nur der angeforderte Codepfad wurde verändert.
2. Bestehende Lightbox-, Navigations- und Offline-Funktionen sind unverändert nutzbar.
3. README.md, docs/backlog.md, docs/UI-Struktur.md und docs/Gesamtarchitektur.md
   verwenden konsistente Begriffe und Statusangaben.
4. US-006 wird nicht als umgesetzt dargestellt.
5. bash scripts/run-tests.sh läuft erfolgreich durch.
6. git diff --check meldet keine Formatfehler.
```

## 6) Reihenfolge in VS Code

```text
1. Analyse und lokales Hypothesen-/Testpaar bilden
2. Kleinste Änderung umsetzen
3. Fokussierten Test ausführen
4. Benachbarte Dokumentation und Statusangaben prüfen
5. Gesamte Testsuite und git diff --check ausführen
```
