# 📊 DWD Dashboard – Mini Backlog

> Teststatus (2026-06-20): Erfolgreich abgeschlossen (US-015/US-016, End-to-End geprueft).

---

# 🧭 KANBAN ÜBERSICHT

## 🟥 TODO

---

## 🧭 US-021 – Kompaktes Inhaltsfenster in der gezoomten Seegang-Ostsee-Lightbox

**Status:** DONE  
**Priorität:** Mittel

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich in der gezoomten Lightbox der Seite „Seegang Ostsee“ pro aktuell geöffneter Karte ein kompaktes Inhaltsfenster sehen  
damit ich Zeitbezug, Kontext und die kompakte Ostsee-Zeitreihen-Übersicht direkt in der Lightbox zur Verfügung habe, ohne dass die eigentliche Bildansicht überladen wirkt

---

### 🎯 Zielbild

- Das Inhaltsfenster wird nur in der Ostsee-Lightbox eingeblendet und bleibt auf diese Seite begrenzt
- Es erscheint als optisch abgesetztes Overlay im Lightbox-Fenster und nimmt dabei nur einen begrenzten Teil der Höhe ein
- Es zeigt die kompakte Zeitreihen-Ansicht mit Wind, Böen, Welle und Wetter für die aktuelle Karte
- Der Inhalt kann bei Bedarf zusammengeklappt werden, ohne die Zoom-/Pan-/Swipe-Interaktion zu beeinträchtigen

---

### ✅ Akzeptanzkriterien

- [x] In der Lightbox der Seite „Seegang Ostsee“ wird pro Karte ein kompaktes Inhaltsfenster eingeblendet
- [x] Das Fenster zeigt einen klaren zeitlichen Bezug zu der jeweiligen Vorhersage bzw. dem jeweiligen Bild
- [x] Das Fenster bleibt auf die Ostsee-Lightbox begrenzt und beeinflusst andere Seiten nicht
- [x] Die bestehende Zoom-/Pan-/Swipe-Interaktion bleibt stabil
- [x] Die Darstellung ist als kompakte, scrollbare Zeitreihen-Ansicht umgesetzt und kann bei Bedarf zusammengeklappt werden

### 💡 Ergänzung zur Abgrenzung

- Die eigentliche Zeitreihen-Darstellung ist bereits in US-020 beschrieben; US-021 fokussiert auf die Platzierung, den Kontext und die Integration des Fensters in die Lightbox
- Eine zusätzliche US-022 wäre derzeit nur dann sinnvoll, wenn künftig weitere Interaktionsstufen geplant sind, etwa Filter, Auswahl weiterer Zeiträume oder separate Datenquellen

---

## 🌬️ US-020 – Kompakte Darstellung von DWD-Seewetter-Zeitreihen

**Status:** DONE  
**Priorität:** Hoch

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich die DWD-Seewettervorhersagen für Nord- und Ostsee in einer kompakten, leicht lesbaren Tabellen- bzw. Zeitreihen-Darstellung sehen  
damit ich Wind, Böen, Seegang und Wetterentwicklung über mehrere Tage schnell erfassen kann, ohne die langen Rohtexte der DWD-Seewetterberichte lesen zu müssen

---

### 🎯 Zielbild

- Zeitachse verläuft horizontal von links nach rechts
- Seegebiete werden untereinander in klaren Zeilen dargestellt
- Kompakte, übersichtliche Tabellen- bzw. Zeitreihenansicht
- Windrichtung als meteorologische Herkunftsrichtung visualisiert
- Wellenhöhe numerisch in Metern
- Wetterereignisse als Kürzel oder Symbol

---

### 🗂️ Datenquellen

Primär:

- DWD „Seewettervorhersagen Ostsee“ (FEBQ52-Inhalt)
- URL: https://www.dwd.de/DE/leistungen/seevorhersageostsee/seevorhersagenostsee.html?nn=16102

Alternativ:

- DWD OpenData (Produktkennung FEBQ52)
- Basis: https://opendata.dwd.de/weather/maritime/forecast/german/

Enthaltene Gebiete umfassen unter anderem:

- Skagerrak
- Kattegat
- Belte/Sund
- Kieler Bucht
- Mecklenburger Bucht
- Westlich Rügen
- Boddengewässer Ost
- Südliche Ostsee
- Zentrale Ostsee
- Nördliche Ostsee
- Rigaischer Meerbusen

Hinweis:

- Es werden ausschließlich DWD-Text- und Zeitreihenprodukte verwendet, ohne eigene Bild- oder Karteninterpretation

---

### 🧭 Fachliche Regeln

**Windrichtungen (meteorologische Herkunftsrichtung)**

| Richtung | Symbol |
| -------- | ------ |
| W        | →      |
| NW       | ↘      |
| N        | ↓      |
| SW       | ↗      |
| O        | ←      |
| S        | ↑      |

**Wetterkürzel / Symbole**

| DWD       | Anzeige                |
| --------- | ---------------------- |
| RAIN      | 🌧                      |
| SH        | 🌦                      |
| TS        | ⛈⚠ (roter Warnbadge)   |
| FOG       | ☰⚠ (3 Striche, U+2630) |
| MIST / BR | ⚌⚠ (2 Striche, U+268C) |

---

### ✅ Akzeptanzkriterien

**AK1 – Zeitachse**

- [x] Gegeben eine DWD-Seewetterzeitreihe
- [x] Wenn die Daten dargestellt werden
- [x] Dann müssen die Vorhersagezeitpunkte horizontal von links nach rechts angeordnet sein

**AK2 – Mehrere Seegebiete**

- [x] Gegeben eine DWD-Ostseevorhersage
- [x] Wenn die Daten aufbereitet werden
- [x] Dann müssen alle enthaltenen Seegebiete dargestellt werden

**AK3 – Winddarstellung**

- [x] Gegeben eine Windrichtung und Windstärke
- [x] Wenn die Tabelle erzeugt wird
- [x] Dann müssen Richtung und Beaufort-Wert in einer kompakten Zelle kombiniert dargestellt werden
- [x] Beispielzellen: ↘6, →5, ↓4

**AK4 – Seegang**

- [x] Gegeben eine signifikante Wellenhöhe
- [x] Wenn die Tabelle erzeugt wird
- [x] Dann muss die Wellenhöhe in Metern angezeigt werden

**AK5 – Wetter**

- [x] Gegeben Wetterereignisse im DWD-Bericht
- [x] Wenn ein Ereignis vorhanden ist
- [x] Dann soll ein Symbol oder Kürzel angezeigt werden

**AK6 – Keine Bildanalyse**

- [x] Gegeben DWD-Textprodukte
- [x] Wenn Vorhersagen erzeugt werden
- [x] Dann sollen ausschließlich die bereits vom DWD interpretierten Text- und Zeitreihenprodukte verwendet werden und keine eigene Wetterinterpretation aus Wetterkarten erfolgen

---

### 📈 Nutzen

Der Anwender erhält eine kompakte, nautisch nutzbare Übersicht, die eine schnelle Lesbarkeit mit der fachlichen Qualität der vom DWD bereitgestellten Seewettervorhersagen kombiniert.

---

## 🧭 US-022 – Kompakte Nordsee-Zeitreihe in der Seegang-Nordsee-Lightbox

**Status:** DONE  
**Priorität:** Mittel

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich in der gezoomten Lightbox der Seite „Seegang Nordsee“ eine kompakte Zeitreihen-Ansicht der DWD-Seewettervorhersage Nordsee sehen  
damit ich Wind, Böen, Seegang und Wetterentwicklung auch für die Nordsee schnell erfassen kann, ohne die langen Rohtexte der DWD-Seewetterberichte lesen zu müssen

