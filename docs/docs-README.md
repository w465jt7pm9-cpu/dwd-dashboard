# 📂 docs – Copilot & Arbeitsdokumentation

> Release-1.6 (2026-08-20): Testsuite erfolgreich abgeschlossen; US-015, US-016, US-020, US-022 und US-023 sind umgesetzt. US-006 bleibt eine geplante Idee.

## Zweck dieses Ordners

Dieser Ordner enthält unterstützende Dokumente für die **Entwicklung und Weiterentwicklung des DWD Dashboards mit GitHub Copilot**.

Die Dateien sind **kein Bestandteil der laufenden Anwendung**, sondern dienen ausschließlich:

- als Arbeitsgrundlage
- zur Strukturierung von Änderungen
- zur Dokumentation von Designentscheidungen
- zur effizienten Nutzung von KI-Unterstützung im Entwicklungsprozess

---

## 📄 Enthaltene Dateien

### 1. `copilot-prompts.md`

Enthält aktuelle, strukturierte Prompts für GitHub Copilot.

✅ Zweck:

- Analyse vor Änderungen
- Prüfungen für Zeitreihen, Wetterlage, Gezeitenphase und Offline-Verhalten
- technische Leitplanken für die weiterhin geplante US-006

👉 Nutzung:

- wenn du einen fachlich abgegrenzten Änderungs- oder Prüf-Prompt brauchst

---

### 2. `backlog.md`

Zentrale Kanban-Übersicht mit User Stories, Status und Akzeptanzkriterien.

✅ Zweck:

- Überblick über TODO / DOING / DONE
- verbindliche Definition der fachlichen Anforderungen
- Nachverfolgung des Umsetzungsstands je Story

👉 Nutzung:

- als **erste Referenz** vor jeder neuen Änderung

---

### 3. `Gesamtarchitektur.md`

High-Level-Systemübersicht (Mermaid) für Komponenten und Datenfluss.

✅ Zweck:

- Architekturverständnis für UI, App-Controller, Refresh- und Offline-Logik
- schnelle Orientierung bei technischen Entscheidungen

👉 Nutzung:

- wenn du Architekturpfade oder Verantwortlichkeiten prüfen willst

---

### 4. `UI-Struktur.md`

Übersicht der Seiten- und Interaktionsstruktur (Mermaid).

✅ Zweck:

- visuelle Struktur des Carousels und der Kern-Interaktionen
- Bezug zu den aktuellen UX- und Zeitreihen-Updates

👉 Nutzung:

- wenn du UI-Änderungen oder Navigationsverhalten planst

---

### 5. `Lightbox-Interaktionen.md`

Spezifische Interaktionslogik der Lightbox (Zoom, Pan, Peek, Navigation).

✅ Zweck:

- Schutz kritischer UX-Funktionen
- Referenz für regressionsfreie Anpassungen

👉 Nutzung:

- vor Änderungen an Bildinteraktion, Gesten oder Lightbox-Controls

---

### 6. `copilot-checklist.md`

Aktuelle Kurz-Checkliste für Analyse, Umsetzung und Review.

✅ Zweck:

- schneller Copy-&-Paste in Copilot Chat
- Fokus auf kleine, überprüfbare Änderungen
- Release-1.6-Regeln und US-006-Abgrenzung

👉 Nutzung:

- für **schnelle Umsetzung** in VS Code

---

### 7. `copilot-session-plan.md`

Definiert den aktuellen **Ablauf und die Struktur** für die Arbeit mit Copilot.

✅ Zweck:

- klare Schrittfolge für Analyse, Änderung, Test und Dokumentationsabgleich
- minimiert Fehler und unnötige Refactorings
- verhindert, dass abgeschlossene Schritte erneut umgesetzt werden

👉 Nutzung:

- als **Leitfaden während der Entwicklungssession**

---

### 8. `TESTING.md`

Zentrale Dokumentation für automatisierte und manuelle Qualitätssicherung.

✅ Zweck:

- Testbereiche und fokussierte Testbefehle erklären
- manuelle Prüfung von Navigation, Lightbox, Offline-Verhalten und Darstellung
- CI- und Git-Hook-Ausführung dokumentieren
- Grenzen der automatisierten Tests festhalten

👉 Nutzung:

- nach jeder Codeänderung und vor einem Release

---

## 🧠 Empfohlener Workflow

1. `backlog.md` öffnen und aktives Ziel (US) prüfen; US-006 ist derzeit nur eine Idee
2. `Gesamtarchitektur.md` und `UI-Struktur.md` für den betroffenen Bereich querlesen
3. bei Lightbox-/Gesten-Themen zusätzlich `Lightbox-Interaktionen.md` prüfen
4. passenden Prompt aus `copilot-prompts.md` oder `copilot-checklist.md` wählen
5. kleinste Änderung umsetzen lassen
6. fokussierten Test ausführen und anschließend `bash scripts/run-tests.sh` starten
7. direkt im Browser testen, wenn UI oder Interaktion betroffen ist
8. Backlog-Status und Akzeptanzkriterien aktualisieren

---

## ⚠️ Wichtige Prinzipien

### 1. Minimal-invasive Änderungen

- keine unnötigen Refactorings
- bestehende Logik erhalten
- nur gezielt UI/Verhalten anpassen

### 2. Bestehende Features schützen

Insbesondere:

- Lightbox (Zoom, Swipe, Navigation)
- Touch-Navigation
- Bild-Refresh- und Offline-Logik
- Badge-Statusanzeige

### 3. Schrittweise arbeiten

👉 Immer nur **eine Änderung gleichzeitig** mit Copilot durchführen

---

## 📂 Warum dieser Ordner sinnvoll ist

Diese Dokumente helfen dir dabei:

- schneller mit Copilot zu arbeiten
- konsistente Änderungen umzusetzen
- deine Architekturentscheidungen nachzuvollziehen
- Release-Entscheidungen anhand von Akzeptanzkriterien abzusichern
- später problemlos weiterzuentwickeln

---

## 🚀 Fazit

Der `docs/`-Ordner ist dein persönliches **Operations-Handbuch für die Weiterentwicklung** des Dashboards.

Er hält die Anwendung selbst schlank und trennt klar zwischen:

- 🟢 produktivem Code (`index.html`, `app.js`, CSS)
- 🔵 Entwicklungslogik (Backlog, Architektur, UI-Struktur, Copilot-Prompts und Planung)

---

💡 Tipp:
Wenn sich dein Projekt weiterentwickelt, kannst du hier zusätzlich ablegen:

- UI-Skizzen
- zukünftige Backlog-Ideen
