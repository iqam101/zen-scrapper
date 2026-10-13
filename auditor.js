/**
 * LeadPitcher AI - Auditor Engine
 * Performs deep inspection of website HTML, extracts contact emails, owner/arborist names,
 * social links (Facebook, Instagram, LinkedIn), detects technical website faults, and formats audit notes.
 */

const Auditor = {
  /**
   * Filter junk or dummy email addresses
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim().toLowerCase();
    
    // Ignore images, assets, and file extensions erroneously matched
    if (/\.(png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|ico)$/i.test(clean)) return false;
    
    // Ignore common SDK / third party domain junk
    const blacklistDomains = [
      'sentry.io', 'wixpress.com', 'example.com', 'domain.com', 'yourdomain.com',
      'email.com', 'wordpress.org', 'w3.org', 'schema.org', 'cloudflare.com',
      'googleapis.com', 'google.com', 'gstatic.com', 'doubleclick.net', 'gravatar.com'
    ];
    
    for (const d of blacklistDomains) {
      if (clean.endsWith('@' + d) || clean.includes('@' + d)) return false;
    }

    if (clean.startsWith('support@wix') || clean.startsWith('info@wix') || clean.startsWith('noreply')) return false;

    // Check email syntax
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return emailRegex.test(clean);
  },

  /**
   * Extract emails from HTML string
   */
  extractEmails(html) {
    if (!html) return [];
    const emails = new Set();

    // 1. Check mailto: links
    const mailtoRegex = /href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})[?\"\']/gi;
    let match;
    while ((match = mailtoRegex.exec(html)) !== null) {
      if (this.isValidEmail(match[1])) {
        emails.add(match[1].toLowerCase());
      }
    }

    // 2. Generic regex in HTML text
    const textEmailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}/g;
    const allMatches = html.match(textEmailRegex) || [];
    for (const e of allMatches) {
      if (this.isValidEmail(e)) {
        emails.add(e.toLowerCase());
      }
    }

    return Array.from(emails);
  },

  /**
   * Extract Social Media Profile Links
   */
  extractSocialLinks(html) {
    const results = {
      fbLink: 'N/A',
      igLink: 'N/A',
      linkedinUrl: 'N/A',
      twitterUrl: 'N/A',
      youtubeUrl: 'N/A'
    };

    if (!html) return results;

    // Facebook Link
    const fbMatches = html.match(/https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com)\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)?/gi);
    if (fbMatches) {
      const validFb = fbMatches.find(url => 
        !url.includes('/sharer') && 
        !url.includes('/dialog') && 
        !url.includes('/plugins') && 
        !url.includes('/tr?') &&
        !url.includes('facebook.com/policies')
      );
      if (validFb) results.fbLink = validFb;
    }

    // Instagram Link
    const igMatches = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi);
    if (igMatches) {
      const validIg = igMatches.find(url => 
        !url.includes('/p/') && 
        !url.includes('/explore') && 
        !url.includes('/developer') && 
        !url.includes('/about')
      );
      if (validIg) results.igLink = validIg;
    }

    // LinkedIn Profile Link
    const liMatches = html.match(/https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9._-]+/gi);
    if (liMatches && liMatches.length > 0) {
      results.linkedinUrl = liMatches[0];
    }

    // Twitter / X
    const twMatches = html.match(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9._-]+/gi);
    if (twMatches) {
      const validTw = twMatches.find(u => !u.includes('/intent') && !u.includes('/share'));
      if (validTw) results.twitterUrl = validTw;
    }

    // YouTube
    const ytMatches = html.match(/https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/|@)[a-zA-Z0-9._-]+/gi);
    if (ytMatches && ytMatches.length > 0) {
      results.youtubeUrl = ytMatches[0];
    }

    return results;
  },

  /**
   * Extract Owner / Arborist / Key Contact Person
   */
  extractOwnerOrContact(html, businessName = '') {
    if (!html) return 'N/A';

    // 1. Check Schema.org JSON-LD
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type'] === 'Person' && item.name) {
            return `${item.name} (${item.jobTitle || 'Key Person'})`;
          }
          if (item.founder && item.founder.name) {
            return `${item.founder.name} (Founder)`;
          }
          if (item.author && item.author.name && item.author['@type'] === 'Person') {
            return `${item.author.name}`;
          }
        }
      } catch (e) {
        // invalid JSON in tag, ignore
      }
    }

    // 2. Specific Arborist / Tree Surgeon / Owner role regex
    const rolePrefixes = [
      /(?:Head\s+Arborist|Lead\s+Arborist|Principal\s+Arborist|Senior\s+Arborist|Chief\s+Arborist)[\s:–—-]+([A-Za-z\s]+)/i,
      /(?:Arborist|Tree\s+Surgeon|Owner|Founder|Director|Proprietor|Managing\s+Director)[\s:–—-]+([A-Za-z\s]+)/i,
      /(?:Meet|About)\s+(?:the\s+Arborist|the\s+Owner|our\s+Founder)[\s:–—-]+([A-Za-z\s]+)/i,
      /(?:Hi|Hello),?\s+(?:I'm|I\s+am|my\s+name\s+is)\s+([A-Za-z\s]+)(?:,|\s+and\s+I'm|\s+the\s+owner)/i,
      /Founded\s+in\s+\d{4}\s+by\s+([A-Za-z\s]+)/i
    ];

    const stopWords = new Set(['in', 'at', 'on', 'by', 'the', 'and', 'for', 'with', 'from', 'our', 'is', 'a', 'an', 'to', 'of', 'who', 'has', 'since']);

    for (const pat of rolePrefixes) {
      const matchRole = html.match(pat);
      if (matchRole && matchRole[1]) {
        // Extract strictly capitalized consecutive name words
        const rawSnippet = matchRole[1].trim();
        const words = rawSnippet.split(/[\s,.-]+/).filter(Boolean);
        const nameTokens = [];
        
        for (const w of words) {
          if (stopWords.has(w.toLowerCase()) || /^\d+$/.test(w)) break;
          if (/^[A-Z][a-z]+$/.test(w)) {
            nameTokens.push(w);
            if (nameTokens.length >= 3) break;
          } else {
            break;
          }
        }

        if (nameTokens.length >= 1 && nameTokens.length <= 3) {
          const candidate = nameTokens.join(' ');
          if (!/^(Tree|Services|Surgeon|Company|Team|Contact|About|Home|Milton|Keynes|Welcome)$/i.test(candidate)) {
            return candidate;
          }
        }
      }
    }

    // 3. Fallback: check for "Contact [Name]" or Team names
    return 'N/A';
  },

  /**
   * Check if a URL is actually a social page, Google link, or linktree aggregator
   */
  isSocialOrAggregatorUrl(url) {
    if (!url || url === 'N/A') return false;
    const clean = url.trim().toLowerCase();
    if (/facebook\.com|fb\.com|fb\.me/i.test(clean)) return { type: 'facebook', label: 'Facebook Page' };
    if (/instagram\.com|instagr\.am/i.test(clean)) return { type: 'instagram', label: 'Instagram Profile' };
    if (/linkedin\.com/i.test(clean)) return { type: 'linkedin', label: 'LinkedIn Profile' };
    if (/google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(clean)) return { type: 'google_maps', label: 'Google Maps Link' };
    if (/business\.site/i.test(clean)) return { type: 'defunct_google_site', label: 'Defunct Google Site (.business.site)' };
    if (/google\.[a-z.]+\/search|google\.[a-z.]+\/url/i.test(clean)) return { type: 'google_search', label: 'Google Search Link' };
    if (/twitter\.com|x\.com|tiktok\.com|youtube\.com|linktr\.ee|beacons\.ai/i.test(clean)) return { type: 'social', label: 'Social/Linktree Page' };
    return false;
  },

  /**
   * Detect Technical Website Faults & Audit Issues
   */
  detectWebsiteFaults(websiteUrl, html, responseMeta = {}) {
    const faults = [];
    const notes = [];

    // Check if the URL is actually a social or google link
    const socialCheck = this.isSocialOrAggregatorUrl(websiteUrl);
    if (socialCheck) {
      faults.push(`❌ No Independent Website (Uses ${socialCheck.label} on GMB)`);
      notes.push(`Listed a ${socialCheck.label} as their website — severely limits Google SEO and conversions`);
      return { faults, notes, isSocialOnly: true };
    }

    if (!websiteUrl || websiteUrl === 'N/A') {
      faults.push('❌ No Website Listed (100% reliant on Google Maps)');
      notes.push('Missing professional web presence — prospective leads bounce to competitors');
      return { faults, notes };
    }

    // 1. SSL Protocol Check
    if (websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      faults.push('⚠️ No SSL (HTTP Only - Chrome displays "Not Secure")');
      notes.push('Site triggers browser security alerts, scaring potential clients');
    }

    if (!html || html.trim() === '') {
      if (responseMeta.status === 404) {
        faults.push('🚨 Broken Link / 404 Page Not Found');
        notes.push('Website URL points to a dead 404 page');
      } else if (responseMeta.error) {
        faults.push(`🚨 Website Offline / Unreachable (${responseMeta.error})`);
        notes.push('Server failed to respond or blocked connections');
      }
      return { faults, notes };
    }

    // 2. Mobile Viewport Check
    const hasViewport = /<meta\s+[^>]*name=["']viewport["'][^>]*>/i.test(html);
    if (!hasViewport) {
      faults.push('📱 Missing Mobile Viewport (Unresponsive on phones)');
      notes.push('Layout does not scale properly on mobile devices, breaking UX');
    }

    // 3. SEO Meta Tags & Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (!title) {
      faults.push('🔍 Missing Page Title Tag (Severe SEO penalty)');
    } else if (/^(Home|Index|Default|Welcome|Just another WordPress site)/i.test(title)) {
      faults.push(`🔍 Generic Page Title ("${title}")`);
      notes.push('Title tag is not optimized for local keywords');
    }

    const hasMetaDesc = /<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html);
    if (!hasMetaDesc) {
      faults.push('📝 Missing Meta Description (Poor search snippet CTR)');
    }

    // 4. OpenGraph Tags
    const hasOg = /<meta\s+[^>]*property=["']og:image["'][^>]*>/i.test(html);
    if (!hasOg) {
      faults.push('🔗 Missing OpenGraph Preview Image (Social sharing broken)');
    }

    // 5. Outdated Copyright Year
    const copyrightMatch = html.match(/(?:©|&copy;|Copyright)\s*(\d{4})/i);
    if (copyrightMatch) {
      const year = parseInt(copyrightMatch[1], 10);
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1) {
        faults.push(`⏳ Outdated Website (Copyright shows ${year})`);
        notes.push(`Website has not been updated since ${year}`);
      }
    }

    // 6. Direct Click-to-Call Phone or Contact Action
    const hasTelLink = /href=["']tel:[^"']+["']/i.test(html);
    if (!hasTelLink) {
      faults.push('📞 No Click-to-Call Link (Mobile visitors cannot tap to call)');
      notes.push('Lacks direct mobile tel: click button, reducing emergency calls');
    }

    // 7. Lead Capture Form / Quote Button
    const hasForm = /<form[^>]*>[\s\S]*?<\/form>/i.test(html);
    const hasQuoteButton = /(?:Request|Get|Instant|Free)\s+(?:a\s+)?(?:Quote|Estimate|Inspection)/i.test(html);
    if (!hasForm && !hasQuoteButton) {
      faults.push('📋 No Online Quote Form Detected');
      notes.push('Customers cannot easily request an online quote after business hours');
    }

    // 8. Analytics & Conversion Tracking
    const hasAnalytics = /(?:gtag\(|GoogleAnalyticsObject|G-[A-Z0-9]+|UA-\d+|analytics\.js)/i.test(html);
    const hasPixel = /(?:fbq\(|connect\.facebook\.net)/i.test(html);
    if (!hasAnalytics && !hasPixel) {
      notes.push('No conversion tracking (Google Analytics / Meta Pixel) detected — flying blind on ad ROI');
    }

    // 9. Page Speed indicator
    if (responseMeta.loadTimeMs && responseMeta.loadTimeMs > 2800) {
      faults.push(`⚡ Slow Load Time (${(responseMeta.loadTimeMs / 1000).toFixed(1)}s)`);
      notes.push('Slow initial response time hurts Google Core Web Vitals rankings');
    }

    return { faults, notes };
  },

  /**
   * Main audit orchestrator
   * Merges business info, fetched HTML, detects faults, socials, and builds the complete lead record.
   */
  auditLead(businessInfo, html = '', responseMeta = {}) {
    let websiteUrl = businessInfo.website || 'N/A';
    const businessName = businessInfo.businessName || 'Business';

    // Check if the website URL is actually a Facebook, Instagram, LinkedIn, or Google Maps link
    let fbLink = businessInfo.fbLink || 'N/A';
    let igLink = businessInfo.igLink || 'N/A';
    let linkedinUrl = businessInfo.linkedinUrl || 'N/A';

    const socialCheck = this.isSocialOrAggregatorUrl(websiteUrl);
    if (socialCheck) {
      if (socialCheck.type === 'facebook' && fbLink === 'N/A') fbLink = websiteUrl;
      if (socialCheck.type === 'instagram' && igLink === 'N/A') igLink = websiteUrl;
      if (socialCheck.type === 'linkedin' && linkedinUrl === 'N/A') linkedinUrl = websiteUrl;
      websiteUrl = 'N/A'; // Business has NO independent website!
    }

    // Emails
    const extractedEmails = this.extractEmails(html);
    const email = extractedEmails.length > 0 ? extractedEmails[0] : (businessInfo.email || 'N/A');

    // Phone
    let phone = businessInfo.phone || 'N/A';
    if ((!phone || phone === 'N/A') && html) {
      const telMatch = html.match(/href=["']tel:([^"'\s]+)["']/i);
      if (telMatch) {
        phone = decodeURIComponent(telMatch[1]).replace(/[^\d+()\s-]/g, '');
      }
    }

    // Social Links from HTML
    const socials = this.extractSocialLinks(html);
    if (fbLink === 'N/A' && socials.fbLink !== 'N/A') fbLink = socials.fbLink;
    if (igLink === 'N/A' && socials.igLink !== 'N/A') igLink = socials.igLink;
    if (linkedinUrl === 'N/A' && socials.linkedinUrl !== 'N/A') linkedinUrl = socials.linkedinUrl;

    // Last FB / IG Post Status
    const lastFbPost = fbLink !== 'N/A' ? 'Profile Linked' : '❌ No FB Page Found';
    const lastIgPost = igLink !== 'N/A' ? 'Profile Linked' : '❌ No IG Account Found';

    // Owner / Contact / Arborist
    const ownerContact = this.extractOwnerOrContact(html, businessName);

    // Faults & Notes
    const { faults, notes } = this.detectWebsiteFaults(businessInfo.website || 'N/A', html, responseMeta);

    // Add GMB specific audit notes
    if (businessInfo.rating && businessInfo.reviewsCount) {
      const rating = parseFloat(businessInfo.rating);
      const count = parseInt(businessInfo.reviewsCount, 10);
      if (count > 25 && rating >= 4.7) {
        notes.unshift(`⭐ Excellent Google reputation: ${rating}★ from ${count} reviews`);
      } else if (count < 8) {
        notes.unshift(`⚠️ Low Google review count (${count} reviews) — highly vulnerable to competitor ranking`);
      }
    }

    const leadRecord = {
      id: businessInfo.id || 'lead_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      businessName: businessName,
      ownerContact: ownerContact !== 'N/A' ? ownerContact : (businessInfo.ownerContact || 'N/A'),
      email: email,
      phone: phone,
      address: businessInfo.address || 'N/A',
      website: websiteUrl,
      websiteFault: faults,
      websiteFaultSummary: faults.length > 0 ? faults.join('; ') : 'No Critical Faults Detected',
      lastFbPost: lastFbPost,
      fbLink: fbLink,
      lastIgPost: lastIgPost,
      igLink: igLink,
      linkedinUrl: linkedinUrl,
      otherIssues: notes.length > 0 ? notes.join('; ') : 'None',
      auditNotes: notes,
      rating: businessInfo.rating || 'N/A',
      reviewsCount: businessInfo.reviewsCount || 0,
      category: businessInfo.category || 'Local Business',
      mapsUrl: businessInfo.mapsUrl || '',
      auditedAt: new Date().toISOString()
    };

    // Synthesize Pitch Angle using PitchGenerator
    if (typeof PitchGenerator !== 'undefined') {
      leadRecord.pitchAngle = PitchGenerator.generatePitchAngle(leadRecord);
      leadRecord.outreachKit = PitchGenerator.generateOutreachKit(leadRecord);
    } else {
      leadRecord.pitchAngle = leadRecord.websiteFaultSummary;
    }

    return leadRecord;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auditor;
}
if (typeof globalThis !== 'undefined') {
  globalThis.Auditor = Auditor;
}
if (typeof window !== 'undefined') {
  window.Auditor = Auditor;
}
