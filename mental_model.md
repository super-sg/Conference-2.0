# Mental Model: ICNGCI 2027 Conference Platform

## 1. Executive Summary & Project Purpose

The **ICNGCI 2027** codebase is a production-grade, zero-dependency static web platform and documentation suite for the **International Conference on Next-Generation Computing and Interdisciplinary Innovations in Science, Engineering, and Health**, scheduled for **19–20 February 2027** at **Sharda University, Greater Noida, India**.

The project is engineered specifically to balance **visual prestige** (drawing design language from the MIT Department of Chemistry and modern academic publishing) with **extreme long-term maintainability** (zero build dependencies, no npm bundle step to break over multi-year conference lifecycles).

---

## 2. Core Architectural Philosophy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Zero-Build Foundation                         │
│   Vanilla HTML5  │  Single Modular CSS (main.css)  │  Vanilla ES5/6 JS │
└────────────────────────────────────────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Resilience  │             │ Accessibility│             │  Longevity   │
│100% works w/o│             │Full ARIA,    │             │Runs on any   │
│JS or build   │             │keyboard nav, │             │host: Vercel, │
│steps (SEO-   │             │screen-reader │             │cPanel, S3,   │
│friendly)     │             │friendly      │             │GitHub Pages  │
└──────────────┘             └──────────────┘             └──────────────┘
```

1. **Zero Runtime & Build Dependencies**: 
   - No React, Vue, Vite, Webpack, or Tailwind.
   - Directly deployable by copying the static folder to any web server or static bucket.
2. **Progressive Enhancement**:
   - Every single page renders complete semantic content with CSS only.
   - JavaScript serves as an enhancement layer: countdown timers, dynamic search & filtering, client-side `.ics` calendar file downloads, fee calculation, and interactive tabs.
3. **Deterministic State & Data Binding**:
   - Dates, deadlines, and conference metadata are governed by explicit data attributes (`data-date`, `data-deadline`, `data-track`, etc.) in HTML, coupled with a central `CONFIG` block in `assets/js/site.js`.

---

## 3. Technology Stack & Design System

| Layer | Implementation | Notes |
|---|---|---|
| **Markup** | HTML5 Semantic (BEM-style class naming) | Standardized topbar, masthead nav, and footer across all pages |
| **Styling** | Vanilla CSS (`assets/css/main.css`, ~2,250 lines) | CSS Custom Properties (Tokens), responsive clamp sizing, no preprocessor |
| **Scripts** | Vanilla JS (`assets/js/site.js`, ~690 lines) | Single IIFE, defensive initialization (`if (!element) return`), no external libs |
| **Fonts** | Google Fonts: Roboto (400, 500, 700, 900) | Tight negative tracking (`-0.03em`), heavy display weights, high contrast |
| **Color Tokens** | Saturated multi-hue palette | `--primary: #003bce` (Blue), `--accent: #ff2b37` (Red), `--ink: #0a0a0a`, plus 6 track-specific tokens (`--t1`–`--t6`) |
| **Hosting & Caching** | Vercel (`vercel.json`) | 1-year immutable cache on media; 5-min must-revalidate on CSS/JS; strict security headers |

---

## 4. Directory & File Topology

```
.
├── index.html                   # Home: Hero, participating nations, speaker/committee carousels, tracks, dates, CFP
├── about.html                   # About: Objectives, publication & indexing (Springer), host profile, proceedings track record
├── tracks.html                  # 6 Technical Tracks (66+ topics) with live search and filter chips
├── call-for-papers.html         # CFP: Tracks, submission categories, author guidelines, plagiarism policy, CMT portal
├── dates.html                   # Author timeline with auto-computed status badges & 1-click .ics calendar generators
├── registration.html            # Registration fee tables, interactive fee calculator, bank details, FAQ
├── committee.html               # Multi-tab directory: Patrons, Chairs, Advisory (National/Intl), TPC, Organizing
├── speakers.html                # Keynote speakers, invited talks, speaker nomination CTA
├── program.html                 # 2-day conference schedule + tutorial day, guidelines for presenters & session chairs
├── venue.html                   # Sharda campus details, travel table (distances from airports/rail/metro), lodging, visa, tours
├── contact.html                 # Secretariat routing, inquiry form (mailto client generation), sponsorship info
├── 404.html                     # Branded 404 error page
│
├── assets/
│   ├── css/
│   │   └── main.css             # Unified stylesheet (Design tokens, components, layouts, responsive, print)
│   ├── js/
│   │   └── site.js              # Centralized client runtime logic
│   ├── img/
│   │   ├── hero.jpg             # High-res aerial view of Sharda University campus
│   │   ├── favicon.svg / png    # Multi-resolution favicons & touch icons
│   │   ├── flags/               # 20+ SVG flag assets for participating nations
│   │   ├── logos/               # Sharda University, Springer, and 59 institution logos (IITs, foreign universities)
│   │   ├── books/               # Past IEEE & Springer proceedings cover artwork
│   │   └── people/              # 195+ standardized square portraits (520x520) for speakers & committee members
│   └── downloads/
│       ├── Springer-Word-Template.zip
│       ├── Springer-LaTeX-Template.zip
│       ├── Springer-License-to-Publish-Form.docx
│       ├── Springer-Instructions-for-Authors.pdf
│       └── ICNGCI-2027-Conference-Information.docx
│
├── tools/                       # Development & scraping automation scripts
│   ├── scrape_photos.sh         # Headshot retrieval script for university faculty portals
│   ├── fetch_google_images.js   # Automated image crawler via Google Images API
│   ├── scrape_scholar_puppeteer.js # Puppeteer headless scraper for Google Scholar avatars
│   └── make-docx.sh             # Generates Word document representation from HTML
│
└── data/spreadsheets            # Source spreadsheets (committee nominations, faculty emails, responses)
    ├── icngci2027.xlsx
    ├── Untitled form (Responses) (2-4).xlsx
    └── IIT-faculty-emails.xlsx
```

