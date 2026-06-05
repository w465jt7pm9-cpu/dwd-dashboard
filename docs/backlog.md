# 📊 DWD Dashboard – Mini Backlog

---

# 🧭 KANBAN ÜBERSICHT

## 🟥 TODO

- US-001 Menü entfernen
- US-003 Pull-to-Refresh
- US-004 Dark Mode automatisch
- US-005 Metadaten entfernen

## 🟨 DOING

- US-002 Navigation über Gesten

## ✅ DONE

- (leer)

---

# 📦 BACKLOG DETAILS

## 🔴 US-001 – Menü vollständig entfernen

**Status:** TODO  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 2 (Topbar + Thumbbar entfernen)

**Beschreibung**  
Als Nutzer möchte ich kein oberes Menü sehen, damit die Anzeige auf die Inhalte fokussiert bleibt.

**Akzeptanzkriterien**

- Menü wird nicht angezeigt
- Keine Funktionen gehen verloren

---

## 🔴 US-002 – Navigation über Gesten/Tasten

**Status:** TODO  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 3 (Navigation zyklisch)

**Beschreibung**  
Als Nutzer möchte ich per Pfeiltasten (Desktop) und Swipe (Mobile) navigieren.

**Akzeptanzkriterien**

- Links-/Rechts-Tasten funktionieren am PC
- Swipe funktioniert auf iPad/iPhone
- Navigation ist zyklisch

---

## 🟡 US-003 – Aktualisierung per Pull-to-Refresh

**Status:** TODO  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 4 (Pull-to-Refresh)

**Beschreibung**  
Als Nutzer möchte ich durch Herunterziehen aktualisieren statt eines Buttons.

**Akzeptanzkriterien**

- Pull-to-Refresh funktioniert auf Touch-Geräten und Trackpad
- Nur auf Seiten 0–2 aktiv
- Nur im oberen Startzustand aktiv
- Kein zusätzlicher visueller Hinweis

---

## 🟡 US-004 – Dark Mode automatisch übernehmen

**Status:** TODO  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 5 (Theme automatisch)

**Beschreibung**  
Als Nutzer möchte ich keinen Night-Mode-Schalter, sondern eine automatische Anpassung an das System.

**Akzeptanzkriterien**

- System-Dark-Mode wird erkannt
- Live-Wechsel wird übernommen
- Kein Toggle vorhanden

---

## 🟢 US-005 – Metadaten entfernen

**Status:** TODO  
**Priorität:** Niedrig

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 6 (Statuslogik bereinigen)

**Beschreibung**  
Land, Höhe und Seegang sollen nicht mehr als Text dargestellt werden.

**Akzeptanzkriterien**

- Keine sichtbaren Titel (Land, See, Höhe)
- Keine globale Statusanzeige
- Bild bleibt alleinige Informationsquelle

---

# ✅ DONE (DETAILS / HISTORIE)

_(hierher verschieben, wenn erledigt)_

---

# 💡 IDEEN (UNSORTIERT)

## 🔄 Refresh-Zyklus optimieren

**Idee:**  
Die DWD-Bilddaten werden in festen Intervallen aktualisiert. Zwischen diesen Intervallen liefern erneute Requests identische Inhalte. Der aktuelle Refresh-Mechanismus berücksichtigt diesen Veröffentlichungsrhythmus nicht.

**Ziel:**

- Anpassung der Refresh-Logik an den tatsächlichen Veröffentlichungszyklus der Datenquelle
- Reduktion redundanter Netzwerkanfragen

**Nutzen:**

- weniger Datenverbrauch (insbesondere mobil)
- effizientere Nutzung der API/Quelle
- verbesserte Performance und Responsiveness

## 🌊 Gezeiten- und Stromdaten integrieren

**Idee:**  
Ergänzung des Dashboards um Gezeiten- und Strömungsdaten für die Nordsee zur besseren Bewertung von Wind-gegen-Strom-Situationen.

**Ziel:**

- Kombination von Wetterdaten mit Tiden-/Strömungsinformationen
- Erkennung potenziell kritischer Seezustände durch gegenläufige Effekte

**Nutzen:**

- realistischere Einschätzung der Seebedingungen
- erhöhte Sicherheit bei Navigation in küstennahen Revieren
- bessere Entscheidungsgrundlage für Nutzer unterwegs

## Animation beim Bildwechsel

**Idee:** Weiche Transition beim Seitenwechsel
👉 **Mögliche Umsetzung:** neuer Copilot-Task erforderlich

## Offline-Modus erweitern

**Idee:** Offline-Nutzung verbessern
👉 **Mögliche Umsetzung:** basiert auf bestehendem Service Worker (`sw.js`)
