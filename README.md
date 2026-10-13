# Zen Scrapper - GMB Lead Scraper & Outreach Engine
**Agency:** Zenthoz Digital Marketing ([www.zenthoz.com](https://www.zenthoz.com) • +1 307 301 2270)  
**Author:** Iqam Ifthikar  
**Version:** 1.5.0  

Zen Scrapper is a Google Chrome Extension (Manifest V3) designed for **Zenthoz Digital Marketing** to scrape high-ticket local service businesses directly from **Google My Business (Google Maps)**, audit website & security faults, isolate search campaigns by query, perform automated **Google & Web Deep Search** with live research audit trails, accurately classify businesses into real trade niches (guaranteeing ratings like `2.8(33)` are never confused with a trade), provide guaranteed storage wiping, generate customized cold email/call/DM outreach kits, and browse a built-in directory of **72 niches across 8 categories** and global target areas.

---

## 🚀 Key Features in Version 1.5.0

### 1. 🏷️ Universal Niche Classifier (Zero Rating Marks in Dropdown)
- **Eliminates Rating Mark Corruption**: Rating marks such as `2.8(33)` or `4.9 (45)` extracted from Google Maps text cards are strictly separated from business categories.
- **Identifies Trade from Business Name & Search Query**: If the raw category is missing or generic, Zen Scrapper scans the business title (e.g. *"Bailey MK Ltd trading name Bailey Roofing and Bailey MK"* is automatically classified as **Roofing**) or falls back to the campaign search term (*"Milton Keynes tree cutter"* -> **Tree Cutter / Arborist**).
- **Clean Dropdown with Live Counts**: The Niche Filter dropdown displays only real, clean industry trades alphabetically with matching lead counts: e.g. `Roofing (5)`, `Tree Cutter / Arborist (8)`.

---

### 2. 🔍 Enhanced Live Deep Search & Full Research Audit Trail
- **Multi-Source Live Web Research**: Queries DuckDuckGo HTML, DDG Lite, and Google endpoints to uncover unlisted official websites, Facebook pages, Instagram, LinkedIn, direct emails, and phone numbers.
- **Shows Exactly What Data Was Researched**:
  - The Lead Details modal features a dedicated **📋 Researched Sources & Web Audit Trail** log showing the exact search query executed, search engines checked, discovered URLs, and timestamped actions.
  - Summarized directly in the table's *Other Issues / Audit Notes* column.
  - Automatically runs client-side fallback if background service worker is idle, ensuring deep search never fails.

---

### 3. 🧹 Guaranteed Clear & Storage Wiping
- **Clear Leads (`🧹 Clear Leads`)**: Empties leads from the active campaign and immediately updates storage so the leads won't remain stored in the system.
- **Delete Campaign (`🗑️ Delete Campaign`)**: Permanently removes the selected campaign from history.
- **Wipe All Data (`⚠️ Wipe All`)**: Prompts confirmation and permanently clears all sessions, residual keys, and localStorage data so zero lead data stays in the system.

---

### 4. 🏷️ Niche Multi-Filtering & Scoped Exports
- **Combine Filters Seamlessly**: Filter leads simultaneously by status (e.g., **`🚨 No Website`** or **`⚠️ Faults`**) AND by specific niche (e.g. **`Roofing`**, **`Tree Cutter / Arborist`**, **`Gutter Installation`**, **`Water Damage Restoration`**, etc.).
- **Scoped Google Contacts Export**: Clicking **`📇 Google Contacts`** exports **ONLY** the currently viewed/filtered leads rather than the entire database.
- **Smart File Naming**: Every export is automatically named with the active niche, country, and date:
  - Example: `google_contacts_no_website_roofing_usa_2026-10-11.csv`
  - Example: `google_contacts_tree_cutter_uk_2026-10-11.csv`
  - Example: `leads_roofing_usa_2026-10-11.csv`
  Easily organize and import distinct niche lists directly into Google Contacts ([contacts.google.com](https://contacts.google.com)).

---

### 2. ⚡ Extended Search Bar & Clean History Bar
- **Extended Full-Width Search Input**: Removed the bulky "Search Maps" button. Simply type any niche and area into the extended search bar and press **Enter** to open Google Maps search instantly!
- **Clean History Bar**: Kept only the campaign selector dropdown (`📁 History: [Select Campaign]`), expanding to full width without crowded action buttons.

---

### 3. 🎯 Target Niches & Location Areas Directory (`🎯 Niches & Areas`)
- **1-Click Modal Access**: Small, dedicated button on the dashboard header opens the directory instantly.
- **⚡ Fast Query Generator & Instant Copy**: Select **Country** ➔ **State / Region** ➔ **City / Area** ➔ **Niche Category** ➔ **Specific Niche Service**. Generates clean Google Maps search queries (e.g. `Austin Texas roofing contractor`, `Milton Keynes gutter installation and cleaning`) with 1-click **📋 Copy Search Term** and **🗺️ Launch on Google Maps**.
- **🗺️ Countries & Cities Explorer**: Pre-loaded with top target markets:
  - 🇺🇸 **United States** (Texas, Florida, California, Wyoming, Georgia, North Carolina, Ohio, Arizona, Colorado, etc.)
  - 🇬🇧 **United Kingdom** (Buckinghamshire, Greater London, West Midlands, Manchester, Yorkshire, Scotland, etc.)
  - 🇨🇦 **Canada** (Ontario, British Columbia, Alberta, Quebec)
  - 🇦🇺 **Australia** (New South Wales, Victoria, Queensland, Western Australia)
  - **Extensible**: Add any new country, region, or city directly from the dashboard UI with "+ Add Custom Area".
- **🛠️ 72 High-Ticket Niches in 8 Profitable Categories**: Home Exterior, Home Interior, Emergency & Restoration, Trades & Systems, Outdoor & Property, Pest & Cleaning, Auto & Mobile, Other Local Services.

---

### 4. 🏢 Zenthoz Digital Marketing Branding
- **Footer**:
  - Author: **Iqam Ifthikar**
  - Agency: **Zenthoz Digital Marketing** • [www.zenthoz.com](https://www.zenthoz.com) • +1 307 301 2270
  - Neatly spaced one below another.
- **Outreach Kits**: Cold email templates, cold call openers, and social DMs are automatically populated with Zenthoz agency branding and phone contact.

---

### 5. 🔍 Google Deep Search Engine
- Runs secondary Google search to recover unlisted official websites, Facebook, Instagram, LinkedIn profiles, decision-makers, and direct emails.
- Can be triggered **per individual contact** on each row or inside the contact inspector modal.

---

### 7. ☁️ Live Cloud Database & Vercel Deployment (Version 1.6.0)
- **Supabase PostgreSQL Integration**: Real-time bidirectional synchronization between the local Chrome extension and a free Supabase cloud database via zero-dependency PostgREST client (`supabase_sync.js`).
- **Live Vercel Web Dashboard**: Deploy the dashboard straight to Vercel (e.g. `https://zen-scrapper.vercel.app`) using the included `vercel.json` and `package.json` for team-wide access across Mac, PC, and mobile.
- **Offline / Local First**: Operates seamlessly via `chrome.storage.local` and `localStorage` if no cloud credentials are provided.
- **Detailed Guide**: Follow [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for 3-minute setup instructions and SQL schemas.

---

## 🛠️ How to Reload in Google Chrome

1. Open **Google Chrome** and go to `chrome://extensions`.
2. Find **Zen Scrapper** and click the **Reload (circular arrow)** button.
3. Open or refresh `dashboard.html`.