---

## 5. Client Behavioral Engine (`assets/js/site.js`)

All client-side interactions are encapsulated in `assets/js/site.js`. Each module is self-contained and fails silently if the matching DOM structure is not present:

```
                  ┌──────────────────────────────┐
                  │ assets/js/site.js (boot())   │
                  └──────────────┬───────────────┘
                                 │
   ┌─────────────────────────────┼─────────────────────────────┐
   ▼                             ▼                             ▼
initNav()                 initDates()                   initTrackFilter()
• Mobile slide-out drawer • Computes days remaining     • Real-time topic search
• URL-driven active page  • Generates "Closed" /        • Filter by track chips
• Keyboard accessibility    "Today" / "N days left"     • Text highlight with <mark>
• Scrim backdrop          • Generates .ics iCalendar
   │                             │                             │
   ├─────────────────────────────┼─────────────────────────────┤
   ▼                             ▼                             ▼
initTabs()                initFeeCalc()                 initPeopleSearch()
• ARIA tab navigation     • Dynamic pricing matrix      • Instant search across
• Arrow key navigation      (National vs Intl,            195+ committee cards
• URL hash deep-linking     Student vs Faculty)         • Auto-hides empty groups
   │                             │                             │
   ├─────────────────────────────┼─────────────────────────────┤
   ▼                             ▼                             ▼
initCountdown()           initCopy()                    initMisc()
• Live tick-by-tick       • 1-click clipboard copy      • Back-to-top button
  conference countdown      with visual feedback        • Mailto contact fallback
```

### Key Interactive Features:
1. **Dynamic RFC-5545 iCalendar (`downloadICS`)**: Generates `.ics` files client-side using `Blob` and triggers automated download without backend involvement.
2. **Track Filter & Highlight**: In `tracks.html`, users can search by keyword. The script filters all 66+ topics in real-time, highlights matches inside `<mark>` tags, and updates the visible count.
3. **Fee Calculator**: In `registration.html`, computes exact payable amounts based on nationality (INR ₹ vs USD $) and delegate category.
4. **Deep-linking Committee Tabs**: Opening `committee.html#tab-tpc` automatically selects the TPC tab, unhides the panel, and sets ARIA focus.

---

## 6. Data & Content Relationships

The project maintains tight synchronization across three distinct representations:

1. **Live Web Pages (`*.html`)**:
   - The authoritative public interface.
   - Micro-components: person cards, schedule items, paper tracks.
2. **Complete Word Document (`ICNGCI-2027-Conference-Information.docx`)**:
   - Generated from the HTML via `tools/make-docx.sh`.
   - Used by university committees, institutional approvals, and offline distribution.
3. **Source Data (`*.xlsx`)**:
   - `icngci2027.xlsx` and `Untitled form (Responses) *.xlsx`: Capture Google Form nominations from faculty worldwide.
   - `IIT-faculty-emails.xlsx`: Verified database of IIT/NIT faculty for outreach and TPC invitations.
   - Scraper tools in `tools/` bridge the gap by fetching official portraits and Scholar profile links.

---

## 7. Current Project State & Maintenance Checkpoints

| Domain | Status | Attention Point |
|---|---|---|
| **Conference Dates** | **19–20 February 2027** | Synchronized across all HTML pages, `site.js`, and `dates.html`. (Note: `PLACEHOLDERS.md` and `README.md` contain historical references to 2026). |
| **Committee & Speakers** | 195+ members linked & populated | Real photos mapped in `assets/img/people/`; outbound links connect to verified Google Scholar profiles, ORCID, or institutional homepages. |
| **Proceedings Partner** | Springer | Logo and partner announcements in place; camera-ready templates bundled in `assets/downloads/`. |
| **Payment Details** | ICICI Bank Wire Details in place | Marked in `PLACEHOLDERS.md` for final institutional verification prior to accepting funds. |
| **Submission Portal** | Microsoft CMT | Configured with conference placeholder URL pending final CMT track opening. |