---

### 🎯 Zielbild

- Die Nordsee-Zeitreihe wird direkt in der Nordsee-Lightbox als kompaktes Overlay dargestellt
- Die Zeitachse verläuft horizontal von links nach rechts
- Die Darstellung zeigt mehrere Seegebiete der Nordsee in klaren Zeilen an
- Wind, Böen, Wellenhöhe und Wetter werden in einer kompakten, leicht lesbaren Tabelle angezeigt
- Die Darstellung bleibt auf die Nordsee-Lightbox begrenzt und beeinflusst andere Seiten nicht

---

### 🗂️ Datenquelle

- DWD „Seewettervorhersagen Nordsee“
- URL: https://www.dwd.de/DE/leistungen/seevorhersagenordsee/seevorhersagennordsee.html?nn=16102

---

### ✅ Akzeptanzkriterien

- [ ] In der Lightbox der Seite „Seegang Nordsee“ wird pro Karte ein kompaktes Inhaltsfenster eingeblendet
- [ ] Die Darstellung zeigt die Vorhersagezeitpunkte horizontal von links nach rechts an
- [ ] Die enthaltenen Seegebiete der Nordsee-Vorhersage werden in separaten Zeilen dargestellt
- [ ] Wind und Böen werden kombiniert als Richtung + Beaufort-Wert dargestellt
- [ ] Wellenhöhe wird in Metern angezeigt
- [ ] Wetterereignisse werden als Kürzel oder Symbol dargestellt
- [ ] Die bestehende Zoom-/Pan-/Swipe-Interaktion bleibt stabil
- [ ] Die Darstellung bleibt auf die Nordsee-Lightbox begrenzt und beeinflusst andere Seiten nicht

### 💡 Optionales Feature

- Ein Collapse-/Expand-Button analog zur Ostsee-Zeitreihe, damit die Lightbox bei Bedarf kompakter bleibt

---

## 🌊 US-023 – AdG-Gezeitenindikator in der DWD-Nordsee-Zeitreihe

**Status:** DONE  
**Priorität:** Mittel

---

### 🧑‍💻 Beschreibung

Als Nutzer eines Nordsee-Wetterdashboards (Segler, Skipper, Offshore-Nutzer)  
möchte ich den aktuellen Stand des Spring-Nipp-Zyklus direkt in der DWD-Zeitreihe sehen  
damit ich Wind, Welle und Wetter im Zusammenhang mit den erwarteten Gezeiten- und Strömungsverhältnissen bewerten kann

---

### 🎯 Zielbild

- Die bestehende DWD-Nordsee-Zeitreihe wird um einen zusätzlichen Gezeitenindikator erweitert
- Der Indikator basiert auf einem pragmatischen 28-Tage-Phasenmodell
- Die Darstellung erfolgt als durchgehender Farbbalken in der zweiten Zeile unter Datum/Uhrzeit
- Je Zeitstufe wird ein Textmarker angezeigt (Spring, Mitt, Nipp)
- Der Balken wird pro Zeitstufe (06, 12, 18, 00 UTC) aktualisiert

---

### 🧭 Phasenmodell (28 Tage)

- 4 Tage Spring
- 3 Tage Mitt
- 4 Tage Nipp
- 3 Tage Mitt
- Danach Wiederholung desselben 14-Tage-Blocks (zweites Halbmonat)

Damit ergibt sich ein 28-Tage-Zyklus mit nautisch verständlicher Klassifizierung statt astronomischer Feingranularität.

---

### 🎨 Farbcodierung

- Springzeit: Grün (Marker: Spring)
- Mittzeit: Gelb (Marker: Mitt)
- Nippzeit: Blau (Marker: Nipp)

---

### ✅ Akzeptanzkriterien

**AK1 – Sichtbarkeit**

- [x] Gegeben eine geöffnete DWD-Nordsee-Zeitreihe
- [x] Wenn die Zeitreihe dargestellt wird
- [x] Dann wird oberhalb der Zeitstufen ein Gezeitenbalken angezeigt

**AK2 – 28-Tage-Phasenlogik**

- [x] Gegeben ein Prognosezeitpunkt
- [x] Wenn die Zeitreihe erzeugt wird
- [x] Dann wird die Phase bevorzugt aus einem definierten Referenzmuster bestimmt (z. B. August 2026)
- [x] Und außerhalb definierter Referenzfenster wird die Phase aus dem wiederkehrenden 28-Tage-Modell (4/3/4/3 + 4/3/4/3) abgeleitet

**AK3 – Farbcodierung**

- [x] Gegeben eine berechnete Phase
- [x] Wenn der Wert dargestellt wird
- [x] Dann wird Springzeit grün angezeigt
- [x] Und Mittzeit wird gelb angezeigt
- [x] Und Nippzeit wird blau angezeigt

**AK4 – Responsive Darstellung**

- [x] Gegeben ein mobiles Endgerät
- [x] Wenn die Zeitreihe dargestellt wird
- [x] Dann bleibt der Gezeitenbalken synchron zu den Zeitspalten ausgerichtet

**AK5 – Marker in zweiter Datumszeile / Scroll-Sichtbarkeit**

- [x] Gegeben die Nordsee-Zeitreihe mit horizontal scrollbarer Zeitachse
- [x] Wenn der Nutzer in der Zeitreihe horizontal oder vertikal scrollt
- [x] Dann bleibt die zweite Zeile unter der Datums-/Uhrzeitzeile sichtbar und spalten-synchron ausgerichtet
- [x] Und die Phasenkennzeichnung ist je Zeitstufe als Textmarker (Spring, Mitt, Nipp) erkennbar
- [x] Und ein statischer Zeilenlabel-Text "AdG" kann entfallen

**AK6 – Tooltip (optional detailliert)**

- [x] Gegeben der Nutzer bewegt den Mauszeiger über ein Segment
- [x] Wenn ein Segment fokussiert wird
- [x] Dann werden mindestens Datum/Uhrzeit und Phase angezeigt
- [x] Und optional kann zusätzlich ein numerischer AdG-Wert angezeigt werden

Beispiel:

- Do 06.08.2026 18 UTC → Nippzeit

---

### 📆 Referenzbeispiel August 2026

Datum	Phase
- 01-03:	Mitt
- 04-08:	Nipp
- 09:	    Mitt
- 10-14:  Spring
- 15-17:	Mitt
- 18-22:	Nipp
- 23-25:	Mitt
- 26-30:	Spring
- 31:	    Mitt

---

### 🧪 Technische Notiz

- Für das Dashboard wird bewusst ein pragmatisches, nautisch verständliches 28-Tage-Modell verwendet (statt astronomisch exaktem AdG)
- Ziel ist schnelle Einordnung: springnah, nippnah oder Übergangsphase
- Für fachlich belegte Referenzfenster kann ein explizites Tages-Phasenmuster hinterlegt werden
- Außerhalb dieser Referenzfenster wird das Modell zyklisch aus einem definierten Referenzdatum abgeleitet und bleibt dadurch für beliebige Prognosezeiträume nutzbar

---

### 🛠️ Umsetzungsansatz (Technische Tasks)

**Daten & Berechnung**

- [x] Zyklusfunktion für das 28-Tage-Schema (4/3/4/3 + 4/3/4/3) implementieren
- [x] Referenzdatum und Zyklusoffset fachlich festlegen und im Code dokumentieren
- [x] Mapping-Regeln auf Tidephase (Springzeit/Mittzeit/Nippzeit) zentral kapseln
- [x] Referenzfenster-Override für fachliche Sondermuster (August 2026) vor dem Zyklus-Fallback auswerten

**UI-Integration Zeitreihe**

