## UI-Struktur

> Release 1.0: Fokus auf ruhige, bildschirmfüllende Wetterkarte ohne Menü, mit natürlicher Navigation und automatischem Dark Mode.
> Update US-009: Lightbox zeigt subtile Peek-Nachbarn und nutzt zyklische, weiche Bildnavigation.
> Update US-010: Zoom-Pan verhält sich elastisch mit weichem Snap-Back beim Loslassen.
> Update US-011: Neue Carousel-Seite für Seegang Nordsee mit zweizeiligem Kartenlayout.

```mermaid
flowchart TD
  App[App Container] --> Pages[Pages / Carousel]
  Pages --> Land[Landkarte]
  Pages --> See[Seewetter]
  Pages --> Hoehenwetter[Höhenwetter]
  Pages --> Nordsee[Seegang Nordsee]
  Pages --> Texte[Info / Beschriftung]
  Pages --> Cards[Overlay Karten]
  Cards --> Lightbox[Lightbox]
  Lightbox --> Image[Hauptbild - Zoomed]
  Lightbox --> Peek[Peek links/rechts]
  Lightbox --> Arrows[Pfeile dynamisch]
  Lightbox --> Elastic[Elastic Pan + Soft Clamp]
  Lightbox --> Overlay[Hintergrund]
  App --> Gestures[Gesten / Pfeiltasten]
  App --> Theme[Automatischer Dark Mode]
  App --> Refresh[Pull-to-Refresh]
```
