/**
 * Zen Scrapper - Deep Search Engine
 * Author: Iqam Ifthikar
 * Zenthoz Digital Marketing (www.zenthoz.com)
 * 
 * Takes scraped business info and performs targeted live web research
 * (via DuckDuckGo HTML, DuckDuckGo Lite, and Google Search endpoints)
 * to discover websites not listed on Google My Business, missing social profiles
 * (Facebook, Instagram, LinkedIn), direct emails, and phone numbers.
 * 
 * Provides a complete step-by-step Research Audit Trail showing what data was researched.
 */

const DeepSearch = {
  // Directory & Aggregator domain blacklist to filter out when searching for the true official website
  AGGREGATOR_DOMAINS: [
    'google.com', 'google.co.uk', 'gstatic.com', 'schema.org', 'w3.org', 'youtube.com',
    'facebook.com', 'fb.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com',
    'yell.com', 'yelp.com', 'yelp.co.uk', 'checkatrade.com', 'trustatrader.com',
    'bark.com', 'thomsonlocal.com', 'cylex-uk.co.uk', 'scoot.co.uk', 'tripadvisor.com',
    'trustpilot.com', 'freeindex.co.uk', 'companieshouse.gov.uk', 'endole.co.uk',
    '192.com', 'wikipedia.org', 'mapquest.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
    'tiktok.com', 'pinterest.com', 'reddit.com', 'bloomberg.com', 'glassdoor.com',
    'indeed.com', 'yellowpages.com', 'bbb.org', 'alignable.com', 'nextdoor.co.uk',
    'bizseek.co.uk', 'uktradefinder.com', 'roofersdirectoryuk.co.uk', 'ratedpeople.com',
    'mybuilder.com', 'near.co.uk', 'touchlocal.com', 'scoot.co.uk'
  ],

  /**
   * Cleans complex business titles (e.g. "Bailey MK Ltd trading name Bailey Roofing and Bailey MK" -> "Bailey Roofing Bailey MK Ltd")
   */
  cleanBusinessName(rawName) {
    if (!rawName) return '';
    let name = rawName.trim();
    const tradeMatch = name.match(/^(.*?)\s+(?:trading\s+name|trading\s+as|t\/a)\s+(.*)$/i);
    if (tradeMatch) {
      const main = tradeMatch[1].trim();
      const trading = tradeMatch[2].split(/\s+and\s+/i)[0].trim();
      return `${trading} ${main}`.trim();
    }
    return name;
  },

  /**
   * Build targeted web search query for a business
   */
  buildSearchQuery(lead) {
    const rawName = lead.businessName ? lead.businessName.trim() : '';
    const cleanName = this.cleanBusinessName(rawName);
    let location = '';
    if (lead.address && lead.address !== 'N/A') {
      const parts = lead.address.split(',');
      location = parts[0].trim();
      if (parts.length > 1 && !/\d/.test(parts[1])) {
        location += ' ' + parts[1].trim();
      }
    }
    location = location.replace(/\b(?:UK|United Kingdom|USA|United States)\b/gi, '').trim();

    return `${cleanName} ${location} official website facebook`.trim();
  },

  /**
   * Build an array of search query variations for maximum recovery
   */
  buildSearchQueries(lead) {
    const rawName = lead.businessName ? lead.businessName.trim() : '';
    const cleanName = this.cleanBusinessName(rawName);
    let location = '';
    if (lead.address && lead.address !== 'N/A') {
      const parts = lead.address.split(',');
      location = parts[0].trim();
    }
    location = location.replace(/\b(?:UK|United Kingdom|USA|United States)\b/gi, '').trim();

    const queries = [];
    queries.push(`${cleanName} ${location} official website facebook`.trim());
    if (rawName !== cleanName) {
      queries.push(`${rawName.split(/\s+(?:trading|t\/a)\s+/i)[0].trim()} ${location} website`.trim());
    }
    if (lead.phone && lead.phone !== 'N/A') {
      queries.push(`${cleanName} "${lead.phone}"`.trim());
    }
    return queries;
  },

  /**
   * Extract clean URL from Google or DDG redirect link
   */
  unwrapUrl(href) {
    if (!href) return null;
    try {
      // DuckDuckGo uddg parameter
      if (href.includes('uddg=')) {
        const u = new URL(href.startsWith('http') ? href : 'https://duckduckgo.com' + href);
        const uddg = u.searchParams.get('uddg');
        if (uddg) return decodeURIComponent(uddg);
      }
      // Google /url?q= parameter
      if (href.includes('/url?') || href.includes('google.com/url?')) {
        const u = new URL(href.startsWith('http') ? href : 'https://www.google.com' + href);
        const q = u.searchParams.get('q');
        if (q) return q;
      }
      if (href.startsWith('http')) {
        return href;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if a domain belongs to known aggregator/directory platforms
   */
  isAggregatorDomain(urlStr) {
    try {
      const parsed = new URL(urlStr);
      const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
      return this.AGGREGATOR_DOMAINS.some(agg => hostname === agg || hostname.endsWith('.' + agg));
    } catch (e) {
      return true;
    }
  },

  /**
   * Parse Search Results HTML (supports DuckDuckGo HTML, DDG Lite, and Google SERP)
   */
  parseSERP(html, lead, engineName = 'Web Search') {
    const results = {
      foundWebsite: null,
      foundFb: null,
      foundIg: null,
      foundLinkedin: null,
      foundEmail: null,
      foundPhone: null,
      foundOwner: null,
      snippets: [],
      candidateUrls: [],
      logs: []
    };

    if (!html) return results;

    results.logs.push(`🔍 Received response from ${engineName} (${html.length} bytes scanned)`);

    // 1. Extract DuckDuckGo /uddg= links
    const uddgRegex = /uddg=([^&'"]+)/gi;
    let um;
    while ((um = uddgRegex.exec(html)) !== null) {
      try {
        const clean = decodeURIComponent(um[1]);
        if (clean.startsWith('http') && !results.candidateUrls.includes(clean)) {
          results.candidateUrls.push(clean);
        }
      } catch (e) {}
    }

    // 2. Extract Google /url?q= links and standard anchors
    const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let am;
    while ((am = anchorRegex.exec(html)) !== null) {
      const rawHref = am[1];
      const unwrap = this.unwrapUrl(rawHref);
      if (unwrap && unwrap.startsWith('http') && !unwrap.includes('google.com') && !unwrap.includes('duckduckgo.com')) {
        if (!results.candidateUrls.includes(unwrap)) {
          results.candidateUrls.push(unwrap);
        }
      }
    }

    // 3. Extract snippet text for evidence & contact details
    const snippetRegex = /<(?:a|div|span)[^>]*class=["'](?:result__snippet|VwiC3b|b_caption)[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div|span)>/gi;
    let sm;
    while ((sm = snippetRegex.exec(html)) !== null) {
      const cleanSnip = sm[1].replace(/<[^>]+>/g, '').trim();
      if (cleanSnip && !results.snippets.includes(cleanSnip)) {
        results.snippets.push(cleanSnip);
      }
    }

    results.logs.push(`🔎 Discovered ${results.candidateUrls.length} candidate URLs and ${results.snippets.length} search snippets`);

    // 4. Scan raw HTML and candidate URLs for Social Profiles
    // Facebook
    const fbMatches = html.match(/https?:\/\/(?:www\.|m\.)?facebook\.com\/[a-zA-Z0-9._-]+/gi) || [];
    for (const fb of fbMatches) {
      if (!fb.includes('/sharer') && !fb.includes('/policies') && !fb.includes('/help') && !fb.includes('/dialog') && !fb.includes('/search')) {
        results.foundFb = fb;
        results.logs.push(`📘 Discovered Facebook Page: ${fb}`);
        break;
      }
    }
    if (!results.foundFb) {
      for (const u of results.candidateUrls) {
        if (/facebook\.com\/[a-zA-Z0-9._-]+/i.test(u) && !u.includes('/sharer') && !u.includes('/policies')) {
          results.foundFb = u;
          results.logs.push(`📘 Discovered Facebook Page from URL: ${u}`);
          break;
        }
      }
    }

    // Instagram
    const igMatches = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi) || [];
    for (const ig of igMatches) {
      if (!ig.includes('/p/') && !ig.includes('/explore') && !ig.includes('/about') && !ig.includes('/developer')) {
        results.foundIg = ig;
        results.logs.push(`📸 Discovered Instagram Profile: ${ig}`);
        break;
      }
    }
    if (!results.foundIg) {
      for (const u of results.candidateUrls) {
        if (/instagram\.com\/[a-zA-Z0-9._-]+/i.test(u) && !u.includes('/p/') && !u.includes('/explore')) {
          results.foundIg = u;
          results.logs.push(`📸 Discovered Instagram from URL: ${u}`);
          break;
        }
      }
    }

    // LinkedIn
    const liMatches = html.match(/https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._-]+/gi) || [];
    for (const li of liMatches) {
      results.foundLinkedin = li;
      results.logs.push(`💼 Discovered LinkedIn Profile: ${li}`);
      break;
    }

    // 5. Discover Candidate Official Website
    // The first non-aggregator, non-social domain is the official website candidate
    for (const url of results.candidateUrls) {
      if (!this.isAggregatorDomain(url)) {
        if (!/\.(pdf|png|jpg|jpeg|svg|gif|webp)$/i.test(url)) {
          try {
            const parsed = new URL(url);
            results.foundWebsite = `${parsed.protocol}//${parsed.hostname}`;
            results.logs.push(`🌐 Discovered Candidate Website: ${results.foundWebsite}`);
            break;
          } catch (e) {}
        }
      }
    }

    // 6. Scan snippet text for direct email disclosures
    const fullText = results.snippets.join(' ') + ' ' + html;
    const emailMatches = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}/g) || [];
    const validEmails = emailMatches.filter(e => 
      !e.includes('google.com') && !e.includes('sentry.io') && !e.includes('wixpress.com') && 
      !e.includes('duckduckgo.com') && !/\.(png|jpg|svg)$/i.test(e)
    );
    if (validEmails.length > 0) {
      results.foundEmail = validEmails[0].toLowerCase();
      results.logs.push(`✉️ Discovered Direct Email in snippet: ${results.foundEmail}`);
    }

    // 7. Scan snippet for direct Phone
    const phoneMatches = fullText.match(/(?:(?:\+44\s?\(0\)\s?|\+44\s?|0)(?:\d\s?){9,10}|(?:\+?1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}))/);
    if (phoneMatches && (!lead.phone || lead.phone === 'N/A')) {
      results.foundPhone = phoneMatches[0].trim();
      results.logs.push(`📞 Discovered Direct Phone in snippet: ${results.foundPhone}`);
    }

    // 8. Scan snippet for Owner / Contact mention
    const ownerSnippetMatch = fullText.match(/(?:Owner|Founder|Director|Lead Arborist|Head Arborist|Managing Director)[\s:–—-]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i);
    if (ownerSnippetMatch && ownerSnippetMatch[1]) {
      const cand = ownerSnippetMatch[1].trim();
      if (!/^(Google|Search|Review|Business|Company|Services|Team|About|Contact)/i.test(cand)) {
        results.foundOwner = cand;
        results.logs.push(`👤 Discovered Owner/Contact: ${cand}`);
      }
    }

    return results;
  },

  /**
   * Backward-compatible parseGoogleSERP
   */
  parseGoogleSERP(html, lead) {
    return this.parseSERP(html, lead, 'Google SERP');
  },

  /**
   * Helper to perform fetch with timeout without forbidden headers
   */
  async safeFetch(url, timeoutMs = 7500) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const text = await res.text();
      return { ok: res.ok, status: res.status, html: text, error: null };
    } catch (err) {
      clearTimeout(timeoutId);
      return { ok: false, status: 0, html: '', error: err.message || 'Fetch failed' };
    }
  },

  /**
   * Execute Full Deep Search for a Lead
   * Searches DuckDuckGo HTML, DDG Lite, and Google with complete audit trail
   */
  async executeLeadResearch(lead) {
    const queries = this.buildSearchQueries(lead);
    const primaryQuery = queries[0] || this.buildSearchQuery(lead);
    const auditLogs = [];
    auditLogs.push(`🚀 Deep Search initiated for: "${lead.businessName}"`);
    auditLogs.push(`🎯 Target Query: ${primaryQuery}`);

    let parsed = null;
    let engineUsed = 'DuckDuckGo';

    for (const q of queries) {
      if (parsed && (parsed.foundWebsite || parsed.foundFb)) break;

      // 1. Try DuckDuckGo HTML
      try {
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
        auditLogs.push(`🌐 Querying Web Search for: "${q}"...`);
        const ddgRes = await this.safeFetch(ddgUrl, 7500);

        if (ddgRes.html && ddgRes.html.length > 500) {
          parsed = this.parseSERP(ddgRes.html, lead, 'DuckDuckGo');
          engineUsed = 'DuckDuckGo';
          auditLogs.push(...parsed.logs);
        }
      } catch (e) {
        auditLogs.push(`⚠️ Web search query warning: ${e.message}`);
      }

      // 2. If nothing found, try DuckDuckGo Lite
      if (!parsed || (!parsed.foundWebsite && !parsed.foundFb)) {
        try {
          const liteUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(q)}`;
          const liteRes = await this.safeFetch(liteUrl, 6500);
          if (liteRes.html && liteRes.html.length > 500) {
            const liteParsed = this.parseSERP(liteRes.html, lead, 'DuckDuckGo Lite');
            engineUsed = 'DuckDuckGo Lite';
            auditLogs.push(...liteParsed.logs);
            if (!parsed) parsed = liteParsed;
            else {
              if (!parsed.foundWebsite) parsed.foundWebsite = liteParsed.foundWebsite;
              if (!parsed.foundFb) parsed.foundFb = liteParsed.foundFb;
              if (!parsed.foundIg) parsed.foundIg = liteParsed.foundIg;
              if (!parsed.foundEmail) parsed.foundEmail = liteParsed.foundEmail;
            }
          }
        } catch (e) {}
      }

      // 3. Fallback to Google Search
      if (!parsed || (!parsed.foundWebsite && !parsed.foundFb)) {
        try {
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=en`;
          const gRes = await this.safeFetch(googleUrl, 6500);
          if (gRes.html && gRes.html.length > 500) {
            const gParsed = this.parseSERP(gRes.html, lead, 'Google Search');
            auditLogs.push(...gParsed.logs);
            if (!parsed) parsed = gParsed;
            else {
              if (!parsed.foundWebsite) parsed.foundWebsite = gParsed.foundWebsite;
              if (!parsed.foundFb) parsed.foundFb = gParsed.foundFb;
              if (!parsed.foundIg) parsed.foundIg = gParsed.foundIg;
              if (!parsed.foundEmail) parsed.foundEmail = gParsed.foundEmail;
            }
          }
        } catch (e) {}
      }
    }

    if (!parsed) {
      parsed = {
        foundWebsite: null,
        foundFb: null,
        foundIg: null,
        foundLinkedin: null,
        foundEmail: null,
        foundPhone: null,
        foundOwner: null,
        snippets: [],
        candidateUrls: [],
        logs: []
      };
    }

    let updatedLead = { ...lead };
    let changesMade = false;

    // Apply discovered website
    if (parsed.foundWebsite && (!lead.website || lead.website === 'N/A' || lead.website.trim() === '')) {
      updatedLead.website = parsed.foundWebsite;
      updatedLead.websiteFoundViaDeepSearch = true;
      changesMade = true;
      auditLogs.push(`✅ Linked Official Website: ${parsed.foundWebsite}`);
    }

    // Apply discovered Facebook
    if (parsed.foundFb && (!updatedLead.fbLink || updatedLead.fbLink === 'N/A')) {
      updatedLead.fbLink = parsed.foundFb;
      updatedLead.lastFbPost = 'Profile Linked';
      changesMade = true;
      auditLogs.push(`✅ Linked Facebook Profile: ${parsed.foundFb}`);
    }

    // Apply discovered Instagram
    if (parsed.foundIg && (!updatedLead.igLink || updatedLead.igLink === 'N/A')) {
      updatedLead.igLink = parsed.foundIg;
      updatedLead.lastIgPost = 'Profile Linked';
      changesMade = true;
      auditLogs.push(`✅ Linked Instagram Profile: ${parsed.foundIg}`);
    }

    // Apply discovered LinkedIn
    if (parsed.foundLinkedin && (!updatedLead.linkedinUrl || updatedLead.linkedinUrl === 'N/A')) {
      updatedLead.linkedinUrl = parsed.foundLinkedin;
      changesMade = true;
      auditLogs.push(`✅ Linked LinkedIn Profile: ${parsed.foundLinkedin}`);
    }

    // Apply discovered Email
    if (parsed.foundEmail && (!updatedLead.email || updatedLead.email === 'N/A')) {
      updatedLead.email = parsed.foundEmail;
      changesMade = true;
      auditLogs.push(`✅ Saved Contact Email: ${parsed.foundEmail}`);
    }

    // Apply discovered Phone
    if (parsed.foundPhone && (!updatedLead.phone || updatedLead.phone === 'N/A')) {
      updatedLead.phone = parsed.foundPhone;
      changesMade = true;
      auditLogs.push(`✅ Saved Direct Phone: ${parsed.foundPhone}`);
    }

    // Apply discovered Owner
    if (parsed.foundOwner && (!updatedLead.ownerContact || updatedLead.ownerContact === 'N/A')) {
      updatedLead.ownerContact = parsed.foundOwner;
      changesMade = true;
      auditLogs.push(`✅ Saved Decision Maker: ${parsed.foundOwner}`);
    }

    // Attach comprehensive Research Audit Trail
    const nowIso = new Date().toISOString();
    const discoveredSummary = [];
    if (parsed.foundWebsite) discoveredSummary.push(`Website (${parsed.foundWebsite})`);
    if (parsed.foundFb) discoveredSummary.push('Facebook');
    if (parsed.foundIg) discoveredSummary.push('Instagram');
    if (parsed.foundLinkedin) discoveredSummary.push('LinkedIn');
    if (parsed.foundEmail) discoveredSummary.push(`Email (${parsed.foundEmail})`);
    if (parsed.foundPhone) discoveredSummary.push(`Phone (${parsed.foundPhone})`);

    const resultStatus = discoveredSummary.length > 0 
      ? `Found: ${discoveredSummary.join(', ')}` 
      : 'Verified no unlisted website/socials found on web';

    auditLogs.push(`🏁 Research status: ${resultStatus}`);

    updatedLead.researchAudit = {
      researchedAt: nowIso,
      searchQuery: query,
      engineUsed: engineUsed,
      status: resultStatus,
      discovered: {
        website: parsed.foundWebsite,
        fb: parsed.foundFb,
        ig: parsed.foundIg,
        linkedin: parsed.foundLinkedin,
        email: parsed.foundEmail,
        phone: parsed.foundPhone,
        owner: parsed.foundOwner
      },
      logs: auditLogs,
      snippets: (parsed.snippets || []).slice(0, 3)
    };

    if (!updatedLead.auditNotes) updatedLead.auditNotes = [];
    const researchNote = `🔍 Deep Search: ${resultStatus}`;
    // Avoid duplicate notes
    updatedLead.auditNotes = updatedLead.auditNotes.filter(n => !n.startsWith('🔍 Deep Search'));
    updatedLead.auditNotes.unshift(researchNote);
    updatedLead.otherIssues = updatedLead.auditNotes.join('; ');

    // Re-generate pitch angle with newly discovered info
    if (typeof PitchGenerator !== 'undefined') {
      updatedLead.pitchAngle = PitchGenerator.generatePitchAngle(updatedLead);
    }

    return {
      success: true,
      lead: updatedLead,
      foundWebsite: parsed.foundWebsite,
      foundFb: parsed.foundFb,
      foundIg: parsed.foundIg,
      foundLinkedin: parsed.foundLinkedin,
      foundEmail: parsed.foundEmail,
      foundPhone: parsed.foundPhone,
      foundOwner: parsed.foundOwner,
      researchAudit: updatedLead.researchAudit,
      changesMade
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeepSearch;
}
if (typeof globalThis !== 'undefined') {
  globalThis.DeepSearch = DeepSearch;
}
if (typeof window !== 'undefined') {
  window.DeepSearch = DeepSearch;
}