- [x] Zusätzliche Balken-Zeile oberhalb der Zeitstufen in der Nordsee-Zeitreihe einfügen
- [x] Pro Zeitstufe ein Segment rendern und per Phase einfärben (grün/gelb/blau)
- [x] Segmentbreiten an bestehende Zeitspalten koppeln, damit die Ausrichtung stabil bleibt

**Tooltip & Interaktion**

- [x] Tooltip pro Segment implementieren (Hover/Focus)
- [x] Tooltip-Inhalt aus Zeitstempel + Phase dynamisch erzeugen (optional mit numerischem AdG)
- [x] Touch-Variante für mobile Geräte sicherstellen (Tap/Fokus statt reinem Hover)

**Responsive & Qualität**

- [x] Darstellung in mobilen Breakpoints gegen Zeitspalten-Drift prüfen
- [x] Visuelle Regression für Desktop/Mobil absichern
- [x] Fallback definieren, falls AdG-Berechnung temporär nicht verfügbar ist (z. B. neutrales Segment + Hinweis)

---

### ⏱️ Aufwandsschätzung (für Sprint-Planung)

- Daten & Berechnung: S-M (ca. 0.5-1.5 PT)
- UI-Integration Zeitreihe: M (ca. 1-2 PT)
- Tooltip & Interaktion: S-M (ca. 0.5-1 PT)
- Responsive & Qualität: S-M (ca. 0.5-1 PT)

Gesamtschätzung:

- M (ca. 2.5-5.5 PT, abhängig von Übergangslogik und gewünschtem Tooltip-Detail)

---

## 🧭 US-019 – Seewettertext vorab online cachen

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seewettertext vorab online cachen“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich, dass der aktuelle Seewettertext bereits online im Hintergrund geladen und lokal gespeichert wird, bevor ich die Bodenanalyse-Lightbox öffne  
damit ich nach dem Ablegen ohne Mobilfunknetz den aktuellen Seewetterbericht weiterhin verfügbar habe

---

### 🎯 Zielbild

- Der Seewettertext wird bei bestehender Internetverbindung frühzeitig geladen
- Offshore steht der zuletzt verfügbare Text auch ohne vorheriges Öffnen der Lightbox bereit
- Die Lightbox zeigt weiterhin sofort den gecachten Text
- Die bestehende Karten-, Cache- und Lightbox-Logik bleibt stabil

---

### ✅ Akzeptanzkriterien

**Vorab-Laden**

- [x] Der Seewettertext wird bereits bei normaler Nutzung der App im Hintergrund geladen, ohne dass die Lightbox zuvor geöffnet werden muss
- [x] Das Vorab-Laden erfolgt nur, wenn eine Internetverbindung besteht
- [x] Bereits aktuelle Inhalte werden nicht unnötig mehrfach geladen

**Offline-Nutzung**

- [x] Nach erfolgreichem Vorab-Laden bleibt der zuletzt gespeicherte Seewettertext offline verfügbar
- [x] Die Bodenanalyse-Lightbox zeigt offline den zuletzt gespeicherten Text, auch wenn sie vor Netzverlust nie geöffnet wurde
- [x] Wenn noch kein Text geladen werden konnte, bleibt das bestehende Offline-Fallback-Verhalten erhalten

**Aktualisierungslogik**

- [x] Die Aktualisierung orientiert sich an sinnvollen Veröffentlichungszeitpunkten des Seewetterberichts
- [x] Ein neuer Bericht ersetzt den vorherigen Cache-Eintrag
- [x] Kein unkontrolliertes Cache-Wachstum

**Technik / Constraints**

- [x] Keine neue Library
- [x] Keine Beeinträchtigung von Zoom, Pan, Swipe und bestehender Lightbox-Bedienung
- [x] Änderungen bleiben minimal-invasiv
- [x] Bestehende Bild-Refresh-Logik bleibt fachlich unverändert

---

### 🔀 Umsetzungsoptionen

**Option A – stilles Preload beim App-Start / Seitenwechsel (festgelegt)**

- Hintergrund-Fetch bei App-Start oder beim Aufruf der Land-Seite
- Lightbox nutzt später nur noch den Cache

Vorteile:

- kein zusätzlicher UI-Aufwand
- passt gut zum Hafen-/Ablege-Workflow

Nachteile:

- braucht saubere Trigger-Logik, damit nicht unnötig oft geladen wird

**Option B – zusätzlich manueller Sicherungs-Trigger**

- wie Option A
- plus expliziter Button oder Aktion zum Vorab-Sichern

Vorteile:

- maximale Kontrolle vor dem Ablegen
- für kritische Nutzung robuster

Nachteile:

- zusätzlicher UI-Eingriff
- mehr Bedienoberfläche

---

## 🧭 US-018 – Seewetter-Overlay lesbarer strukturieren

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seewetter-Overlay lesbarer strukturieren“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich den eingeblendeten Seewettertext in der Lightbox klarer strukturiert sehen  
damit ich Wetterlage, Vorhersage und Aktualitätsstand schneller erfassen kann, ohne lange im Text suchen zu müssen

---

### 🎯 Zielbild

- Der Overlay-Text bleibt vollständig erhalten
- Die wichtigsten Informationen sind schneller erfassbar
- Die bestehende Lightbox-Bedienung bleibt unverändert robust
- Keine Änderung an Datenquelle, Cache-Logik oder Refresh-Zyklen

---

### ✅ Akzeptanzkriterien

**Struktur**

- [x] Der Zeitstempel `Stand:` wird im Overlay optisch klar und dauerhaft am Anfang angezeigt
- [x] Abschnittsüberschriften wie `Wetterlage` und `Vorhersage` sind visuell hervorgehoben
- [x] Seegebiete im Seewettertext sind visuell hervorgehoben
- [x] Wochentage im Seewettertext sind visuell hervorgehoben
- [x] Windangaben mit `6-7` werden als Starkwind visuell hervorgehoben
- [x] Windangaben ab `8` werden als Sturmwarnung visuell hervorgehoben
- [x] Hervorhebung greift nur bei Windangaben (nicht bei Seegangshöhen in Metern)
- [x] Der Fließtext bleibt vollständig scrollbar und unverändert vollständig lesbar

**Interaktion**

- [x] Scrollen im Overlay funktioniert weiterhin sauber auf Touch und Desktop
- [x] Zoom-, Pan-, Swipe- und Schließen-Gesten der Lightbox werden nicht beeinträchtigt
- [x] Die Darstellung funktioniert auch bei langen Vorhersagetexten stabil

**Technik**

- [x] Keine Änderung an Fetch-, Fallback-, Offline- und Cache-Logik
- [x] Keine neue Library
- [x] Änderungen bleiben minimal-invasiv

---

### 🔀 Umsetzungsoptionen

**Option A – nur visuelle Strukturierung (festgelegt)**

- `Stand:` nach oben
- `Wetterlage` und `Vorhersage` hervorheben
- Seegebiete und Wochentage im Text hervorheben
- `6-7` als Starkwind markieren, `8+` als Sturmwarnung markieren (nur in Windzeilen)
- sonst kein neues Verhalten

Vorteile:

- kleinster Eingriff
- geringstes Risiko
- sofort spürbarer Nutzen

Nachteile:

- lange Forecasts bleiben weiterhin vollständig offen

**Option B – visuelle Strukturierung plus einklappbare Vorhersage**

- alles aus Option A
- zusätzlicher Toggle für Vorhersageblock

Vorteile:

- ruhigeres Overlay bei langen Texten
- Fokus zunächst auf Wetterlage

Nachteile:

- etwas mehr UI- und Interaktionslogik
- höheres Risiko für Nebenwirkungen

---

