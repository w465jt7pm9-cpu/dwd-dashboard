## Gesamtarchitektur

> Update US-013: Seegang-Refresh nutzt einen globalen Datenzyklus (~07/~19 UTC) fuer alle WX_SEE-Seiten.
> Update US-014: Offline-Zugriff bleibt stabil durch lokale Persistenz des letzten erfolgreichen Bildstands je Karte.

```mermaid
flowchart LR
  User[User PC / iPad / iPhone]
  subgraph Browser
    UI[UI Layer<br/>HTML / CSS]
    App[App Controller<br/>app.js]
    Carousel[Carousel / Pages<br/>inkl. Seegang-Seiten, global erweiterbar]
    Lightbox[Lightbox<br/>Peek + Elastic Pan/Snap-Back + Cyclic Nav]
    Gestures[Input Handling<br/>Touch / Wheel / Key]
    Theme[Theme Manager<br/>Automatic Dark Mode]
    Refresh[Refresh Manager<br/>Auto-Zyklus + Pull-to-Refresh]
    OfflineState[Offline State<br/>Banner + Last Successful Refresh]
    Persistence[Local Persistence<br/>last known image URL per card]
  end
  subgraph External
    DWD[DWD Image Sources]
  end
  User --> UI
  UI --> App
  App --> Carousel
  App --> Lightbox
  App --> Gestures
  App --> Theme
  App --> Refresh
  App --> OfflineState
  App --> Persistence
  App --> DWD
```
