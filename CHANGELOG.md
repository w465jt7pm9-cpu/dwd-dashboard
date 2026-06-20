# Changelog

Alle relevanten Änderungen seit `Release-1.0`.

## Release-1.1

### Features
- **US-009:** Lightbox-Navigation und Zoom-Polish verbessert (Peek-Navigation).
- **US-010:** Elastic Pan Snap-Back im Bildmodus umgesetzt.
- **US-011:** Nordsee-Seite mit Seegangskarten integriert (Seite 3).
- **US-012:** Ostsee-Seite mit Seegangskarten integriert (Seite 4).
- **US-013:** Einheitlichen Aktualisierungszyklus für Seegangskarten eingeführt.
- **US-014:** Offline-Unterstützung verbessert (Cache-Differenzierung, transparentes Reconnect-Verhalten, robuste Anzeige bei Resize/Orientierung).

### Fixes & Verbesserungen
- Offline-Banner-Position angepasst, um Kollisionen mit System-UI zu vermeiden.
- Offline-Bildpersistenz bei Größen- und Orientierungswechsel gehärtet.
- Dokumentation zur Architektur, UI-Struktur und zum Workflow aktualisiert.
- Backlog-Struktur und US-Einordnung bereinigt.

### Technische Änderungen
- Service-Worker-Cache-Version auf `dwd-dashboard-v1-1` erhöht, damit Clients den neuen Cache-Bestand übernehmen.

### Referenz (Commits seit `Release-1.0`)
- `70bc9bd` Implement US-009 lightbox peek navigation and zoom polish
- `46eb810` Implement US-010 elastic pan snap-back and update docs
- `dc9927e` Implement US-011 Nordsee page and update docs
- `037fe00` Implement US-012 Ostsee page and update documentation
- `897fa15` Implement US-013 global sea-state refresh cycle and docs updates
- `3df41c0` Implement US-014 offline support: improved cache differentiation and transparent reconnection
- `064da87` Center offline banner to avoid collision with system clock and icons
- `495b848` Harden offline image persistence on resize and update docs
- `679d2d1` docs: align US-014 placement and backlog structure
- `1f711ad` docs: clarify architecture and UI for global sea cycle and offline persistence
- `abfe325` docs: update docs README to current architecture and workflow
