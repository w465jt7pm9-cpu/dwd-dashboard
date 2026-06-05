# Copilot Checklist – Kurzprompts für das DWD Dashboard

## 1) Analyse zuerst
```text
Analysiere index.html und app.js für diese Änderungen, aber schreibe noch keinen Code:
- Topbar (#topbar) entfernen
- Thumbbar (.thumbbar) entfernen
- sichtbare Titel, Status und Summary entfernen
- Accessibility-Texte (aria-label, alt) beibehalten
- Edge-Tap beibehalten
- Navigation zyklisch machen
- Pull-to-Refresh auf Seiten 0–2, nur am oberen Startzustand, ohne visuelles Feedback
- Theme automatisch aus prefers-color-scheme ableiten und live auf Systemwechsel reagieren
- Lightbox unverändert funktionsfähig lassen

Liefere nur:
- betroffene DOM-Elemente,
- betroffene Funktionen,
- minimale Änderungsstrategie,
- Risiken,
- kurze Teststrategie.
```

## 2) Topbar + Thumbbar entfernen
```text
Implementiere in index.html und app.js minimal-invasiv:
- #topbar entfernen oder vollständig unsichtbar machen
- .thumbbar entfernen oder vollständig unsichtbar machen
- pageTitle, status und pageSummary für Nutzer unsichtbar machen
- aria-label und alt unverändert lassen
- Navigation per ArrowLeft / ArrowRight, Swipe und Edge-Tap weiter funktionsfähig lassen
- Lightbox nicht beschädigen

Bitte direkt im Code umsetzen und nur kurz kommentieren.
```

## 3) Navigation zyklisch machen
```text
Passe app.js minimal-invasiv an:
- Dashboard-Seiten zyklisch navigierbar machen
- letzte Seite -> erste Seite
- erste Seite -> letzte Seite
- gültig für ArrowLeft / ArrowRight, Swipe, Edge-Tap und bestehende goToPage(currentPageIndex +/- 1)-Pfade
- Lightbox-Navigation unverändert lassen

Bitte nur die minimal nötigen Änderungen in app.js vornehmen.
```

## 4) Pull-to-Refresh statt Buttons
```text
Ersetze in app.js das manuelle Aktualisieren per Buttons durch Pull-to-Refresh als primäres Bedienkonzept:
- für Touch-Geräte und Desktop-Trackpad-Gesten
- nur auf Seiten 0 bis 2
- nur wenn die Ansicht am oberen Rand im Startzustand ist
- ohne zusätzliches visuelles Feedback
- refreshVisibleImages() wiederverwenden
- Lightbox unverändert lassen
- horizontale Swipe-Navigation nicht unnötig stören
- keine neue Bibliothek verwenden

Bitte direkt im Code umsetzen und kurz erläutern, welche Event-Logik ergänzt wurde.
```

## 5) Theme automatisch aus dem System
```text
Stelle die Theme-Logik in app.js minimal-invasiv um:
- kein manueller Theme-Schalter mehr
- Theme aus window.matchMedia('(prefers-color-scheme: dark)') ableiten
- live auf Systemwechsel reagieren
- lokale Theme-Persistenz nicht mehr als führende Quelle verwenden
- applyTheme(theme) weiterverwenden, falls sinnvoll
- falls modeBtn und thumbMode im DOM entfernt wurden, dürfen keine Fehler entstehen

Bitte direkt im Code umsetzen und tote Theme-Logik bereinigen.
```

## 6) Redundante Statuslogik bereinigen
```text
Bereinige in app.js die sichtbare Status- und Zusammenfassungslogik minimal-invasiv:
- kein global sichtbarer Zeitstempel "Aktualisiert ..."
- keine global sichtbare Zusammenfassung wie "lädt / offline / Fehler"
- card-status pro Bild beibehalten
- Offline-Funktionalität stabil halten
- keine Laufzeitfehler durch entfernte Status-Elemente

Analysiere kurz, ob status / pageSummary besser gar nicht mehr beschrieben oder nur unsichtbar gehalten werden sollen, und setze dann die minimal-invasive Lösung um.
```

## 7) Abschluss-Review
```text
Prüfe die umgesetzten Änderungen in index.html und app.js auf Regressionen und Konsistenz:
1. keine Fehler durch entfernte Menüelemente?
2. Navigation zyklisch für ArrowLeft / ArrowRight, Swipe und Edge-Tap?
3. Pull-to-Refresh nur auf Seiten 0 bis 2 und nur am oberen Startzustand?
4. Lightbox vollständig funktionsfähig?
5. Theme reagiert live auf prefers-color-scheme-Wechsel?
6. alte Theme- und Refresh-Button-Pfade sauber entfernt oder defensiv abgesichert?
7. keine unnötigen Refactorings?

Liefere:
- kurze Liste mit Risiken,
- kleine Bereinigungsvorschläge,
- manuelle Testcheckliste.
```

## 8) Reihenfolge in VS Code
```text
1. Analyse
2. Topbar + Thumbbar entfernen
3. Navigation zyklisch
4. Pull-to-Refresh
5. Theme-Automatik
6. Statuslogik bereinigen
7. Abschluss-Review
```
