# Prompt do Figma AI — karuzela Instagram

Format: 10 slajdów, 1080x1080px każdy
Styl: ciemne tło (#0a0a0a), biały i czerwony (#c0392b) tekst, minimalistyczny/zin-owy
Typografia: duże, grube nagłówki (display font), czytelny sans-serif do treści

---

## Prompt do wklejenia w Figma AI:

```
Create a 10-slide Instagram carousel, 1080x1080px each.
Dark background #0a0a0a, white and red #c0392b accents.
Bold display typography for headlines, clean sans-serif for body.
Minimal, editorial, zine-inspired aesthetic.

Slide 1 — COVER
Headline: "SLAMSLOT"
Subheading: "zrobiłem narzędzie dla organizatorów slamów"
Small text bottom: "slamslot.pl"
Red accent line or shape.

Slide 2 — PROBLEM (personal voice)
Headline: "odpisywanie na maile zajmuje czas i energię"
Body: "większość slamów działa przez maile. każdy zapis to kolejna wiadomość do obsłużenia."
Tone: relatable, not corporate.

Slide 3 — PROBLEM cd.
Headline: "a uczestnicy? napisanie maila żeby się zapisać też zajmuje chwilę"
Body: "małe bariery sumują się. im łatwiej się zapisać — tym więcej osób przychodzi."

Slide 4 — SOLUTION
Headline: "stworzyłem SlamSlot"
Body: "formularz zapisów gotowy w 30 sekund. wrzucasz link na FB. resztą zajmuje się system."
Small: "jako slamer od 2023"

Slide 5 — FEATURE: lista
Headline: "lista główna + rezerwowa"
Body: "gdy ktoś rezygnuje, pierwsza osoba z rezerwowej dostaje maila automatycznie. zero ręcznej roboty."
Show: simple list mockup UI

Slide 6 — FEATURE: maile
Headline: "uczestnicy dostają maile automatycznie"
Body: "potwierdzenie zapisu, info o awansie z rezerwy, przypomnienie przed wydarzeniem."

Slide 7 — FEATURE: przypomnienia
Headline: "przypomnienia dla uczestników"
Body: "ustaw czy chcesz wysłać przypomnienie 1, 2 lub 3 dni przed slamem. jednym kliknięciem."

Slide 8 — FEATURE: nadchodzące slamy
Headline: "wszystkie nadchodzące slamy w jednym miejscu"
Body: "lista slamów z całej Polski pobierana ze slam.art.pl. jeśli slam ma otwarte zapisy w SlamSlot — pojawia się przycisk 'Zapisz się →' przy tej pozycji."
Show: list UI mockup with a few rows, one row has a red 'Zapisz się →' button on the right side.

Slide 9 — DARMOWE
Headline: "jest i będzie darmowe"
Body: "non-profit. stworzone przez środowisko dla środowiska. bez reklam, bez opłat."
Tone: genuine, not marketing-y.

Slide 10 — CTA
Headline: "slamslot.pl"
Body: "stwórz formularz dla swojego slamu. zajmie ci to mniej niż minuta."
Red button shape: "Stwórz slam →"
```

---

## Co screenshotować do mockupów w slajdach:

### Desktop (szeroki ekran, 100% zoom):
1. **Strona tworzenia** — `slamslot.pl` — formularz z wypełnionymi polami (nazwa, data, miejsca)
2. **Strona zapisu uczestnika** — `/slam/[id]` — z logo/zdjęciem, datą, opisem
3. **Dashboard** — `/dashboard/[token]` — z kilkoma uczestnikami na liście (3-5 osób)

### Mobile (telefon pionowo):
- Te same 3 strony — lepiej wyglądają w karuzeli jako pionowe screeny
- Użyj slamu testowego z realnymi danymi żeby wyglądało autentycznie

### Kolejność w slajdach:
- Slajd 5 (lista) → screenshot dashboardu
- Slajd 6 (maile) → screenshot maila potwierdzającego (można zrobić screenshot z podglądu maila w dashboardzie)
- Slajd 3 lub 4 → screenshot strony zapisu uczestnika
- Slajd 8 (nadchodzące slamy) → screenshot `/nadchodzace-slamy` z widocznym przyciskiem "Zapisz się →" przy jednym ze slamów

---

## Uwagi do Figma AI:

- Nie rób tego "korporacyjnie" — ma wyglądać jak post od osoby, nie od firmy
- Tekst ma być po polsku (zostaw jak jest w promptcie)
- Czerwony (#c0392b) tylko jako akcent, nie dominujący
- Możesz użyć screenshotów jako wstawione obrazki w mockup-ramce telefonu/laptopa
