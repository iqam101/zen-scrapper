/**
 * Zen Scrapper - Background Service Worker
 * Author: Iqam Ifthikar
 * 
 * Handles cross-origin website fetching, Google Deep Search, website audits,
 * session-based campaign storage (preventing mix-ups of searches), and inter-component messaging.
 */

import './niche_classifier.js';
import './pitch_generator.js';
import './auditor.js';
import './deep_search.js';

const NicheClassifier = globalThis.NicheClassifier;
const Auditor = globalThis.Auditor;
const PitchGenerator = globalThis.PitchGenerator;
const DeepSearch = globalThis.DeepSearch;

console.log('[Zen Scrapper by Iqam Ifthikar] Background service worker initialized.');

// Update badge count based on active session or total leads
async function updateBadge() {
  try {
    const data = await chrome.storage.local.get(['sessions', 'activeSessionId', 'leads']);
    let count = 0;
    const sessions = data.sessions || [];
    if (sessions.length > 0) {
      const active = sessions.find(s => s.id === data.activeSessionId) || sessions[0];
      count = (active.leads || []).length;
    } else if (data.leads) {
      count = data.leads.length;
    }

    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  } catch (err) {
    console.error('Error updating badge:', err);
  }
}

// Fetch helper with timeout and custom User-Agent
async function fetchWithTimeout(url, timeoutMs = 8500) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim();
    const response = await fetch(cleanUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const loadTimeMs = Date.now() - startTime;
    const html = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      html: html,
      loadTimeMs: loadTimeMs,
      error: null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const loadTimeMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      html: '',
      loadTimeMs: loadTimeMs,
      error: isTimeout ? 'Timeout (>8.5s)' : (err.message || 'Fetch Failed')
    };
  }
}

