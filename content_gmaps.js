/**
 * Zen Scrapper - Google Maps Content Script
 * Author: Iqam Ifthikar
 * Injects on Google Maps search pages, auto-scrolls the feed, extracts leads,
 * parses phone, website, ratings, and groups them cleanly by search session.
 */

(function () {
  console.log('[Zen Scrapper by Iqam Ifthikar] Google Maps scraper loaded.');

  let isScrapingActive = false;
  let shouldStop = false;
  let scrapedLeads = new Map();

  // Helper to extract clean query
  function getSearchQuery() {
    const input = document.querySelector('input#searchboxinput');
    if (input && input.value) return input.value.trim();
    const urlMatch = window.location.pathname.match(/\/maps\/search\/([^/@]+)/);
    if (urlMatch) {
      return decodeURIComponent(urlMatch[1].replace(/\+/g, ' '));
    }
    return 'Local Business Search';
  }

  // Unwrap google redirection URLs (e.g. https://www.google.com/url?q=https://...)
  function unwrapWebsiteUrl(href) {
    if (!href) return 'N/A';
    try {
      if (href.includes('google.com/url?')) {
        const u = new URL(href);
        const q = u.searchParams.get('q');
        if (q) return q;
      }
      return href;
    } catch (e) {
      return href;
    }
  }

  // Extract phone regex
  function extractPhoneFromText(text) {
    if (!text) return 'N/A';
    // UK & International phone pattern
    const phoneMatch = text.match(/(?:(?:\+44\s?\(0\)\s?|\+44\s?|0)(?:\d\s?){9,10}|(?:\+?1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})|(?:\+?\d{2,3}[\s.-]?\d{3,4}[\s.-]?\d{4}))/);
    return phoneMatch ? phoneMatch[0].trim() : 'N/A';
  }

  // Find the Google Maps scrollable feed container
  function getFeedElement() {
    const feed = document.querySelector('div[role="feed"]');
    if (feed) return feed;
    // Alternative container
    return document.querySelector('div.m6QErb.DxyBCb.kA9KIf.dS8AEf') || document.querySelector('div.m6QErb[aria-label*="Results for" i]');
  }

  // Parse a single Google Maps result card
  function parseResultCard(cardEl) {
    if (!cardEl) return null;

    // 1. Business Name & Place Link
    const mainLink = cardEl.querySelector('a.hfpxzc');
    const nameEl = cardEl.querySelector('.qBF1Pd') || cardEl.querySelector('.fontHeadlineSmall');
    const businessName = (mainLink && mainLink.getAttribute('aria-label')) ||
      (nameEl ? nameEl.textContent.trim() : null);

    if (!businessName) return null;

    const mapsUrl = mainLink ? mainLink.href : window.location.href;

    // 2. Rating & Reviews
    const ratingEl = cardEl.querySelector('span.MW4etd');
    let rating = ratingEl ? ratingEl.textContent.trim() : 'N/A';

    const reviewsEl = cardEl.querySelector('span.UY7F9');
    let reviewsCount = 0;
    if (reviewsEl) {
      const match = reviewsEl.textContent.match(/[\d,]+/);
      if (match) reviewsCount = parseInt(match[0].replace(/,/g, ''), 10);
    }

    // 3. Category & Address snippet extraction (Separating ratings from real category)
    let rawCategoryCandidate = '';
    let address = 'N/A';
    const infoContainers = cardEl.querySelectorAll('.W4Efsd');
    const allParts = [];

    infoContainers.forEach(container => {
      const parts = container.textContent.split(/[·•]/).map(s => s.trim()).filter(Boolean);
      allParts.push(...parts);
    });

    for (const part of allParts) {
      // Check if part is a rating / review pattern like "2.8", "2.8(33)", "(33)", "4.9★"
      if (/^[\d.,\s()★☆]+$/.test(part) || /^\d\.\d(?:\s*\(\d+[\d,]*\))?$/.test(part) || /^\(\d+[\d,]*\)$/.test(part)) {
        if (rating === 'N/A') {
          const rMatch = part.match(/(\d\.\d)/);
          if (rMatch) rating = rMatch[1];
        }
        if (reviewsCount === 0) {
          const revMatch = part.match(/\((\d[\d,]*)\)/);
          if (revMatch) reviewsCount = parseInt(revMatch[1].replace(/,/g, ''), 10);
        }
        continue;
      }

      // Check operational hours or status
      if (/^(?:closed|open|opens|closes|24\s*hours|temporarily\s*closed|permanently\s*closed)\b/i.test(part)) {
        continue;
      }

      // Check amenities / badges
      if (/^(?:in-store shopping|curbside pickup|on-site services|online appointments)\b/i.test(part)) {
        continue;
      }

      // Check if it looks like an address (has postal codes, street, road, unit, etc.)
      const isAddressLike = /\b(?:st|street|rd|road|ave|avenue|lane|ln|way|drive|dr|court|ct|park|estate|unit|mk\d|[a-z]{1,2}\d{1,2}\s*\d[a-z]{2}|\d{5})\b/i.test(part) ||
                            part.includes(',');

      if (!isAddressLike && !rawCategoryCandidate) {
        rawCategoryCandidate = part;
      } else if (address === 'N/A') {
        address = part;
      }
    }

    if (address === 'N/A' && infoContainers.length > 1) {
      address = infoContainers[1].textContent.trim();
    }

    // Standardize category with NicheClassifier (GUARANTEES no rating mark like "2.8(33)" ever becomes a niche)
    const currentQuery = getSearchQuery();
    const category = (typeof NicheClassifier !== 'undefined')
      ? NicheClassifier.classify(rawCategoryCandidate, businessName, currentQuery)
      : (rawCategoryCandidate && !/^[\d.,\s()★☆]+$/.test(rawCategoryCandidate) ? rawCategoryCandidate : 'Local Service');

    // 4. Website & Social URL check
    let website = 'N/A';
    let fbLink = 'N/A';
    let igLink = 'N/A';
    let linkedinUrl = 'N/A';
    let websiteFaults = [];

    const webBtn = cardEl.querySelector('a[data-value="Website"], a[aria-label*="website" i], a.lcr4fd');
    if (webBtn && webBtn.href) {
      const rawUrl = unwrapWebsiteUrl(webBtn.href);
      const socialCheck = (typeof Auditor !== 'undefined' && Auditor.isSocialOrAggregatorUrl) 
        ? Auditor.isSocialOrAggregatorUrl(rawUrl) 
        : null;

      if (socialCheck) {
        if (socialCheck.type === 'facebook') fbLink = rawUrl;
        if (socialCheck.type === 'instagram') igLink = rawUrl;
        if (socialCheck.type === 'linkedin') linkedinUrl = rawUrl;
        website = 'N/A'; // A social or maps link is NOT an independent website!
        websiteFaults.push(`❌ No Independent Website (Uses ${socialCheck.label} on GMB)`);
      } else {
        website = rawUrl;
      }
    } else {
      websiteFaults.push('❌ No Website Listed');
    }

    // 5. Phone number
    let phone = 'N/A';
    const fullCardText = cardEl.textContent;
    phone = extractPhoneFromText(fullCardText);

    // Initial lead placeholder
    const initialLead = {
      id: 'gmb_' + btoa(encodeURIComponent(businessName + address)).replace(/=/g, '').slice(0, 16),
      businessName,
      ownerContact: 'N/A',
      email: 'N/A',
      phone,
      address,
      website,
      websiteFault: websiteFaults,
      websiteFaultSummary: websiteFaults.length > 0 ? websiteFaults.join('; ') : 'Pending Deep Audit...',
      lastFbPost: fbLink !== 'N/A' ? 'Profile Linked' : 'Pending Check',
      fbLink: fbLink,
      lastIgPost: igLink !== 'N/A' ? 'Profile Linked' : 'Pending Check',
      igLink: igLink,
      linkedinUrl: linkedinUrl,
      otherIssues: 'GMB Scraped',
      auditNotes: [
        reviewsCount > 0 ? `${rating}★ (${reviewsCount} Google reviews)` : 'No Google reviews yet',
        category
      ],
      pitchAngle: website === 'N/A' ?
        `🚨 No Real Website: ${businessName} lacks an independent website on Google. Pitch an affordable high-converting local booking site with click-to-call.` :
        `Pending deep website crawl...`,
      rating,
      reviewsCount,
      category,
      mapsUrl,
      scrapedAt: new Date().toISOString()
    };

    return initialLead;
  }

  // Scan currently visible cards in the feed
  function scanCurrentCards() {
    const cards = document.querySelectorAll('div.Nv2PK');
    const newItems = [];
    cards.forEach((card) => {
      const lead = parseResultCard(card);
      if (lead) {
        const key = lead.businessName.toLowerCase() + '|' + lead.address.toLowerCase();
        if (!scrapedLeads.has(key)) {
          scrapedLeads.set(key, lead);
          newItems.push(lead);
        }
      }
    });
    return newItems;
  }

  // Inject Floating Widget UI
  function injectWidget() {
    if (document.getElementById('leadpitcher-floating-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'leadpitcher-floating-bar';
    bar.innerHTML = `
      <div class="lp-header">
        <div class="lp-title">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <div>
            <div>Zen Scrapper</div>
            <div style="font-size:10px;font-weight:400;color:#94a3b8;">by Iqam Ifthikar</div>
          </div>
        </div>
        <div class="lp-controls">
          <button id="lp-minimize-btn" class="lp-icon-btn" title="Minimize / Expand">_</button>
        </div>
      </div>
      <div class="lp-body">
        <div class="lp-query-tag">
          Query: <strong id="lp-query-text">${getSearchQuery()}</strong>
        </div>

        <div class="lp-stats-row">
          <div class="lp-stat-item">
            <span class="lp-stat-val green" id="lp-stat-scraped">0</span>
            <span class="lp-stat-lbl">Leads Scraped</span>
          </div>
          <div class="lp-stat-item">
            <span class="lp-stat-val amber" id="lp-stat-faults">0</span>
            <span class="lp-stat-lbl">Faults Found</span>
          </div>
          <div class="lp-stat-item">
            <span class="lp-stat-val" id="lp-stat-audited">0</span>
            <span class="lp-stat-lbl">Audited</span>
          </div>
        </div>

        <div class="lp-progress-container">
          <div class="lp-progress-bar-bg">
            <div class="lp-progress-bar-fill" id="lp-progress-bar"></div>
          </div>
          <div class="lp-status-text">
            <span id="lp-status-msg">Ready to scrape search results</span>
            <span id="lp-status-pct">0%</span>
          </div>
        </div>

        <div class="lp-btn-grid">
          <button id="lp-btn-autoscrape" class="lp-btn lp-btn-primary">
            🚀 Auto-Scrape & Audit All
          </button>
          <button id="lp-btn-quick" class="lp-btn lp-btn-secondary">
            ⚡ Quick Scrape Visible
          </button>
          <button id="lp-btn-dashboard" class="lp-btn lp-btn-secondary">
            📊 Open Dashboard
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bar);

    // Event Listeners
    const minimizeBtn = bar.querySelector('#lp-minimize-btn');
    minimizeBtn.addEventListener('click', () => {
      bar.classList.toggle('minimized');
      minimizeBtn.textContent = bar.classList.contains('minimized') ? '▲' : '_';
    });

    const btnQuick = bar.querySelector('#lp-btn-quick');
    btnQuick.addEventListener('click', handleQuickScrape);

    const btnAuto = bar.querySelector('#lp-btn-autoscrape');
    btnAuto.addEventListener('click', handleAutoScrapeToggle);

    const btnDashboard = bar.querySelector('#lp-btn-dashboard');
    btnDashboard.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });
  }

  // Update UI Stats
  function updateWidgetUI(msg, percent = null) {
    const bar = document.getElementById('leadpitcher-floating-bar');
    if (!bar) return;

    const scrapedEl = bar.querySelector('#lp-stat-scraped');
    const queryEl = bar.querySelector('#lp-query-text');
    const statusEl = bar.querySelector('#lp-status-msg');
    const pctEl = bar.querySelector('#lp-status-pct');
    const barFill = bar.querySelector('#lp-progress-bar');

    if (queryEl) queryEl.textContent = getSearchQuery();
    if (scrapedEl) scrapedEl.textContent = scrapedLeads.size;
    if (statusEl && msg) statusEl.textContent = msg;

    if (percent !== null && barFill && pctEl) {
      const clamped = Math.min(100, Math.max(0, percent));
      barFill.style.width = `${clamped}%`;
      pctEl.textContent = `${Math.round(clamped)}%`;
    }
  }

  // Quick Scrape Visible items
  async function handleQuickScrape() {
    updateWidgetUI('Scanning visible listing cards...', 20);
    const newItems = scanCurrentCards();
    updateWidgetUI(`Captured ${newItems.length} new leads! Sending to audit...`, 50);

    const leadsList = Array.from(scrapedLeads.values());
    chrome.runtime.sendMessage({
      type: 'BATCH_SAVE_AND_AUDIT',
      payload: { 
        leads: leadsList,
        searchTerm: getSearchQuery()
      }
    }, (res) => {
      updateWidgetUI(`Audited & saved ${leadsList.length} leads!`, 100);
    });
  }

  // Auto-scroll Google Maps Feed and Extract All
  async function handleAutoScrapeToggle() {
    const btnAuto = document.getElementById('lp-btn-autoscrape');

    if (isScrapingActive) {
      // User requested stop
      shouldStop = true;
      isScrapingActive = false;
      btnAuto.textContent = '🚀 Auto-Scrape & Audit All';
      btnAuto.classList.remove('lp-btn-danger');
      btnAuto.classList.add('lp-btn-primary');
      updateWidgetUI('Scraping stopped by user.');
      return;
    }

    const feed = getFeedElement();
    if (!feed) {
      alert('Could not find Google Maps feed container. Please make sure search results are displayed on the left.');
      return;
    }

    isScrapingActive = true;
    shouldStop = false;
    btnAuto.textContent = '⏹ Stop Scraping';
    btnAuto.classList.remove('lp-btn-primary');
    btnAuto.classList.add('lp-btn-danger');

    updateWidgetUI('Auto-scrolling Google Maps results...', 10);

    let scrollAttempts = 0;
    let maxScrolls = 40; // Collects 50-80 leads comfortably
    let previousCount = 0;
    let stagnantCount = 0;

    while (isScrapingActive && !shouldStop && scrollAttempts < maxScrolls) {
      scrollAttempts++;

      // Scan cards currently in DOM
      scanCurrentCards();
      const currentCount = scrapedLeads.size;
      updateWidgetUI(`Scrolled ${scrollAttempts}x — Found ${currentCount} leads...`, (scrollAttempts / maxScrolls) * 60);

      if (currentCount === previousCount) {
        stagnantCount++;
      } else {
        stagnantCount = 0;
        previousCount = currentCount;
      }

      // Check if reached end of list
      const endMarker = document.querySelector('.HqnAx') || feed.textContent.includes("You've reached the end of the list");
      if (endMarker || stagnantCount >= 4) {
        console.log('[LeadPitcher AI] Reached end of Google Maps feed.');
        break;
      }

      // Scroll down
      feed.scrollTop = feed.scrollHeight;
      await new Promise(r => setTimeout(r, 1400));
    }

    isScrapingActive = false;
    btnAuto.textContent = '🚀 Auto-Scrape & Audit All';
    btnAuto.classList.remove('lp-btn-danger');
    btnAuto.classList.add('lp-btn-primary');

    const totalLeads = Array.from(scrapedLeads.values());
    updateWidgetUI(`Auto-scroll complete! Dispatching ${totalLeads.length} leads to Deep Audit...`, 70);

    // Send batch to background worker for deep audit & pitch generation
    chrome.runtime.sendMessage({
      type: 'BATCH_SAVE_AND_AUDIT',
      payload: { 
        leads: totalLeads,
        searchTerm: getSearchQuery()
      }
    }, (res) => {
      updateWidgetUI(`✅ Completed! Audited & saved ${totalLeads.length} leads.`, 100);
    });
  }

  // Periodic check to inject widget when on Maps
  function init() {
    injectWidget();
    setInterval(() => {
      injectWidget();
      const queryEl = document.getElementById('lp-query-text');
      if (queryEl) {
        const curQ = getSearchQuery();
        if (queryEl.textContent !== curQ) {
          queryEl.textContent = curQ;
        }
      }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