## 🌍 US-017 – UI-Texte für Internationalisierung strukturieren

**Status:** TODO  
**Priorität:** Mittel

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich, dass alle sichtbaren UI-Texte zentral und sprachabhängig gepflegt werden  
damit das Dashboard später ohne Code-Duplikate auf weitere Sprachen erweitert werden kann

---

### 🎯 Zielbild

- Alle UI-Texte liegen zentral in sprachspezifischen Ressourcen
- HTML- und JS-Texte werden über stabile i18n-Keys aufgelöst
- Accessibility-Texte (alt, aria-label) sind vollständig enthalten
- Bestehende Karten-, Refresh-, Cache- und Lightbox-Logik bleibt unverändert

---

### ✅ Akzeptanzkriterien

- [ ] Es existiert eine zentrale Struktur für Übersetzungen (mindestens de, optional en als Platzhalter)
- [ ] Sichtbare Texte in HTML sind nicht mehr hart kodiert, sondern über Keys referenziert
- [ ] Laufzeittexte in JS (Overlay, Fehlermeldungen, Hinweise) werden über i18n-Keys aufgelöst
- [ ] alt- und aria-label-Texte sind in derselben i18n-Quelle gepflegt
- [ ] Fallback-Verhalten ist definiert (fehlender Key, fehlende Sprache)
- [ ] Kein Einfluss auf Datenquellen, Bildpfade, Refresh-Zyklen, SW-Strategie und Badge-Logik

---

### 🔀 Alternativen (Abwägung vor Umsetzung)

**Option A – Leichtgewichtiges eigenes i18n-Modul (empfohlen)**

- Ansatz: kleine t()-Funktion, Sprachdateien (z. B. locales/de.json), data-i18n-Attribute in HTML
- Vorteile: minimal-invasiv, kein Dependency-Risiko, passt zu Vanilla-JS-Stack
- Nachteile: mehr manuelle Disziplin bei Keys/Struktur

**Option B – Reines JS-Dictionary ohne data-i18n (Render im Code)**

- Ansatz: Texte nur in JS-Objekten, DOM-Texte werden programmatisch gesetzt
- Vorteile: keine Anpassung an HTML-Attributen nötig
- Nachteile: schlechtere Trennung von Struktur und Inhalt, tendenziell unübersichtlicher

**Option C – Externe i18n-Bibliothek (z. B. i18next)**

- Ansatz: vollständiges i18n-Framework mit Interpolation/Pluralisierung
- Vorteile: sehr mächtig, langfristig gut skalierbar
- Nachteile: zusätzliche Abhängigkeit, mehr Setup, für aktuellen Umfang vermutlich überdimensioniert

---

### 🧭 Entscheidungspunkt (Product)

Vor Implementierung wird eine Option verbindlich festgelegt:

- [ ] Option A umsetzen
- [ ] Option B umsetzen
- [ ] Option C umsetzen
- [ ] Vertagen / nur Textinventar erstellen

**Empfehlung aktuell:** Option A (beste Balance aus Aufwand, Wartbarkeit, geringer Invasivität).

---

### 🚫 Nicht im Scope dieser US

- Automatische Übersetzung der Inhalte
- Fachliche Änderung von Wettertexten oder Bildbeschreibungen
- Umbau der bestehenden Daten- und Cache-Logik
- UI-Redesign

---

## 🔄 US-015 – Datenzyklus für Bodenwetter-Analyse- und Prognosekarten korrekt abbilden

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Bodenwetter-Datenzyklus“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich, dass Bodenwetter-Analyse- und Prognosekarten entsprechend ihrem tatsächlichen Veröffentlichungs- und Modellzyklus behandelt werden  
damit ich jederzeit die aktuellsten verfügbaren Daten sehe und keine unnötigen Aktualisierungen stattfinden

---

### 🧠 Fachlicher Hintergrund

Die Bodenwetterkarten des Deutschen Wetterdienstes folgen einem festen meteorologischen Ablauf:

- Analysekarten:

  - werden nur zu den Hauptterminen aktualisiert:
    - 00 UTC
    - 12 UTC 【1-d9724f】

- Prognosekarten:
  - basieren auf Modellläufen (00 und 12 UTC)
  - werden erst **mehrere Stunden nach Modellstart verfügbar**, typischerweise:
    - ca. 07 UTC (für den 00 UTC Lauf)
    - ca. 19 UTC (für den 12 UTC Lauf)
  - Modellläufe liefern Vorhersagen mit festen Offsets (z. B. H+24, H+48 usw.)

👉 Ein Modelllauf ist erst nach Abschluss der Berechnung verfügbar, was einige Stunden dauern kann 【2-fe6845】

---

### 🎯 Zielbild

- Dashboard zeigt immer den neuesten verfügbaren Modelllauf
- keine unnötigen Aktualisierungen zwischen Modellläufen
- klare Trennung zwischen Analyse (Ist-Zustand) und Prognose (Vorhersage)

---

### ✅ Akzeptanzkriterien

**Analyse vs. Prognose**

- [x] Analysekarten werden ausschließlich zu 00 und 12 UTC als „neu“ erkannt
- [x] Prognosekarten werden korrekt dem jeweiligen Modelllauf zugeordnet (00 oder 12 UTC)
- [x] H+Werte werden als Stunden nach Modellstart interpretiert

---

**Verfügbarkeitslogik**

- [x] Karten des 00 UTC Modelllaufs werden erst ab ca. 07 UTC geladen
- [x] Karten des 12 UTC Modelllaufs werden erst ab ca. 19 UTC geladen
- [x] Vor diesen Zeitpunkten erfolgt kein unnötiger Refresh

---

**Refresh-Verhalten**

- [x] Automatische Aktualisierung erfolgt nur bei erwarteter neuer Datenverfügbarkeit
- [x] Zwischen Modellläufen werden keine identischen Daten mehrfach geladen
- [x] Manuelle Aktualisierung bleibt möglich

---

**Integration mit Cache (US-014 / US-008)**

- [x] Cache-Gültigkeit richtet sich am Modelllauf (00/12 UTC)
- [x] Daten bleiben mindestens bis zum nächsten Modelllauf gültig
- [x] Alte Modellläufe werden automatisch ersetzt

---

**Einheitliche Zeitlogik**

- [x] Analyse- und Prognosekarten verwenden eine gemeinsame Zeitlogik
- [x] Zeitlogik ist zentral implementiert (keine Duplikate)
- [x] Neue Kartentypen können diese Logik direkt übernehmen

---

### 🧠 Definition of Done

- Dashboard zeigt stets den aktuell verfügbaren Modelllauf
- keine veralteten Karten werden unnötig neu geladen
- Aktualisierung erfolgt nur zu realen Veröffentlichungszeitpunkten
- Zeitverhalten entspricht dem meteorologischen Workflow des DWD

---

### 💡 Nutzen

- korrekte Interpretation der Wetterlage
- geringerer Datenverbrauch
- konsistente und verlässliche Darstellung
- Grundlage für datengetriebene Features (z. B. Seegang, Wind-gegen-Strom)

---

## 🧭 US-016 – Wetterlage-Overlay mit Offline-Unterstützung integrieren

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Wetterlage-Overlay & Offline-Cache“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich zur Bodenwetter-Analysekarte die aktuelle Wetterlage samt vollständiger Vorhersage aus dem Seewetterbericht als Text eingeblendet bekommen – auch im Offline-Modus  
damit ich die dargestellte Wetterkarte besser interpretieren kann und auch ohne Internetverbindung eine fundierte Einschätzung erhalte

---

### 🧠 Fachlicher Hintergrund