// Deep audit lead including potential sub-page contact crawl
async function auditSingleLead(lead) {
  if (!lead.website || lead.website === 'N/A' || lead.website.trim() === '') {
    return Auditor.auditLead(lead, '', { noWebsite: true });
  }

  // 1. Fetch homepage
  const homeRes = await fetchWithTimeout(lead.website, 8500);
  let audited = Auditor.auditLead(lead, homeRes.html, {
    status: homeRes.status,
    loadTimeMs: homeRes.loadTimeMs,
    error: homeRes.error
  });

  // Preserve any metadata already attached
  if (lead.websiteFoundViaDeepSearch) {
    audited.websiteFoundViaDeepSearch = true;
  }

  // 2. If no email found and we have HTML, check for a contact or about page
  if ((!audited.email || audited.email === 'N/A') && homeRes.html) {
    try {
      const contactLinkMatch = homeRes.html.match(/href=["']([^"']*(?:contact|about|get-in-touch|our-team)[^"']*)["']/i);
      if (contactLinkMatch && contactLinkMatch[1]) {
        let contactHref = contactLinkMatch[1].trim();
        let subUrl = contactHref;
        if (!contactHref.startsWith('http')) {
          const base = new URL(homeRes.finalUrl || lead.website);
          subUrl = new URL(contactHref, base.origin).toString();
        }

        const subRes = await fetchWithTimeout(subUrl, 5000);
        if (subRes.html) {
          const subEmails = Auditor.extractEmails(subRes.html);
          if (subEmails.length > 0) {
            audited.email = subEmails[0];
          }

          if (audited.ownerContact === 'N/A') {
            const subOwner = Auditor.extractOwnerOrContact(subRes.html, lead.businessName);
            if (subOwner !== 'N/A') audited.ownerContact = subOwner;
          }

          if (audited.fbLink === 'N/A' || audited.igLink === 'N/A') {
            const subSocials = Auditor.extractSocialLinks(subRes.html);
            if (audited.fbLink === 'N/A' && subSocials.fbLink !== 'N/A') audited.fbLink = subSocials.fbLink;
            if (audited.igLink === 'N/A' && subSocials.igLink !== 'N/A') audited.igLink = subSocials.igLink;
          }
        }
      }
    } catch (e) {
      console.warn('Subpage crawl failed:', e);
    }
  }

  // Re-generate pitch with complete lead findings
  audited.pitchAngle = PitchGenerator.generatePitchAngle(audited);
  audited.outreachKit = PitchGenerator.generateOutreachKit(audited);

  return audited;
}

// RUN DEEP SEARCH FOR A LEAD (Multi-source live web search with full research audit trail)
async function runDeepSearchForLead(lead) {
  console.log(`[Zen Scrapper] Running Deep Search for: ${lead.businessName}`);
  const result = await DeepSearch.executeLeadResearch(lead);
  let updatedLead = result.lead;

  // If newly discovered website, run deep website audit
  if (result.foundWebsite && (!lead.website || lead.website === 'N/A')) {
    try {
      updatedLead = await auditSingleLead(updatedLead);
      updatedLead.websiteFoundViaDeepSearch = true;
    } catch (e) {
      console.warn('Audit newly discovered website failed:', e);
    }
  }

  // Refresh pitch
  if (typeof PitchGenerator !== 'undefined') {
    updatedLead.pitchAngle = PitchGenerator.generatePitchAngle(updatedLead);
    updatedLead.outreachKit = PitchGenerator.generateOutreachKit(updatedLead);
  }

  return {
    ...result,
    lead: updatedLead
  };
}

// SESSION-BASED STORAGE MANAGEMENT
async function getSessionsData() {
  const data = await chrome.storage.local.get(['sessions', 'activeSessionId', 'leads', 'hasInitializedSessions']);
  let sessions = data.sessions || [];

  // Migration from legacy flat leads array (runs only once on initial setup, NEVER after user cleared data!)
  if (!data.hasInitializedSessions) {
    if (sessions.length === 0 && data.leads && data.leads.length > 0) {
      const legacySession = {
        id: 'session_' + Date.now(),
        searchTerm: 'Initial Scrape (Milton Keynes)',
        createdAt: new Date().toISOString(),
        leadsCount: data.leads.length,
        faultsCount: data.leads.filter(l => (!l.website || l.website === 'N/A') || (l.websiteFault && l.websiteFault.length > 0)).length,
        leads: data.leads
      };
      sessions = [legacySession];
      await chrome.storage.local.set({ sessions, activeSessionId: legacySession.id, hasInitializedSessions: true });
      await chrome.storage.local.remove(['leads']);
      return { sessions, activeSessionId: legacySession.id };
    }
    await chrome.storage.local.set({ hasInitializedSessions: true });
  }

  return { sessions, activeSessionId: data.activeSessionId || (sessions[0] ? sessions[0].id : null) };
}

async function saveSessionLeads(searchTerm, rawLeads) {
  const { sessions } = await getSessionsData();
  const cleanTerm = (searchTerm || 'Google Maps Search').trim();

  // Find if an identical search term session was created recently (within last 3 hours)
  const now = Date.now();
  let session = sessions.find(s => 
    s.searchTerm.toLowerCase() === cleanTerm.toLowerCase() && 
    (now - new Date(s.createdAt).getTime() < 3 * 3600 * 1000)
  );

  if (!session) {
    // Create new distinct session
    session = {
      id: 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      searchTerm: cleanTerm,
      createdAt: new Date().toISOString(),
      leadsCount: rawLeads.length,
      faultsCount: 0,
      leads: []
    };
    sessions.unshift(session); // Place newest at top
  }

  // Merge leads in session to prevent duplicates within this session & standardize niche
  const map = new Map();
  for (const l of session.leads) {
    const key = (l.businessName + '|' + (l.address || '')).toLowerCase().trim();
    // Classify lead niche accurately
    if (typeof NicheClassifier !== 'undefined') {
      l.category = NicheClassifier.classify(l.category, l.businessName, cleanTerm);
    }
    map.set(key, l);
  }
  for (const l of rawLeads) {
    const key = (l.businessName + '|' + (l.address || '')).toLowerCase().trim();
    if (typeof NicheClassifier !== 'undefined') {
      l.category = NicheClassifier.classify(l.category, l.businessName, cleanTerm);
    }
    if (map.has(key)) {
      map.set(key, { ...map.get(key), ...l });
    } else {
      map.set(key, l);
    }
  }

  session.leads = Array.from(map.values());
  session.leadsCount = session.leads.length;
  session.faultsCount = session.leads.filter(l => 
    (!l.website || l.website === 'N/A') || 
    (l.websiteFault && l.websiteFault.length > 0)
  ).length;

  await chrome.storage.local.set({ sessions, activeSessionId: session.id });
  await updateBadge();
  return { sessions, activeSession: session };
}

// MESSAGE LISTENER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  // 1. Audit single lead
  if (type === 'AUDIT_SINGLE_LEAD') {
    auditSingleLead(payload.lead || payload)
      .then(async (auditedLead) => {
        // Save to active session
        const { sessions, activeSessionId } = await getSessionsData();
        const active = sessions.find(s => s.id === (payload.sessionId || activeSessionId));
        if (active) {
          const idx = active.leads.findIndex(l => l.id === auditedLead.id);
          if (idx !== -1) active.leads[idx] = auditedLead;
          await chrome.storage.local.set({ sessions });
        }
        sendResponse({ success: true, lead: auditedLead });
      })
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // 2. Google Deep Search for single lead
  if (type === 'RUN_DEEP_SEARCH') {
    runDeepSearchForLead(payload.lead)
      .then(async (result) => {
        if (result.success && result.lead) {
          const { sessions, activeSessionId } = await getSessionsData();
          const active = sessions.find(s => s.id === (payload.sessionId || activeSessionId));
          if (active) {
            const idx = active.leads.findIndex(l => l.id === result.lead.id);
            if (idx !== -1) active.leads[idx] = result.lead;
            active.faultsCount = active.leads.filter(l => (!l.website || l.website === 'N/A') || (l.websiteFault && l.websiteFault.length > 0)).length;
            await chrome.storage.local.set({ sessions });
          }
        }
        sendResponse(result);
      })
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // 3. Batch save & audit leads for a specific search query
  if (type === 'BATCH_SAVE_AND_AUDIT') {
    (async () => {
      try {
        const rawLeads = payload.leads || [];
        const searchTerm = payload.searchTerm || 'Google Maps Search';
        console.log(`[Zen Scrapper] Batch processing ${rawLeads.length} leads for query: "${searchTerm}"`);

        // Save initial leads to their dedicated session immediately
        const { activeSession } = await saveSessionLeads(searchTerm, rawLeads);

        // Progressively audit leads
        const auditedList = [];
        for (let i = 0; i < rawLeads.length; i++) {
          try {
            const audited = await auditSingleLead(rawLeads[i]);
            auditedList.push(audited);
            if (i % 3 === 0 || i === rawLeads.length - 1) {
              await saveSessionLeads(searchTerm, auditedList);
            }
          } catch (e) {
            auditedList.push(rawLeads[i]);
          }
        }

        const finalResult = await saveSessionLeads(searchTerm, auditedList);
        sendResponse({ success: true, activeSession: finalResult.activeSession });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  // 4. Session management
  if (type === 'GET_SESSIONS') {
    getSessionsData().then(async ({ sessions, activeSessionId }) => {
      const data = await chrome.storage.local.get(['settings']);
      sendResponse({ sessions, activeSessionId, settings: data.settings || {} });
    });
    return true;
  }

  if (type === 'SET_ACTIVE_SESSION') {
    chrome.storage.local.set({ activeSessionId: payload.sessionId }).then(async () => {
      await updateBadge();
      sendResponse({ success: true });
    });
    return true;
  }

  if (type === 'DELETE_SESSION') {
    getSessionsData().then(async ({ sessions, activeSessionId }) => {
      const filtered = sessions.filter(s => s.id !== payload.sessionId);
      const newActive = activeSessionId === payload.sessionId ? (filtered[0] ? filtered[0].id : null) : activeSessionId;
      await chrome.storage.local.set({ sessions: filtered, activeSessionId: newActive });
      await updateBadge();
      sendResponse({ success: true, sessions: filtered, activeSessionId: newActive });
    });
    return true;
  }

  if (type === 'CLEAR_CURRENT_SESSION_LEADS') {
    getSessionsData().then(async ({ sessions, activeSessionId }) => {
      const target = sessions.find(s => s.id === (payload.sessionId || activeSessionId));
      if (target) {
        target.leads = [];
        target.leadsCount = 0;
        target.faultsCount = 0;
        await chrome.storage.local.set({ sessions });
        await updateBadge();
      }
      sendResponse({ success: true, sessions });
    });
    return true;
  }

  if (type === 'CLEAR_ALL_HISTORY') {
    (async () => {
      await chrome.storage.local.set({ sessions: [], activeSessionId: null, leads: [], hasInitializedSessions: true });
      await chrome.storage.local.remove(['leads']);
      await updateBadge();
      sendResponse({ success: true });
    })();
    return true;
  }

  // 5. Navigation
  if (type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    sendResponse({ success: true });
    return true;
  }

  if (type === 'OPEN_SIDEPANEL') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      if (sender.tab && sender.tab.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
        });
      }
    }
    sendResponse({ success: true });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});
