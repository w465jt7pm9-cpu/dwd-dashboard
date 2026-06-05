# 📂 docs – Copilot & Arbeitsdokumentation

## Zweck dieses Ordners

Dieser Ordner enthält unterstützende Dokumente für die **Entwicklung und Weiterentwicklung des DWD Dashboards mit GitHub Copilot**.

Die Dateien sind **keine Bestandteil der laufenden Anwendung**, sondern dienen ausschließlich:
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

### 2. `copilot-checklist.md`
Kompakte Version der Prompts in Form einer Schritt-für-Schritt-Checkliste.

✅ Zweck:
- schneller Copy-&-Paste in Copilot Chat
- reduzierte Komplexität im Alltag
- Fokus auf einzelne Änderungen

👉 Nutzung:
- für **schnelle Umsetzung** in VS Code

---

### 3. `copilot-session-plan.md`
Definiert die optimale **Reihenfolge und Struktur** für die Arbeit mit Copilot.

✅ Zweck:
- klare Schrittfolge
- minimiert Fehler und unnötige Refactorings
- sorgt für stabile, inkrementelle Änderungen

👉 Nutzung:
- als **Leitfaden während der Entwicklungssession**

---

## 🧠 Empfohlener Workflow

1. `copilot-session-plan.md` öffnen
2. passenden Schritt auswählen
3. Prompt aus `copilot-checklist.md` kopieren
4. in Copilot Chat einfügen
5. Änderung umsetzen lassen
6. direkt im Browser testen
7. zum nächsten Schritt gehen

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
- Bild-Refresh-Logik
- Badge-Statusanzeige

### 3. Schrittweise arbeiten
👉 Immer nur **eine Änderung gleichzeitig** mit Copilot durchführen

---

## 📂 Warum dieser Ordner sinnvoll ist

Diese Dokumente helfen dir dabei:
- schneller mit Copilot zu arbeiten
- konsistente Änderungen umzusetzen
- deine Architekturentscheidungen nachzuvollziehen
- später problemlos weiterzuentwickeln

---

## 🚀 Fazit

Der `docs/`-Ordner ist dein persönliches **Operations-Handbuch für die Weiterentwicklung** des Dashboards.

Er hält die Anwendung selbst schlank und trennt klar zwischen:
- 🟢 produktivem Code (`index.html`, `app.js`, CSS)
- 🔵 Entwicklungslogik (Copilot-Prompts und Planung)

---

💡 Tipp:
Wenn sich dein Projekt weiterentwickelt, kannst du hier zusätzlich ablegen:
- Architekturentscheidungen
- UI-Skizzen
- zukünftige Backlog-Ideen
