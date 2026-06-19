## Lightbox-Interaktionen

> Seit US-009 wurde die Lightbox erweitert: Peek-Nachbarbilder, weichere Bildwechsel und zyklische Navigation.
> Im Zoom-Modus sind Pfeile standardmäßig ausgeblendet und erscheinen bei Hover/Fokus wieder.

```mermaid
flowchart TD
  Open[Open Lightbox] --> Zoom
  Zoom --> Pan
  Zoom --> Scale[Pinch / Wheel / Double-Tap]
  Open --> Peek[Peek links/rechts sichtbar]
  Zoom --> SwitchImage[Bild wechseln zyklisch]
  SwitchImage --> NextPrev[Buttons / Swipe L/R / Arrow L/R]
  Zoom --> ArrowVisibility[Pfeile: hidden when zoomed]
  ArrowVisibility --> ArrowHover[visible on Hover / Focus]
  Pan --> Move[Drag]
  TapBg[Tap Hintergrund] --> Close
  SwipeDown[Swipe Down] --> Close
  Esc[ESC PC] --> Close
```
