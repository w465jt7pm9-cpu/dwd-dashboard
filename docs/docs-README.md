# 📂 docs – Copilot & Arbeitsdokumentation

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

Enthält ausführliche, strukturierte Prompts für GitHub Copilot.

✅ Zweck:

- vollständige Beschreibung aller geplanten Änderungen
- detaillierte Anforderungen und Randbedingungen
- geeignet für komplexe oder erste Implementierungen

👉 Nutzung:

- wenn du Änderungen **verstehen oder neu aufsetzen** willst

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
- Bezug zu releaseten UX-Updates (z. B. US-009 bis US-014)

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

Kompakte Version der Prompts in Form einer Schritt-für-Schritt-Checkliste.

✅ Zweck:

- schneller Copy-&-Paste in Copilot Chat
- reduzierte Komplexität im Alltag
- Fokus auf einzelne Änderungen

👉 Nutzung:

- für **schnelle Umsetzung** in VS Code

---

### 7. `copilot-session-plan.md`

Definiert die optimale **Reihenfolge und Struktur** für die Arbeit mit Copilot.

✅ Zweck:

- klare Schrittfolge
- minimiert Fehler und unnötige Refactorings
- sorgt für stabile, inkrementelle Änderungen

👉 Nutzung:

- als **Leitfaden während der Entwicklungssession**

---

## 🧠 Empfohlener Workflow

1. `backlog.md` öffnen und aktives Ziel (US) prüfen
2. `Gesamtarchitektur.md` und `UI-Struktur.md` für den betroffenen Bereich querlesen
3. bei Lightbox-/Gesten-Themen zusätzlich `Lightbox-Interaktionen.md` prüfen
4. passenden Prompt aus `copilot-prompts.md` oder `copilot-checklist.md` wählen
5. Änderung umsetzen lassen
6. direkt im Browser testen (inkl. Regression der Kerninteraktionen)
7. Backlog-Status und Akzeptanzkriterien aktualisieren

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