Der Deutsche Wetterdienst stellt den Seewetterbericht als dedizierte Quelle bereit; als technischer Fallback kann das maritime Open-Data-Produkt FEBQ52 (Verzeichnis `https://opendata.dwd.de/weather/maritime/forecast/german/`) genutzt werden. Dieses enthält u. a.:

- Abschnitt „Wetterlage“
- Zeitstempel (UTC)
- regionale Vorhersagen

Der Text wird nicht als strukturierte API (JSON), sondern als Klartext geliefert und muss:

- dekodiert (Latin‑1)
- geparst (Abschnitt „Aktuelle Wetterlage“ inklusive vollständigem Vorhersageblock)
- und zwischengespeichert werden

---

### 🎯 Zielbild

- Beim Zoom der Bodenanalysekarte wird die aktuelle Wetterlage inklusive vollständiger Vorhersage als Overlay angezeigt
- Darstellung ist dezent und beeinträchtigt nicht die Karteninterpretation
- letzter verfügbarer Bericht bleibt offline verfügbar

---

### ✅ Akzeptanzkriterien

**Datenabruf**

- [x] Seewetterbericht wird aus der dedizierten DWD-Seewetterbericht-Quelle geladen
- [x] Text wird korrekt dekodiert (Latin‑1 → UTF‑8 Darstellung)
- [x] Abschnitt „Aktuelle Wetterlage“ inklusive vollständiger Vorhersage wird zuverlässig extrahiert

---

**Overlay-Darstellung**

- [x] Overlay wird im Zoom-Modus der Bodenwetterkarte angezeigt
- [x] Darstellung ist dezent (halbtransparent, unten positioniert)
- [x] Text ist scrollbar und gut lesbar
- [x] Overlay beeinträchtigt Zoom- und Pan-Gesten nicht

---

**Offline-Unterstützung**

- [x] Letzter geladener Seewetterbericht wird im Cache gespeichert
- [x] Im Offline-Modus wird der zuletzt verfügbare Text angezeigt
- [x] Wenn kein Cache vorhanden ist, wird ein sinnvoller Fallback angezeigt

---

**Aktualisierungslogik**

- [x] Aktualisierung erfolgt nur zu sinnvollen Zeitpunkten (gemäß US-013 / US-015)
- [x] Kein unnötiger erneuter Download desselben Berichts
- [x] Cache wird pro Modelllauf überschrieben (kein Wachstum)

---

**Integration**

- [x] Funktioniert nur bei relevanter Karte (z. B. Bodenanalyse)
- [x] Integration in bestehende Lightbox-/Zoom-Logik
- [x] Kompatibel mit Service Worker und Cache-Strategie (US-008 / US-014)

---

### 🧠 Definition of Done

- Nutzer sieht zur Karte die passende meteorologische Einordnung
- Wetterlage ist auch ohne Internet verfügbar
- Darstellung ist intuitiv und nicht störend
- keine unnötigen Netzwerkanfragen

---

### 💡 Nutzen

- deutlich bessere Interpretation der Wetterkarten
- Verbindung von visuellen und textlichen Informationen
- Offline-Fähigkeit für realen Einsatz (z. B. auf See)
- Aufwertung des Dashboards von „Anzeige“ zu „Entscheidungshilfe“

## 🟨 DOING

## ✅ DONE

- US-016 Wetterlage-Overlay mit Offline-Unterstützung integrieren
- US-014 Offline-Unterstützung mit gecachtem Kartenzugriff optimieren
- US-013 Einheitlichen Aktualisierungszyklus für alle Seegangskarten anwenden
- US-001 Menü entfernen
- US-002 Navigation über Gesten
- US-003 Pull-to-Refresh
- US-004 Dark Mode automatisch
- US-005 Metadaten entfernen
- US-007 Visuelle Qualität und ruhige Darstellung optimieren
- US-009 Zoom- und Navigationsverhalten im Bildmodus verbessern
- US-010 Pan- und Zoom-Verhalten im Bildmodus verbessern (Elastic UX)
- US-011 Seegangskarten Nordsee integrieren (dritte Seite)
- US-012 Seegangskarten Ostsee integrieren (vierte Seite)
- US-015 Datenzyklus für Bodenwetter-Analyse- und Prognosekarten korrekt abbilden

---

# 📦 BACKLOG DETAILS

---

## 🌊 US-014 – Offline-Unterstützung mit gecachtem Kartenzugriff optimieren

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Offline-Kartenzugriff mit gecachten Daten"

---

### 🧑‍💻 Beschreibung

Als Segler/Schiffsführer  
möchte ich die aktuell geladenen Wetterkarten auch im Offline-Modus (ohne Internetverbindung) weiterhin anschauen können  
damit ich z. B. bei Fahrt auf dem Wasser auf die zuletzt geladenen Daten zugreifen kann, ohne dass die Anzeige abbricht

---

### 🧠 Fachlicher Hintergrund

Nautischer Use-Case:

- Im Hafen: Wetterkarten aktuell laden (alle Seiten durchblättern, damit sie gecacht sind)
- Ablegen: Flugmodus/Offline-Modus aktivieren
- Auf See: Karten zu allen Seiten sollten weiterhin angezeigt werden, nicht leer sein
- Im nächsten Hafen: Internet wieder aktiv, Karten werden dann neu aktualisiert

Technisch:

- Service Worker cached Bilder bereits korrekt
- Verbesserung: `app.js`-Logik unterscheidet jetzt zwischen "gecacht aber offline" und "echtem Fehler"

---

### 🎯 Zielbild

- Carousel funktioniert offline uneingeschränkt
- Alle Seiten zeigen gecachte Bilder, auch wenn sie nicht manuell geladen wurden
- Badge-System markiert Offline-Status deutlich sichtbar
- Beim Zurückkommen online aktualisieren sich die Karten transparent

---

### ✅ Akzeptanzkriterien

**Offline-Navigation**

- [x] Seitenwechsel (Swipe, Tastatur, Edge-Tap) funktioniert offline
- [x] Gecachte Bilder werden angezeigt, auch wenn Seite offline nie explizit geladen wurde
- [x] Kein leeres „Fehler" oder „offline"-Badge für Bilder im Cache

---

**Cache-Strategie**

- [x] Service Worker liefert gecachte Bilder im Offline-Modus
- [x] App.js unterscheidet zwischen „nie geladen" (Error-Badge) und „offline, aber gecacht" (Offline-Badge)
- [x] Keine Doppelanfragen beim Seitenwechsel offline
- [x] Fenstergrößen-/Orientierungswechsel offline behalten den letzten Bildstand sichtbar

---

**Rückkehr online**

- [x] Beim Zurückkommen online werden Bilder mit Offline/Error-Badges automatisch neu geladen
- [x] Badges ändern sich von Offline/Error zu Loading, dann zu OK
- [x] Transparent ohne unnötige Reload-Animationen

---

**Offline-Banner**

- [x] Banner bleibt sichtbar während Offline
- [x] Zeitstempel des letzten erfolgreichen Refreshes wird angezeigt
- [x] Klare Mitteilung: „Offline · letzter Stand HH:MM:SS"

---

### 🧠 Definition of Done

- [x] Alle Seiten bleiben navigierbar, auch offline
- [x] Gecachte Karten bleiben sichtbar, auch nach Resize/Orientation-Change
- [x] Service Worker und App.js arbeiten nahtlos zusammen
- [x] Keine Regressionen bei Online-Navigation oder Lightbox

---

### 💡 Nutzen

- [x] bessere maritime Nutzung (Offline auf dem Wasser)
- [x] Sicherheit: Zugriff auf letzte bekannte Bedingungen
- [x] Reduktion von Frustration bei Connectivity-Problemen
- [x] PWA-Stärke: echte Offline-Fähigkeit sichtbar machen

