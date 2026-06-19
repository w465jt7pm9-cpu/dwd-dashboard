## UI-Struktur

> Release 1.0: Fokus auf ruhige, bildschirmfüllende Wetterkarte ohne Menü, mit natürlicher Navigation und automatischem Dark Mode.
> Update US-009: Lightbox zeigt subtile Peek-Nachbarn und nutzt zyklische, weiche Bildnavigation.

```mermaid
flowchart TD
  App[App Container] --> Pages[Pages / Carousel]
  Pages --> Land[Landkarte]
  Pages --> See[Seewetter]
  Pages --> Hoehenwetter[Höhenwetter]
  Pages --> Texte[Info / Beschriftung]
  Pages --> Cards[Overlay Karten]
  Cards --> Lightbox[Lightbox]
  Lightbox --> Image[Hauptbild - Zoomed]
  Lightbox --> Peek[Peek links/rechts]
  Lightbox --> Arrows[Pfeile dynamisch]
  Lightbox --> Overlay[Hintergrund]
  App --> Gestures[Gesten / Pfeiltasten]
  App --> Theme[Automatischer Dark Mode]
  App --> Refresh[Pull-to-Refresh]
```
