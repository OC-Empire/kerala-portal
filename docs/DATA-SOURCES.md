# Where the place and event data came from

`data/places-kerala.csv` (336 places) and `data/seed/events-festivals.csv` (12 events) were compiled in one pass on 2026-11-01.

| Source | Used for | Licence / attribution |
|---|---|---|
| Wikipedia category pages and article intros | Names, 1-2 sentence descriptions, the link on each card ("Source") | CC BY-SA 4.0. Each row's `source_url` points to the article. |
| Wikidata | District, coordinates, official websites, Malayalam names | CC0 |
| OpenStreetMap Nominatim | Coordinates for hand-picked hidden gems and four libraries | ODbL. Credit: OpenStreetMap contributors |
| Kerala Tourism, Onmanorama, The Week and travel blogs | Which offbeat places to include, and festival timings. Linked as `source_url` | Facts only; descriptions are our own wording |

## How it was selected
- **Schools, colleges, museums, libraries, parks, wildlife areas, stadiums:** pages in Wikipedia's Kerala categories that resolve to a Wikidata entry located in one of the 14 districts, classified by what the entity *is*. Capped per district and category, most widely-documented first.
- **Beaches, waterfalls & nature:** the same process for natural features.
- **Hidden gems:** hand-picked from "offbeat / lesser-known" lists for each district, checked against OpenStreetMap, not shown if the coordinates were outside the district.
- **Events:** only festivals whose typical timing was confirmed in at least one source. Dates are given as notes (e.g. "Held in the Malayalam month Kumbham") rather than guessed.

## Second pass: thin districts (`data/places-kerala-extra.csv`, 26 entries)
Added the same day for districts that had few or no schools and libraries.
- 10 schools and 1 school-like page came from Wikipedia articles that actually exist (e.g. St. Thomas HSS Kozhencherry, Bishop Hodges HSS Mavelikkara, Railway High School Palakkad). Several other school pages surfaced by web search no longer exist on Wikipedia (they now redirect to town articles) and were not used as Wikipedia entries.
- 10 further schools and 5 libraries are **web-sourced**: a fact or two taken from the cited page (founding year, location), written in our own words. These are weaker than the Wikipedia-backed rows. Several rest on a single page, and some cited pages are Wikipedia mirrors or blogs. Each row's `source_url` shows where the claim came from.
- Coordinates were looked up on OpenStreetMap. A match was kept only when it was the right institution; where the best match was a different school or road, the coordinates were left blank.

## Known gaps (add via CSV, see DATA-GUIDE.md)
- Libraries: Pathanamthitta, Idukki, Wayanad and Kasaragod still have none. No notable library could be confirmed for them.
- Schools: every district now has at least 2, but Wayanad, Kasaragod, Malappuram and Thrissur are the thinnest.
- Kasaragod has few entries overall.
- Everything is `verified=false`. Nothing was confirmed by a human, and hours/fees are not included.
- Some places have no coordinates (no reliable source), so they show no "Directions" link.
