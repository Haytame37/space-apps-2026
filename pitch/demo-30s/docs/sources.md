# Sources

Every fact shown in the presentation comes from the official Resources tab of the challenge
(<https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources>)
or from NASA content those pages embed. The same facts and links are on the AYYUR platform
(`app/src/data/machines.ts` and its Sources page).

## Page 1 — Still out there

| On screen | Source | Caveat |
|---|---|---|
| Moon and Mars globes, Ceres and Eros | NASA 3D models (NASA Visualization Technology Applications and Development), solarsystem.nasa.gov — rendered to images for the show | Lighting and rotation are ours. |
| “Since 1966” | Surveyor 1 landed 2 June 1966 — NSSDCA 1966-045A | First U.S. soft landing on the Moon. |
| 10 Moon landing sites (Apollo 11, 12, 14, 15, 16, 17; Surveyor 1, 5, 6, 7 — Surveyor 3 is at the Apollo 12 site) | NSSDCA 1969-059C, 1969-099C, 1971-008C, 1971-063C, 1972-031C, 1972-096C, 1966-045A, 1967-035A, 1967-084A, 1967-112A, 1968-001A | Coordinates from Lunar Reconnaissance Orbiter images, as stated by NSSDCA. |
| 8 Mars sites | NSSDCA 1975-075C, 1975-083C, 1996-068A, 2003-027A, 2003-032A, 2007-034A; science.nasa.gov InSight page; Mars 2020 landing site from NASA Eyes | Landing sites. Opportunity and Ingenuity moved away from them before stopping. |
| Dawn at Ceres, NEAR on Eros, Pioneer 10 and 11 leaving, Kepler around the Sun | science.nasa.gov: Dawn, NEAR Shoemaker, Pioneer 10, Kepler; NSSDCA 2007-043A, 1996-008A, 1972-012A, 1973-019A | **Positions drawn symbolically, not to scale** (said on screen). |
| “13 machines” | The 13 stories of the platform, built from the challenge's resource list | Some “machines” are groups (e.g. three lunar rovers). |

## Page 2 — Scattered

| On screen | Source |
|---|---|
| 13 photos | NASA images shown on the NSSDCA and science.nasa.gov pages listed on each card |
| “Make them speak to school-age space fans” | Challenge statement: “introduces school-age space enthusiasts to the hardware and the science it made possible” |

## Page 3 — AYYUR

Team logo from the AYYUR logo pack; the platform README states it was created with the help of an AI assistant (drawn in SVG). This is said on screen.

## Page 4 — The platform

Screenshots of the AYYUR platform (`main`, commit 7d3fdc6, 15 Nov 2026), taken in English.
The globes and the 3D rover model are NASA models; the “NASA live” view is NASA Eyes on the Solar System
(NASA/JPL-Caltech), displayed inside the site.

## Page 5 — Ingenuity

| On screen | Source |
|---|---|
| 5 test flights planned, 72 flown | science.nasa.gov Ingenuity Mars Helicopter: “a technology demonstration that would make no more than five test flights in 30 days … completed 72 flights across nearly three years” |
| Photo | NASA/JPL-Caltech, science.nasa.gov Ingenuity page |

## Page 6 — The explorers' corner

Screenshots of the platform (`main`, 7d3fdc6): Tiziri the mascot, stars, stickers, and the five kids' games
(Who am I?, Pairs, The puzzle, In order, True or false?). Game facts come from the same NASA data as the museum.

## Page 8 — From the screen to real hands

| On screen | Source | Caveat |
|---|---|---|
| 13 Memory cards, common / rare / legendary | `app/src/data/shop.ts` (rarity per machine) | Card photos: NASA. Product proposal, not on sale. |
| Pioneer 10 colouring book: ages 6 to 9, 23 pages, 20 to colour, A4 | `app/src/data/books.ts`; the book's “About this book” page | **Drawings generated with AI (Google Gemini)**, as the book states; every page shown carries an “AI-generated illustration” badge. Facts: NASA Science, “Pioneer 10”. |
| Prices: cards €0.90 / €1.90 / €3.90, booster of 5 €3.90; colouring book PDF €2.90, printed €6.90, class pack of 10 €49 | `shop.ts`, `books.ts`, `docs/BUSINESS.md` (market benchmarks with sources) | Team proposals; no payment is connected. |
| “Online museum: Free” | The platform has no payment | |

Caveat for the speaker: the book's own last page calls it “a free educational coloring book” under Apache 2.0, while the shop proposes a €3 PDF. The team should settle this before presenting prices. Before any sale, check NASA's media usage guidelines on commercial use of NASA images and the NASA name.

## Page 9 — Our rule

| On screen | Source | Caveat |
|---|---|---|
| 37 NASA sources | Count of the NASA links on the platform's Sources list (38 links minus the Space Apps challenge page) | |
| “AI use declared, AI drawings labelled” | Platform README and Sources page; the book's AI disclosure | AI helped with code, texts, the logo and the book's drawings. |
| 13 machines | As page 1 | |
