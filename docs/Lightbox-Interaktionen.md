## Lightbox-Interaktionen

> Teststatus (2026-06-20): Erfolgreich abgeschlossen (US-015/US-016, End-to-End geprueft).

> Seit US-009 wurde die Lightbox erweitert: Peek-Nachbarbilder, weichere Bildwechsel und zyklische Navigation.
> Im Zoom-Modus sind Pfeile standardmäßig ausgeblendet und erscheinen bei Hover/Fokus wieder.
> Seit US-010 nutzt Pan ein Elastic-Resistance-Verhalten mit kurzem, weichem Snap-Back in den gültigen Bereich.

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
  Pan --> Move[Drag mit Resistance]
  Move --> SnapBack[Soft Snap-Back on Release]
  TapBg[Tap Hintergrund] --> Close
  SwipeDown[Swipe Down] --> Close
  Esc[ESC PC] --> Close
```
