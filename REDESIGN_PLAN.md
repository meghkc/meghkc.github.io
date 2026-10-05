# meghkc.com: review and redesign plan

Status: redesign built on branch `claude/epic-ptolemy-tkqqdx`, **not committed or pushed**. Waiting for your approval.

## 1. Who the site is for

You now sit across three audiences, and the old site spoke mainly to the first:

1. **Academic hiring and collaborators.** Faculty search committees, postdoc PIs and coauthors. They want research direction, papers, and evidence of independence (the PI subaward, the TRB editor role).
2. **Agencies and industry.** Caltrans colleagues, DOTs, national labs. They want applied tools, models you have built, and data you know.
3. **The TRB community.** Committee members and people who met you at a session. They want your current affiliation, contact details, slides and posters.

The site has one job: within 10 seconds show that you are a transportation engineer at Caltrans finishing a Ph.D. on electric bus operations, with real tools and a growing TRB presence.

## 2. Review of the current site

### Content is out of date with the CV

| Area | Live site | CV (Oct 2026) |
|---|---|---|
| Current position | "Ph.D. candidate" only | Transportation Engineer, Caltrans (since 07/2026) |
| Experience | "Over 8 years" | "Over 10 years" |
| NYC DOT | Mentioned in summary only | Subawardee PI and intern (09/2025–09/2026), detailed work |
| NREL | "National Renewable Energy Laboratory" | National Laboratory of the Rockies |
| TRB editor role | Missing | Editor / Paper Review Coordinator, 2026–2027 |
| TRB 2027 acceptances (#20, #21) | Missing | Two accepted papers |
| License | FE exam | California EIT #188398 |
| Under-review papers | 2025 list, one under "Int. J. Management Science" | New DRL paper, TRIP, Applied Energy, TR Part A |
| Dissertation title | Old wording | "...Optimization, Metaheuristics Algorithm and Reinforcement Learning Frameworks" |
| Copyright | © 2025 on all six pages | |

### Accuracy issues an academic reader would notice

- **arXiv preprints listed under "Peer-Reviewed Journal Articles".** Search committees check this. The redesign separates Published, Preprints, Under review and In preparation.
- Hard-coded metrics (61 citations, h-index 4, "RI score 376", 138,433 reads) go stale silently, and ResearchGate reads are not a metric reviewers trust. The redesign links to Google Scholar and only shows counts computed from your own publication list.
- Self-rated skills ("Python 3.5/5", "3.5 years") undersell you. Python is your main tool. The redesign lists tools by group with no ratings.

### Engineering issues

- **Maintainability is the root cause of the drift.** All content is hand-written HTML repeated across six pages, so each CV update means editing several files. The header and footer are copied six times.
- `contact.html` has no `charset` or `viewport` meta tag, so it renders at desktop width on phones.
- Chart.js loads from an unpinned CDN URL (`cdn.jsdelivr.net/npm/chart.js`). A major release could break the charts with no change on your side. `js/skills-visualization.js` is an empty stub that still loads.
- 3,763 lines of CSS with 54 `!important` overrides, and 1,281 lines of JS, for a mostly static site.
- Invalid HTML: `<i>…</em>`, stray `</span>`, `<li>` outside a list, `<p>` inside `<ul>`. Wrong ARIA labels (the Growth and Change DOI is labelled "View DOI for Bidding Trends").
- Home slideshow: the default caption describes a commented-out image, and there are 8 indicators for 7 slides.
- Tabs hide most content, which makes it harder to scan and harder for search engines to index.
- File names with spaces (`Megh_recent CV.pdf`, `assets/project gallery/`) need URL encoding everywhere.
- The repo carries about 24 MB of images, including up to six unused quality variants of the same photo (`Hairpin bend_opt_q60/65/70/75/80/85`).
- No Open Graph tags or structured data, so link previews on LinkedIn and Slack show nothing useful.

### Design issues

- A large blue gradient banner repeats your name on every page; the background photos (blueprints, Nepal flag, "RESEARCH" lettering) reduce text contrast.
- Body text is justified, which leaves uneven gaps, and emoji serve as icons.
- No single place answers "what do you work on?" Research themes exist only as a list of interests.

## 3. Redesign

### Information architecture

Two real pages instead of six:

- **Home (`/`)**: hero with current role and a one-sentence research statement, News, About and Education, Research lines, Selected papers, Experience, Code and tools, Service and recognition, photo gallery, Contact.
- **Publications (`/publications.html`)**: every paper and talk, grouped by status, filterable by research line and searchable, with a "Copy citation" button on each paper.

The old URLs (`about.html`, `research.html`, `skills_awards.html`, `contact.html`) redirect to the matching section, so existing links on LinkedIn and in email signatures keep working.

### Visual identity

The design borrows from transit signage, which is your field:

- **Research lines as route bullets.** Electrified transit (**E**, teal), Freight systems (**F**, amber), Inclusive mobility (**I**, violet) and Construction management (**P**, grey). Every project, paper, talk and repository carries its bullet, so a visitor can follow one line through the whole site, and the publications filter uses the same bullets.
- **Career as a route map.** Experience is a line with stations (Lalitpur → Kathmandu → Pokhara → Logan → Golden → NYC DOT → Buffalo → Caltrans). Select a stop to see the role. It works with the keyboard.
- **Type.** Overpass (an open-source descendant of Highway Gothic, the US road-sign typeface) for headings, Source Serif 4 for reading text, Overpass Mono for dates and DOIs.
- Light and dark themes, which follow the visitor's system setting, plus a toggle.

### Engineering

- **Jekyll, which GitHub Pages builds automatically.** No new hosting or build step on your side.
- **All content lives in `_data/*.yml`**, one file per CV section: `publications.yml`, `talks.yml`, `experience.yml`, `news.yml` and so on. Updating the site after a new paper is one YAML entry. Counts on the home page (papers, talks) are computed from these files and cannot drift.
- One stylesheet (about 300 lines) and one script (about 160 lines, no libraries). Everything stays readable with JavaScript off.
- SEO and sharing: canonical URLs, Open Graph tags, and schema.org `Person` structured data.
- Accessibility: skip link, visible focus, semantic lists, ARIA tabs for the route map and `prefers-reduced-motion` respected.
- The contact form still uses your Formspree endpoint, now submitting in place with a clear success or failure message.

### Privacy decisions I made for you

- **Paper titles and accept/reject decisions from your TRB editor work are not published.** They are other authors' confidential submissions. The site shows only the aggregate (29 manuscripts coordinated). Consider whether the CV itself should list them.
- Your phone number and street address from the CV are not on the site. It shows "California, USA" and both email addresses.

## 4. Please confirm before I publish

1. **CV PDF.** `assets/Megh_recent CV.pdf` is still the old version. Send an updated PDF, or tell me to export one from the .docx (with or without the editor decision list).
2. **Conference dates that conflict in the CV:**
   - #18 *Land Use Transition…* is listed as "(2025) … January 11–15, 2025". TRB 2025 was January 5–9; January 11–15 was TRB 2026. I show January 2026.
   - #19 *Household Residential Location Choice…* is listed as "January 5–9, 2025", but the under-review list says TRBAM 2026. I show January 2026.
3. **Presentations #1–7** are not in the CV or on the old site. Add them to `_data/talks.yml` if you want the complete list.
4. **Review paper year.** The arXiv ID 2601.00838 means January 2026. The CV says 2025. I used 2026.
5. **Dates without a month** in News (TRB 2027 acceptances, editor appointment, ITE award) are shown as the year only.
6. **Hero headline.** I lead with "Transportation Engineer, California Department of Transportation" and put the Ph.D. second. If you are aiming at faculty jobs, swap them in `_data/profile.yml`.
7. **Citation metrics.** Removed in favour of a Google Scholar link. I can add them back if you want them.

## 5. After launch (optional)

- Delete unused image variants and original JPGs (about 15–20 MB) and rename the folders with spaces.
- Add per-paper pages with abstracts and BibTeX, and a `/cv` page generated from the same YAML so the PDF and the site never disagree.
- Add a project page for the deep RL dissertation with a short animation of the bus schedule and charging policy.
- Add Plausible or GoatCounter analytics if you want to know who visits from TRB.

## How to update content

| To change | Edit |
|---|---|
| A paper or its status | `_data/publications.yml` |
| A talk or poster | `_data/talks.yml` |
| News | `_data/news.yml` (newest first) |
| A job | `_data/experience.yml` |
| Bio, links, emails, CV path | `_data/profile.yml` |
| Research lines | `_data/themes.yml`, `_data/projects.yml` |
| Code, service, awards, teaching, tools, photos | the matching file in `_data/` |

Preview locally: `gem install jekyll && jekyll serve`, then open http://localhost:4000.
