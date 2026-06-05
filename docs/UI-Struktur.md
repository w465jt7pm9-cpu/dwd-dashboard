## UI-Struktur

```mermaid
flowchart TD
  App --> Pages
  Pages --> Land
  Pages --> See
  Pages --> Hoehenwetter
  Pages --> Texte
  Pages --> Cards
  Cards --> Lightbox
  Lightbox --> Image[Zoomed Image]
  Lightbox --> Arrows[Pfeile]
  Lightbox --> Overlay[Hintergrund]
```
