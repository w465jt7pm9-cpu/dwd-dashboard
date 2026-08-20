# Copilot Session Plan – DWD Dashboard

> Release-1.6 (2026-08-20): Dieser Ablaufplan beschreibt den aktuellen Arbeitsprozess. US-006 (Wind-gegen-Strom-Erkennung) bleibt eine geplante Idee und ist nicht implementiert.

## Zweck

Diese Datei beschreibt einen wiederverwendbaren Ablauf für Arbeiten am DWD
Dashboard mit GitHub Copilot in VS Code. Sie ergänzt:

- [copilot-checklist.md](copilot-checklist.md) mit Regeln und Prüfpunkten
- [copilot-prompts.md](copilot-prompts.md) mit thematischen Arbeits-Prompts

Der Plan ist kein historisches Änderungsprotokoll. Bereits abgeschlossene
Umbauten werden nicht erneut als Umsetzungsschritte vorgeschlagen.

## Arbeitsablauf

### 1. Aufgabe und Codepfad klären

**Dateien öffnen:** direkt betroffene Datei sowie benachbarte Tests

**Vorgehen:**

- konkrete Anforderung und betroffene Oberfläche festhalten
- steuernde Funktion oder Datenstruktur identifizieren
- eine lokale Hypothese und einen kleinen diskriminierenden Test formulieren
- bestehende Änderungen im Arbeitsbaum berücksichtigen

**Prompt:** `Analyse zuerst` aus [copilot-prompts.md](copilot-prompts.md)

### 2. Kleinste Änderung umsetzen

**Vorgehen:**

- vorhandene Muster und Hilfsfunktionen wiederverwenden
- nur den direkt verantwortlichen Codepfad ändern
- keine neue Bibliothek und keine unbeauftragten Refactorings einführen
- nach der ersten Änderung sofort den fokussierten Test ausführen

### 3. Fachliche Daten- und UI-Prüfung

Je nach Aufgabe den passenden Prompt verwenden:

- Seewetter-Zeitreihen für Nordsee und Ostsee
- Wetterlage-Overlay und Offline-Cache
- Gezeitenphase ausschließlich in der Nordsee-Zeitreihe
- gemeinsames Seegang-Inhaltsfenster mit getrennten Regionalansichten
- Datenzyklus, Cache und Offline-Verhalten

Die relevanten Prompts stehen in [copilot-prompts.md](copilot-prompts.md).

### 4. Interaktionen und Regressionen prüfen

Bei Änderungen an UI, Daten oder Lightbox kontrollieren:

- Carousel-Navigation per Tastatur, Swipe und Edge-Tap
- getrennte Lightbox-Navigation
- Zoom, Pan, Peek und Schließen
- Pull-to-Refresh und Refresh-Zyklus
- System-Dark-Mode
- Karten-Badges und Offline-Fallbacks
- Accessibility-Texte wie `aria-label` und `alt`

### 5. Dokumentation synchronisieren

Nach einer fachlichen oder sichtbaren Änderung prüfen:

- [README.md](../README.md)
- [docs/backlog.md](backlog.md)
- [docs/UI-Struktur.md](UI-Struktur.md)
- [docs/Gesamtarchitektur.md](Gesamtarchitektur.md)
- [docs/copilot-checklist.md](copilot-checklist.md)
- [docs/copilot-prompts.md](copilot-prompts.md)

Begriffe wie „Gezeitenphase“, Release-Stand und Story-Status müssen überall
konsistent sein. US-006 darf nicht als umgesetzt erscheinen.

### 6. Abschlussvalidierung

```text
1. Fokussierten Test für den geänderten Codepfad ausführen.
2. bash scripts/run-tests.sh ausführen.
3. git diff --check ausführen.
4. git diff auf unbeabsichtigte Änderungen prüfen.
5. Status und Begriffe in der relevanten Dokumentation abgleichen.
6. Manuelle UI-Prüfung auf Desktop und Touch durchführen, wenn Interaktion
   oder Layout betroffen ist.
```

## Aktuelle fachliche Leitplanken

- Die App bleibt eine Vanilla-JavaScript-Anwendung ohne Framework.
- Bildquellen, Service Worker und bestehende Cache-Strategie bleiben stabil.
- Seewettertexte und Zeitreihen werden aus DWD-Produkten aufbereitet.
- Die Gezeitenphase ist eine begrenzte eigene Ableitung und ersetzt keine
  amtliche Gezeitenvorausberechnung.
- US-006 ist nur Konzept: keine Mock-Bewertung und kein Produktionscode ohne
  geklärte Datenquellen und Produktentscheidung.

## Praktischer Einsatz in VS Code

1. `copilot-checklist.md` als Regeln geöffnet lassen.
2. `copilot-prompts.md` für den konkreten Arbeitsbereich verwenden.
3. Pro Copilot-Schritt nur eine klar abgegrenzte Änderung anfordern.
4. Nach jeder Änderung fokussiert testen.
5. Erst nach erfolgreicher Prüfung den nächsten Code- oder Dokumentationsschritt beginnen.