---

## 🔄 US-013 – Einheitlichen Aktualisierungszyklus für alle Seegangskarten anwenden

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Globaler Seegang-Datenzyklus“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich, dass alle Seegangsvorhersagekarten unabhängig vom Gebiet konsistent aktualisiert werden  
damit ich mich auf eine einheitliche und verlässliche Datenbasis verlassen kann und keine unnötigen Aktualisierungen stattfinden

---

### 🧠 Fachlicher Hintergrund

Die Seegangsvorhersagekarten des Deutschen Wetterdienstes für europäische Seegebiete unterliegen einem gemeinsamen Zyklus:

- Gebiete:

  - Nordsee
  - Ostsee
  - Mittelmeer
  - Ostatlantik

- Aktualisierung:

  - ca. 07 UTC
  - ca. 19 UTC

- Vorhersagezeiten:
  - 00
    (- 12)
  - 24
  - 48
  - 72 Stunden 【1-9e913b】

---

### 🎯 Zielbild

- Einheitliche Behandlung aller Seegangskarten
- zentral gesteuerte Refresh-Logik
- keine gebietsspezifische Sonderbehandlung mehr

---

### ✅ Akzeptanzkriterien

**Einheitlicher Datenzyklus**

- [x] Alle Seegangskarten verwenden denselben Aktualisierungszeitplan (~07 und ~19 UTC)
- [x] Es wird keine separate Refresh-Logik pro Seegebiet implementiert
- [x] Neue Seegebiete können ohne Anpassung der Zeitlogik ergänzt werden

---

**Refresh-Verhalten**

- [x] Automatische Aktualisierung erfolgt nur in den bekannten Zeitfenstern
- [x] Zwischen den Zeitfenstern werden keine unnötigen Requests ausgelöst
- [x] Manuelle Aktualisierung bleibt möglich

---

**Integration mit Cache-Strategie (US-008)**

- [x] Cache-Gültigkeit orientiert sich am globalen Seegang-Zyklus
- [x] Daten werden maximal bis zum nächsten erwarteten Update verwendet
- [x] Veraltete Karten werden automatisch ersetzt

---

**Skalierbarkeit**

- [x] Struktur erlaubt einfache Erweiterung um:
  - Mittelmeer
  - Ostatlantik
- [x] Keine Duplikation von Zeitlogik in mehreren Komponenten

---

### 🧠 Definition of Done

- Alle Seegangskarten verhalten sich zeitlich identisch
- Aktualisierung erfolgt nur bei real verfügbaren neuen Daten
- System ist erweiterbar ohne Anpassung der Refresh-Logik
- Keine redundanten Netzwerkaufrufe mehr

---

### 💡 Nutzen

- konsistente Nutzererfahrung
- reduzierte Komplexität im Code
- geringerer Datenverbrauch
- Grundlage für skalierbares Seegang-Modul über mehrere Regionen hinweg

## 🌊 US-012 – Seegangskarten Ostsee integrieren (vierte Seite)

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seegangskarten Ostsee“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich zusätzlich zur Nordsee-Seite auch Seegangskarten für die Ostsee sehen  
damit ich eine vollständige Übersicht über die Wellen- und Seegangsituation in beiden deutschen Seegebieten erhalte

---

### 🎯 Zielbild

- neue Seite direkt im Anschluss an die Nordsee-Seite
- identischer Aufbau und Bedienung wie bei den Nordsee-Seegangskarten
- kompakte Darstellung der relevanten Vorhersagezeitpunkte

---

### ✅ Akzeptanzkriterien

**Seitenintegration**

- [x] Es gibt eine neue Seite für „Seegang Ostsee“
- [x] Seite folgt direkt auf die Nordsee-Seite im Carousel
- [x] Navigation (Swipe, Tastatur, Edge-Tap) funktioniert identisch

---

**Bildquellen**

- [x] Bilder werden über `data-base=\"WX_SEE\"` plus `data-path=\"ostsa_..png\"` geladen

- [x] Unterstützte Vorhersagezeiten:
  - 00
  - 24
  - 48
  - 72

---

**Layout (zweizeilig)**

**Zeile 1:**

- [x] ostsa_00.png
- [x] ostsa_24.png

**Zeile 2:**

- [x] ostsa_48.png
- [x] ostsa_72.png

---

**Visualisierung**

- [x] Gleichmäßige und ruhige Darstellung der Karten
- [x] Konsistente Größen, Abstände und Darstellung wie bei der Nordsee-Seite
- [x] Responsives Verhalten auf allen Geräten

---

**Aktualisierung**

- [x] Aktualisierung erfolgt nur in sinnvollen Zeitfenstern (~07 und ~19 UTC)
- [x] Integration in bestehende Datenzyklus-Logik (US-008)
- [x] Kein unnötiger Refresh zwischen Veröffentlichungen

---

**Integration mit bestehenden Features**

- [x] Unterstützung für:
  - Zoom (US-009)
  - Peek-Navigation (US-009)
  - Elastic Pan (US-010)
- [x] Kompatibel mit Cache- und Offline-Strategie
- [x] Badge-Logik funktioniert identisch

---

### 🧠 Definition of Done

- Nutzer kann Nordsee- und Ostsee-Seegang nahtlos vergleichen
- Seite wirkt konsistent mit der Nordsee-Seite
- Struktur ist intuitiv (früh → spät)
- Navigation und Interaktion verhalten sich identisch zu allen anderen Seiten

---

### 💡 Nutzen

- vollständige Abdeckung der deutschen Seegebiete
- bessere Vergleichbarkeit von Seegang (Nordsee vs. Ostsee)
- logische Erweiterung der bestehenden Kartenstruktur
- ideale Basis für kombinierte Analysen (z. B. Wind + Seegang + Strom)

---

## 🌊 US-011 – Seegangskarten Nordsee integrieren (dritte Seite)

**Status:** DONE  
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Seegangskarten Nordsee“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich eine eigene Seite mit Seegangskarten für die Nordsee sehen  
damit ich Wellenentwicklung und Seegangsvorhersage übersichtlich und im gleichen Stil wie die anderen Karten interpretieren kann

---

### 🎯 Zielbild

- neue Seite im Dashboard (zusätzlich zu bestehenden Seiten)
- klare, strukturierte Darstellung der Vorhersagezeitpunkte
- visuell konsistent mit bestehendem Grid

---

### ✅ Akzeptanzkriterien

**Seitenintegration**

- [x] Es gibt eine neue Seite im Carousel (Seite für „Seegang Nordsee“)
- [x] Navigation per Swipe, Tastatur und Edge-Tap funktioniert wie auf den anderen Seiten
- [x] Seite fügt sich ohne Layout-Brüche in das bestehende System ein

---

**Bildquellen**

- [x] Bilder werden über `data-base=\"WX_SEE\"` plus `data-path=\"nordsa_..png\"` geladen
- [x] Unterstützte Zeitpunkte:
  - 00
  - 12
  - 24
  - 48
  - 72

---

**Layout (zweizeilig)**

- [x] Darstellung erfolgt in zwei Reihen:

**Zeile 1:**

- [x] nordsa_00.png
- [x] nordsa_12.png

**Zeile 2:**

- [x] nordsa_24.png
- [x] nordsa_48.png
- [x] nordsa_72.png

---

**Visualisierung**

- [x] Bilder werden gleichmäßig verteilt angezeigt
- [x] Karten haben konsistente Größen und Abstände
- [x] Layout ist responsive (Desktop / Tablet / Mobile)

---

**Aktualisierung**

