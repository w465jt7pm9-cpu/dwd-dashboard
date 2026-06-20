# Copilot Session Plan – DWD Dashboard

> Teststatus (2026-06-20): Erfolgreich abgeschlossen (US-015/US-016, End-to-End geprueft).

## Zweck
Diese Datei ist ein kurzer Ablaufplan für die Arbeit mit GitHub Copilot in VS Code.
Sie legt fest, **welcher Prompt in welcher Datei** am sinnvollsten ausgeführt wird.

---

## Empfohlene Reihenfolge

### Schritt 1 – Analyse
**Datei öffnen:** `index.html` und `app.js`  
**Prompt verwenden:** Analyse aus `copilot-checklist.md`

**Ziel:**
- betroffene DOM-Elemente identifizieren
- betroffene Funktionen identifizieren
- minimale Änderungsstrategie festlegen
- Risiken vorab sichtbar machen

---

### Schritt 2 – Sichtbare Steuerleisten entfernen
**Datei öffnen:** `index.html`  
**Dann zusätzlich:** `app.js`  
**Prompt verwenden:** „Topbar + Thumbbar entfernen“

**Ziel:**
- `#topbar` entfernen oder unsichtbar machen
- `.thumbbar` entfernen oder unsichtbar machen
- sichtbare `pageTitle`, `status`, `pageSummary` entfernen bzw. ausblenden
- Event-Listener in `app.js` defensiv bereinigen

---

### Schritt 3 – Zyklische Navigation umsetzen
**Datei öffnen:** `app.js`  
**Prompt verwenden:** „Navigation zyklisch machen“

**Ziel:**
- `goToPage()` so anpassen, dass die Seitennavigation zyklisch wird
- ArrowLeft / ArrowRight, Swipe und Edge-Tap konsistent halten
- Lightbox-Navigation nicht verändern

---

### Schritt 4 – Pull-to-Refresh ergänzen
**Datei öffnen:** `app.js`  
**Prompt verwenden:** „Pull-to-Refresh statt Buttons“

**Ziel:**
- Refresh-Button-Logik als Bedienkonzept ersetzen
- Pull-to-Refresh nur auf Seiten `0–2`
- nur im oberen Startzustand
- kein zusätzliches visuelles Feedback
- Lightbox unberührt lassen

---

### Schritt 5 – Theme auf Systemsteuerung umstellen
**Datei öffnen:** `app.js`  
**Prompt verwenden:** „Theme automatisch aus dem System“

**Ziel:**
- `prefers-color-scheme` verwenden
- live auf Systemwechsel reagieren
- manuelle Theme-Toggle-Logik entfernen oder stilllegen

---

### Schritt 6 – Redundante Statuslogik bereinigen
**Datei öffnen:** `app.js`  
**Prompt verwenden:** „Redundante Statuslogik bereinigen“

**Ziel:**
- keine globale sichtbare Status-/Summary-Anzeige mehr
- Karten-Badges beibehalten
- Offline-/Refresh-Stabilität erhalten

---

### Schritt 7 – Abschluss-Review
**Datei öffnen:** `index.html` und `app.js`  
**Prompt verwenden:** „Abschluss-Review“

**Ziel:**
- Regressionen erkennen
- tote Logik finden
- letzte Bereinigungen planen
- manuelle Testliste durchgehen

---

## Praktischer Einsatz in VS Code

### Schnellster Workflow
1. `copilot-checklist.md` offen lassen
2. die jeweils betroffene Datei öffnen
3. Kurzprompt kopieren
4. Copilot Chat nur für **einen Änderungsschritt gleichzeitig** verwenden
5. nach jedem Schritt manuell testen
6. erst dann zum nächsten Schritt gehen

---

## Empfehlung zur Ablage

### Sinnvoll ins Projekt aufnehmen
**Ja, aber am besten nicht im Runtime-Pfad der App.**

Empfohlene Ablage:
- `docs/copilot-prompts.md`
- `docs/copilot-checklist.md`
- `docs/copilot-session-plan.md`

### Warum diese Ablage sinnvoll ist
- bleibt versionierbar
- hilft bei späteren Änderungen
- dokumentiert Entscheidungen für dich selbst
- stört weder HTML, JS noch Deployment-Struktur

### Wenn du es besonders schlank halten willst
Dann kannst du die Dateien auch **außerhalb** des eigentlichen App-Ordners halten, z. B. in einem separaten Notiz-/Arbeitsordner.

---

## Empfehlung

Für dein Solo-Projekt würde ich diese Dateien **aufnehmen, aber in einen `docs/`-Ordner legen**.
Nicht neben `index.html`, `app.js` oder produktiven Assets, sondern klar getrennt als Arbeits- und Projektdokumentation.
