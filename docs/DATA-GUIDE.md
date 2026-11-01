# Adding places & events

Two CSV files feed the district pages and the Sports page. Fill in a template, validate it, import it.

| Data | Template | Shows up on |
|---|---|---|
| Places (schools, colleges, libraries, parks, zoos, museums, stadiums, hidden gems) | `data/templates/places.csv` | `/district/<slug>` -> **Places** |
| Events (sports, festivals, culture, education, community) | `data/templates/events.csv` | `/sports`, `/district/<slug>` -> **Events**, search |

## Steps
1. Copy a template, e.g. `data/ernakulam-places.csv`, and fill rows. Keep the header row exactly as is.
2. **Validate (no database touched):** `npm run data:import -- places data/ernakulam-places.csv --dry-run`
3. **Import:** `npm run data:import -- places data/ernakulam-places.csv`
4. Re-importing the same file *updates* rows. It never duplicates. Nothing is imported if any row has an error.

First time only (creates the two tables, additive and safe to re-run): `npm run db:tables`

## Places columns
| Column | Required | Notes |
|---|---|---|
| `id` | no | Leave blank. Generated from district + name so re-imports update the same row. |
| `district_slug` | yes | One of: thiruvananthapuram, kollam, pathanamthitta, alappuzha, kottayam, idukki, ernakulam, thrissur, palakkad, malappuram, kozhikode, wayanad, kannur, kasaragod |
| `category` | yes | school, college, library, park, zoo, museum, sports_venue, hidden_gem, other |
| `name` | yes | English name |
| `malayalam_name` | no | Shown instead of the English name when the site is in Malayalam |
| `description` | no | 1-3 sentences. Keep it factual. |
| `address`, `phone`, `hours`, `fee` | no | Free text, e.g. hours `9am-5pm, closed Mon`, fee `Rs 20 adults` |
| `lat`, `lng` | no | Decimal degrees, give both or neither (Kerala only). Powers the "Directions" link. |
| `website`, `image_url`, `source_url` | no | Must start with http(s)://. `source_url` = where you got the facts. |
| `tags` | no | Separate with `;`, e.g. `wheelchair-access;free-entry` |
| `verified` | no | `true` only if you confirmed the details. Unverified rows show a "not yet verified" note. |

## Events columns
| Column | Required | Notes |
|---|---|---|
| `title` | yes | |
| `malayalam_title` | no | |
| `category` | yes | sports, festival, culture, education, community, other |
| `sport` | for sports | football, cricket, boat_race, athletics, other |
| `district_slug` | no | Blank = statewide |
| `venue`, `description` | no | |
| `starts_at`, `ends_at` | no | `YYYY-MM-DD` or `YYYY-MM-DD HH:MM`, India time. Blank `starts_at` puts it in the **Annual calendar** instead of Upcoming. |
| `date_note` | no | Shown when there's no fixed date, e.g. `Traditionally held in August` |
| `status` | no | scheduled (default when dated), tbc (default when undated), cancelled |
| `website`, `image_url`, `source_url`, `verified` | no | As above |

Past events disappear from "Upcoming" on their own once they end.