- [x] Seegangskarten werden nur zu sinnvollen Zeitpunkten aktualisiert (~07 UTC und ~19 UTC)
- [x] Kein unnötiger Refresh zwischen den bekannten Veröffentlichungsfenstern
- [x] Integration in bestehende Refresh-Logik (US-008)

---

**Integration mit bestehenden Features**

- [x] Karten unterstützen:
  - Zoom (US-009)
  - Elastic Pan (US-010)
- [x] Karten funktionieren im Offline-Modus (Cache-Strategie)
- [x] Badge-Logik bleibt kompatibel

---

### 🧠 Definition of Done

- Nutzer kann schnell alle relevanten Seegangsvorhersagen erfassen
- Struktur ist intuitiv (früh → spät von oben nach unten)
- Darstellung wirkt ruhig und konsistent mit bestehenden Seiten
- Navigation und Interaktion funktionieren identisch zu anderen Karten

---

### 💡 Nutzen

- Ergänzung der Wetteranalyse um Seegangsdaten
- bessere Einschätzung realer Bedingungen auf See
- logische Erweiterung der bestehenden Kartenstruktur
- Grundlage für spätere Verknüpfung mit Strom-/Windanalyse (US-006)

---

## 🧭 US-010 – Pan- und Zoom-Verhalten im Bildmodus verbessern (Elastic UX)

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Elastic Pan & Clamp Verhalten“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich Bilder im Zoom-Modus frei verschieben können und dabei ein natürliches, „physikalisches“ Verhalten erleben  
damit die Interaktion nicht blockierend wirkt und sich flüssig sowie intuitiv anfühlt

---

### 🎯 Zielbild

- Zoomen und Verschieben fühlt sich frei und natürlich an
- Bewegungen werden nicht abrupt gestoppt
- Bild kann leicht über den Rand hinaus verschoben werden
- nach dem Loslassen kehrt es sanft in den gültigen Bereich zurück

---

### ✅ Akzeptanzkriterien

**Pan-Verhalten**

- [x] Bild kann nach dem Zoomen in alle Richtungen verschoben werden
- [x] Bewegung wird nicht abrupt durch harte Grenzen gestoppt
- [x] Leichte Überbewegung über den sichtbaren Bereich hinaus ist möglich

---

**Elastic / „Gummiband“-Effekt**

- [x] Beim Ziehen über den Rand entsteht ein gedämpfter Widerstand
- [x] Bewegung wird bei zunehmender Entfernung langsamer („Resistance“)
- [x] Verhalten fühlt sich „weich“ statt technisch an

---

**Zurückspringen (Clamp)**

- [x] Beim Loslassen kehrt das Bild automatisch in den gültigen Bereich zurück
- [x] Rückbewegung erfolgt animiert (kein Sprung)
- [x] Animation ist kurz, weich und nicht störend

---

**Zoom-Kombination**

- [x] Verhalten funktioniert unabhängig davon, ob echtes Overflow vorhanden ist
- [x] Auch bei Bildern, die vollständig in den Viewport passen, ist Bewegung möglich
- [x] Zoom + Pan wirken als zusammenhängendes System

---

**Integration**

- [x] Bestehende Lightbox-Struktur wird beibehalten
- [x] Keine Beeinträchtigung von:
  - Swipe-Navigation
  - Zoom-Gesten (Pinch)
- [x] Funktioniert auf Touch- und Desktop-Geräten

---

### 🧠 Definition of Done

- Nutzer kann ein Bild intuitiv bewegen, ohne „gegen Grenzen zu kämpfen“
- Interaktion wirkt flüssig und hochwertig
- Übergang zwischen Ziehen und Zurückspringen ist visuell konsistent
- Verhalten entspricht bekannten Mustern moderner Apps (z. B. Bilder-Viewer)

---

### 💡 Nutzen

- deutlich bessere Benutzererfahrung im Zoom-Modus
- Vermeidung von Frustration durch blockierende Interaktion
- natürlicheres Gefühl bei Touch-Gesten
- Grundlage für erweitertes Zoom- und Navigationsverhalten

## 🔍 US-009 – Zoom- und Navigationsverhalten im Bildmodus verbessern

**Status:** DONE  
**Priorität:** Mittel

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Zoom & Peek Navigation“

---

### 🧑‍💻 Beschreibung

Als Nutzer  
möchte ich ein Bild im Detailmodus vergrößert betrachten können und gleichzeitig die Nachbarbilder angedeutet sehen  
damit ich Inhalte besser erkennen kann und stets die räumliche Orientierung innerhalb der Bildnavigation behalte

---

### 🎯 Zielbild

- Bild nutzt optimal die verfügbare Bildschirmhöhe
- benachbarte Bilder werden leicht angeschnitten sichtbar
- Navigation erfolgt fließend und nachvollziehbar

---

### ✅ Akzeptanzkriterien

**Zoom-Verhalten**

- [x] Vergrößertes Bild richtet sich primär nach der verfügbaren Fensterhöhe (Viewport-Höhe)
- [x] Das Bild bleibt vollständig sichtbar (kein ungewolltes Abschneiden)
- [x] Seitenverhältnis bleibt erhalten (keine Verzerrung)
- [x] Bild passt sich responsiv an verschiedene Geräte an

---

**Peek-Navigation (Orientierung)**

- [x] Links und rechts vom aktuellen Bild sind angrenzende Bilder leicht angeschnitten sichtbar
- [x] Die Vorschau ist visuell reduziert (z. B. geringere Opacity)
- [x] Nutzer erkennt sofort, dass weitere Inhalte vorhanden sind

---

**Navigation**

- [x] Wischen oder Pfeiltasten verschieben den Fokus fließend zum nächsten/vorherigen Bild
- [x] Das aktuelle Bild gleitet animiert zur Seite, das nächste wird zentral
- [x] Übergänge sind weich und nicht ruckartig

---

**Zyklisches Verhalten**

- [x] Navigation ist endlos (letztes → erstes Bild, erstes → letztes Bild)
- [x] Keine Sackgassen im Navigationsfluss

---

**Integration**

- [x] Bestehende Lightbox-/Zoom-Logik wird erweitert oder ersetzt (keine Doppel-Logik)
- [x] Funktion beeinflusst keine bestehenden Grid- oder Ladefunktionen
- [x] Funktioniert auf Desktop und Touch-Geräten

---

### 🧠 Definition of Done

- Nutzer erkennt intuitiv die Navigation ohne zusätzliche Hinweise
- Bilddarstellung wirkt ruhig, kontrolliert und hochwertig
- Navigation fühlt sich „natürlich“ und flüssig an
- Orientierung innerhalb der Bildfolge ist jederzeit gegeben

---

### 💡 Nutzen

- bessere Lesbarkeit der Wetterkarten
- deutlich verbesserte Benutzerführung
- Reduktion von „Verlorenheitsgefühl“ beim Navigieren
- Vorbereitung für spätere Features (z. B. Vergleich oder Analyse mehrerer Karten)
  ``

# 🔄 Feature: Datenzyklus & Cache-Optimierung

## Ziel

Vermeidung unnötiger Requests und Ermöglichung von Offline-Nutzung durch intelligente Nutzung des DWD-Update-Zyklus.

---

## Copilot Prompt

