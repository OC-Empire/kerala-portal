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

## Third pass: food and culture (`data/places-kerala-foodculture.csv`, 100 entries)
Categories `food` ("Food & flavours") and `culture` ("Arts, crafts & traditions").
- **Food (53):** 38 dishes hand-picked from district food guides (Kerala Tourism, Onmanorama and similar), in our own wording with the source linked. The rest are Wikipedia-backed geographical-indication foods (e.g. Palakkadan Matta rice, Marayoor jaggery, Wayanad Jeerakasala rice, Kuttiattoor mango).
- **Culture (47):** art forms, folk rituals, crafts and temple festivals from Wikipedia's Kerala culture categories (e.g. Kanyarkali, Poothan and Thira, Kuthampully saree, Aranmula kannadi, Yakshagana), assigned to a district through Wikidata or the article text.
- Festivals that already exist as events (Thrissur Pooram, Attukal Pongala, etc.) are kept in `events`, not repeated here.
- On the site, researched entries show first; profile names from the original district data are shown after them only if they aren't already covered.
- Not district-specific dishes (sadya, appam, puttu) are only listed where a source ties them to the district.

## Fourth pass: restaurants (`data/places-kerala-restaurants.csv`, 45 entries)
Category `restaurant` ("Famous restaurants"), shown in each district's FOOD section.
- Picked from food-writing sources (Onmanorama, The News Minute, Kerala Tourism, Outlook Traveller, Wikipedia) and travel guides. Pathanamthitta, Idukki, Malappuram, Wayanad and Kasaragod rest on weaker sources (aggregator listings), so they are few and described cautiously.
- Descriptions are our own wording of what the source says. No ratings, prices or opening hours are included, because none could be verified and they change.
- Coordinates come from OpenStreetMap, kept only when the match was clearly the right place (20 of 45). Mismatches (a different shop, an Akshaya centre, a snack stall) were blanked rather than shown.
- Restaurants close and change. The site shows a notice on every restaurant block.

## Round two (`data/places-kerala-round2.csv`, `data/seed/events-round2.csv`)
Ten more places and one event for thin districts: culture for Idukki (Mannan Koothu), Wayanad (Gadhika, Vattakali, Nellukuthu Pattu), Pathanamthitta (Kadammanitta Padayani) and Kottayam (Ettumanoor Ezhara Ponnana, Vaikom Ashtami); food for Pathanamthitta (pothichoru) and Kasaragod (Kori Rotti, Patholi, Beary biryani). Libraries for Pathanamthitta, Idukki, Wayanad and Kasaragod were searched for again and none notable could be confirmed, so those four still have none. OpenStreetMap lists hundreds of tiny village reading rooms there, but they are not "notable libraries" and were left out on purpose.

## Government services, NRI Corner and civic guide
Content lives in `src/lib/gov-data.ts`. Every link was requested on 2026-11-01. 26 responded; 8 official sites did not respond from our server (likely geo-blocking) and are marked "couldn't be checked". Helpline numbers marked as secondary-source (e.g. KWA 1916) are flagged on the site. We deliberately do not quote fees, cover amounts or pension rates because sources disagreed and they change.

## News archive
Publisher feeds expose only the latest few dozen stories. Every story we see is stored in the `news_items` table so older stories stay browsable (News and Sports pages). It starts on the day the table is created and cannot reach further back. A daily cron (`/api/cron/ingest`, see `vercel.json`) plus the pages themselves keep it filled.

## Known gaps (add via CSV, see DATA-GUIDE.md)
- Libraries: Pathanamthitta, Idukki, Wayanad and Kasaragod still have none.
- Culture: Idukki has one entry; Pathanamthitta, Wayanad and Kottayam two each.
- Food is thinnest in Pathanamthitta and Kasaragod; restaurants in Pathanamthitta have a single entry.
- Everything is `verified=false`. Nothing was confirmed by a human.
