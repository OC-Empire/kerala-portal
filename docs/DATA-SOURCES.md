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

## Known gaps (add via CSV, see DATA-GUIDE.md)
- Libraries: only Thiruvananthapuram, Kollam, Kottayam, Ernakulam and Thrissur have entries. The other nine districts have none because no notable library could be confirmed.
- Schools: thin for Pathanamthitta, Alappuzha, Kannur and Kasaragod. Wikipedia covers few schools there.
- Kasaragod has the fewest entries overall (8).
- Everything is `verified=false`. Nothing was confirmed by a human, and hours/fees are not included.
- 39 places have no coordinates (no reliable source), so they show no "Directions" link.