```text
Optimiere das bestehende DWD Dashboard hinsichtlich Datenverbrauch und Offline-Nutzung.

Kontext:
- Vanilla JavaScript
- Bilder werden regelmäßig neu geladen
- Service Worker ist bereits vorhanden (sw.js)
- DWD-Daten werden nur zu festen Zeiten aktualisiert (00 und 12 UTC, Bereitstellung ca. 07 und 19 UTC)

Ziel:
- Vermeidung unnötiger Bild-Requests
- Nutzung von Cache für Wiederverwendung
- Offline-Funktionalität sicherstellen

---

1. Cache-Strategie

- Nutze bestehende Service Worker Logik
- Bilder sollen:
  - zuerst aus Cache geladen werden
  - nur bei Bedarf aktualisiert werden

---

2. Refresh-Logik anpassen

Aktuell:
- regelmäßiger Timer (REFRESH_INTERVAL_MS)

Neu:
- Prüfe:
  - wann letzter erfolgreicher Refresh war
  - aktuelle Zeit (UTC)
- Nur refreshen wenn:
  - nahe an bekannten Update-Zeiten (z. B. 07 oder 19 UTC)
  - oder Nutzer manuell auslöst

---

3. Offline-Verhalten

- Wenn navigator.onLine == false:
  - keine neuen Requests senden
  - ausschließlich Cache verwenden

---

4. Minimale Integration

- beste Stelle:
  - refreshVisibleImages()
- erweitere dort Logik:
  - optional skip refresh wenn Daten noch „frisch“

---

5. Optional (Bonus)

- Speichere:
  - lastModelRunTimestamp
- einfache Regel:
  - max. 2 echte Refreshs pro Tag

---

6. Constraints

- keine neuen Libraries
- bestehender Service Worker bleibt Grundlage
- keine Änderung der Bildstruktur
- minimal-invasive Änderungen

---

Vorgehen:

1. Analyse der aktuellen Refresh-Logik
2. Einbau einer Zeitprüfung
3. Integration mit bestehendem Cache-System

Keine unnötigen Refactorings durchführen.

---

## 🌊 US-006 – Wind-gegen-Strom Erkennung (Nordsee)

**Status:** TODO
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „Wind gegen Strom“

---

### 🧑‍✈️ Beschreibung

Als erfahrener Skipper in der Nordsee
möchte ich erkennen, ob Wind und Gezeitenströmung gegeneinander laufen
damit ich kritische Seebedingungen (steile, kurze und brechende Wellen) frühzeitig einschätzen und vermeiden kann

---

### 🌊 Fachliche Idee

Wetterkarten allein reichen nicht aus, um reale Seebedingungen zu bewerten.
Erst die Kombination aus Wind- und Strömungsrichtung ergibt ein realistisches Bild der See.

Besonders kritisch:

- Wind gegen Strom
- starker Strom + mittlerer bis starker Wind
- flache Bereiche (Küsten, Seegatten, Wattenmeer)

---

### ✅ Akzeptanzkriterien

**Basis**

- [ ] Windrichtung wird berücksichtigt
- [ ] Strömungsrichtung wird berücksichtigt
- [ ] Winkel zwischen beiden wird berechnet

**Logik**

- [ ] Unkritisch: Winkel < 90°
- [ ] Erhöht: Winkel ≥ 120°
- [ ] Kritisch: Winkel ≥ 150°

- [ ] Bewertung berücksichtigt zusätzlich:
  - Strömung > 0.5 kn
  - Wind > 4 Bft

**Darstellung**

- [ ] Kein neues Menü
- [ ] Darstellung als Badge oder Overlay
- [ ] visuelle Zustände:
  - ✅ ok
  - ⚠ warning
  - 🔴 kritisch

**System**

- [ ] Nur aktiv auf Seiten 0–2
- [ ] Lightbox bleibt unbeeinflusst
- [ ] Funktioniert auf Desktop und Touch

---

### 🧠 Definition of Done

- Nutzer erkennt ohne Zusatzinfos:
  👉 „Hier wird die See unangenehm“
- Bewertung ist in < 2 Sekunden visuell erfassbar
- Keine zusätzliche Interaktion erforderlich

---

### 💡 Nutzen

- realistischere Einschätzung von Seegang
- bessere Entscheidungsgrundlage für Navigation
- erhöhter Sicherheitsaspekt
  ``

---

# ✅ DONE (DETAILS / HISTORIE)

_(hierher verschieben, wenn erledigt)_

## 🔴 US-001 – Menü vollständig entfernen

**Status:** DONE
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 2 (Topbar + Thumbbar entfernen)

**Beschreibung**
Als Nutzer möchte ich kein oberes Menü sehen, damit die Anzeige auf die Inhalte fokussiert bleibt.

**Akzeptanzkriterien**

- Menü wird nicht angezeigt
- Keine Funktionen gehen verloren

---

## 🔴 US-002 – Navigation über Gesten/Tasten

**Status:** DONE
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

**Status:** DONE
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

**Status:** DONE
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

**Status:** DONE
**Priorität:** Niedrig

👉 **Umsetzung:** siehe `docs/copilot-checklist.md` → Abschnitt 6 (Statuslogik bereinigen)

**Beschreibung**
Land, Höhe und Seegang sollen nicht mehr als Text dargestellt werden.

**Akzeptanzkriterien**

- Keine sichtbaren Titel (Land, See, Höhe)
- Keine globale Statusanzeige
- Bild bleibt alleinige Informationsquelle

---

## 🎨 US-007 – Visuelle Qualität und ruhige Darstellung optimieren

**Status:** DONE
**Priorität:** Hoch

👉 **Umsetzung:** siehe `docs/copilot-prompts.md` → Abschnitt „UI-Polish / Visual Refinement“

---

### 🧑‍💻 Beschreibung

Als Nutzer
möchte ich eine ruhige, klare und visuell hochwertige Darstellung der Wetterkarten
damit ich die Inhalte schnell erfassen kann, ohne durch UI-Elemente oder harte Übergänge abgelenkt zu werden

---

### 🎯 Zielbild

- maximale Fokussierung auf die Bilder
- minimale, aber klare visuelle Rückmeldungen
- konsistente und „ruhige“ Benutzeroberfläche

---

### ✅ Akzeptanzkriterien

**Karten-Darstellung**

- [ ] Karten haben abgerundete Ecken (z. B. Border-Radius)
- [ ] Karten haben einen subtilen Schatten (Depth-Effekt)
- [ ] Keine visuellen Artefakte beim Skalieren oder Wechseln

---

**Bild-Ladevorgang**

- [ ] Bilder erscheinen weich (Fade-in statt hartem Laden)
- [ ] Keine abrupten Layout-Sprünge
- [ ] Ladezustände bleiben über Badge erkennbar

---

**Navigation / Animation**

- [ ] Seitenwechsel erfolgt mit sanfter Animation
- [ ] Keine ruckartigen Bewegungen
- [ ] Verhalten konsistent auf Desktop und Touch

---

**Status-Badges**

- [ ] Einheitliche Position (oben rechts auf Karten)
- [ ] einheitlicher Stil (Größe, Farbe, Transparenz)
- [ ] vorbereitet für zukünftige Zustände (z. B. ⚠, 🔴)

---

**Interaktion**

- [ ] Dezente Hover-Effekte (nur Desktop)
- [ ] Edge-Tap bleibt erhalten, optional mit leichtem visuellem Feedback
- [ ] Keine zusätzlichen sichtbaren UI-Elemente

---

**Dark Mode**

- [ ] Darstellung ist im hellen und dunklen Modus konsistent
- [ ] Farben wirken in beiden Modi angenehm und nicht grell

---

### 🧠 Definition of Done

- UI wirkt „ruhig“ und nicht technisch oder unruhig
- Nutzer kann sich vollständig auf die Bilder konzentrieren
- Übergänge und Interaktionen wirken flüssig
- keine zusätzliche UI-Komplexität wurde eingeführt

---

### 💡 Nutzen

- bessere Lesbarkeit der Wetterkarten
- geringere kognitive Belastung
- hochwertiger Gesamteindruck
- ideale Grundlage für spätere „smarte“ Features (z. B. Wind-gegen-Strom)

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
```
