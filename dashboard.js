/**
 * Zen Scrapper - Master Dashboard Logic
 * Author: Iqam Ifthikar
 * 
 * Features:
 * - Session & Search History Isolation (Keeps present scraped data separate from previous searches)
 * - Deep Search (Queries Google to recover missing websites, socials, and contact info)
 * - Detects social / Google / Linktree links mistakenly listed as websites on GMB (sets website = N/A)
 * - Google Contacts CSV Export (Direct 1-click import into contacts.google.com)
 * - Contact List CSV Import (Add external contacts into campaign)
 * - Toggle Total Leads metric card on/off in Settings (hidden by default)
 * - Responsive non-overlapping UI
 */

(function () {
  let sessions = [];
  let activeSessionId = null;
  let currentFilter = 'all';
  let currentNicheFilter = 'all';
  let searchKeyword = '';
  let activeModalLead = null;
  let isDeepSearchBulkRunning = false;

  let userSettings = {
    senderName: 'Iqam Ifthikar',
    agencyName: 'Zenthoz Digital Marketing',
    agencyWebsite: 'www.zenthoz.com',
    senderPhone: '+1 307 301 2270',
    serviceType: 'High-Converting Web Design, SEO & Lead Generation',
    pitchPreference: 'balanced',
    showTotalLeads: false,
    supabaseUrl: '',
    supabaseAnonKey: ''
  };

  // DOM Elements
  const tbody = document.getElementById('leads-tbody');
  const emptyState = document.getElementById('empty-state');
  const sessionSelect = document.getElementById('session-select');
  const deepSearchBanner = document.getElementById('deep-search-banner');
  const deepSearchTitle = document.getElementById('deep-search-title');
  const deepSearchDesc = document.getElementById('deep-search-desc');
  const filterNicheSelect = document.getElementById('filter-niche');
  const activeFilterBadge = document.getElementById('active-filter-badge');

  // Stats
  const cardTotal = document.getElementById('card-metric-total');
  const statTotal = document.getElementById('stat-total-leads');
  const statFaults = document.getElementById('stat-total-faults');
  const statNoWeb = document.getElementById('stat-no-website');
  const statDeepRecovered = document.getElementById('stat-deep-recovered');
  const statEmail = document.getElementById('stat-with-email');

  // Controls
  const filterInput = document.getElementById('filter-keyword');
  const mapsSearchInput = document.getElementById('gmaps-search-input');
  const toastEl = document.getElementById('toast');
  const fileImportInput = document.getElementById('input-import-csv');

  // Modal elements
  const pitchModal = document.getElementById('pitch-modal');
  const settingsModal = document.getElementById('settings-modal');

  // Toast Helper
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  // Get currently active session object
  function getActiveSession() {
    if (!sessions || sessions.length === 0) return null;
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }

  // Sanitize any lead where a social/google/linktree link was mistakenly entered as website
  function sanitizeLeadWebsites(lead) {
    if (lead.website && lead.website !== 'N/A' && typeof Auditor !== 'undefined' && Auditor.isSocialOrAggregatorUrl) {
      const socialCheck = Auditor.isSocialOrAggregatorUrl(lead.website);
      if (socialCheck) {
        if (socialCheck.type === 'facebook' && (!lead.fbLink || lead.fbLink === 'N/A')) {
          lead.fbLink = lead.website;
          lead.lastFbPost = 'Profile Linked';
        }
        if (socialCheck.type === 'instagram' && (!lead.igLink || lead.igLink === 'N/A')) {
          lead.igLink = lead.website;
          lead.lastIgPost = 'Profile Linked';
        }
        if (socialCheck.type === 'linkedin' && (!lead.linkedinUrl || lead.linkedinUrl === 'N/A')) {
          lead.linkedinUrl = lead.website;
        }

        lead.website = 'N/A'; // Business does NOT have an independent website!
        if (!lead.websiteFault) lead.websiteFault = [];
        if (!lead.websiteFault.some(f => f.includes('No Independent Website'))) {
          lead.websiteFault.unshift(`❌ No Independent Website (Uses ${socialCheck.label} on GMB)`);
        }
        lead.websiteFaultSummary = lead.websiteFault.join('; ');
        
        if (typeof PitchGenerator !== 'undefined') {
          lead.pitchAngle = PitchGenerator.generatePitchAngle(lead);
        }
      }
    }
    return lead;
  }

  // Load Sessions and Settings
  async function loadData() {
    const applyLoadedSessions = async () => {
      // If Supabase credentials configured and no local sessions (or to fetch latest cloud campaigns)
      if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
        try {
          const cloudRes = await SupabaseSync.fetchSessionsAndLeads();
          if (cloudRes.success && Array.isArray(cloudRes.sessions) && cloudRes.sessions.length > 0) {
            if (sessions.length === 0) {
              sessions = cloudRes.sessions;
              activeSessionId = sessions[0] ? sessions[0].id : null;
            } else {
              // Merge missing cloud sessions into local
              cloudRes.sessions.forEach(cloudSess => {
                const existing = sessions.find(s => s.id === cloudSess.id);
                if (!existing) {
                  sessions.push(cloudSess);
                } else if ((cloudSess.leads || []).length > (existing.leads || []).length) {
                  existing.leads = cloudSess.leads;
                  existing.leadsCount = cloudSess.leadsCount;
                }
              });
            }
          }
        } catch (err) {
          console.warn('Initial cloud fetch warning:', err);
        }
      }

      // Sanitize all leads in sessions: reclassify social links & classify clean trade niche
      sessions.forEach(sess => {
        sess.leads = (sess.leads || []).map(lead => {
          let l = sanitizeLeadWebsites(lead);
          if (typeof NicheClassifier !== 'undefined') {
            l.category = NicheClassifier.classify(l.category, l.businessName, sess.searchTerm);
          }
          return l;
        });
      });

      renderSessionSelector();
      updateNicheFilterDropdown();
      applyFiltersAndRender();
      updateCloudStatusUI();
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['sessions', 'activeSessionId', 'leads', 'settings', 'customLocations'], async (data) => {
        if (data.settings) {
          userSettings = {
            ...userSettings,
            ...data.settings,
            agencyName: data.settings.agencyName || 'Zenthoz Digital Marketing',
            agencyWebsite: data.settings.agencyWebsite || 'www.zenthoz.com',
            senderPhone: data.settings.senderPhone || '+1 307 301 2270',
            serviceType: data.settings.serviceType || 'High-Converting Web Design, SEO & Lead Generation'
          };
        } else {
          const localSettings = localStorage.getItem('zenscrapper_settings');
          if (localSettings) {
            try { userSettings = { ...userSettings, ...JSON.parse(localSettings) }; } catch (e) {}
          }
        }

        if (typeof SupabaseSync !== 'undefined') {
          SupabaseSync.init(userSettings.supabaseUrl, userSettings.supabaseAnonKey);
        }

        if (data.customLocations && Array.isArray(data.customLocations) && typeof LeadDirectory !== 'undefined') {
          data.customLocations.forEach(loc => {
            LeadDirectory.addCustomLocation(loc.country, loc.flag, loc.state, loc.area);
          });
        }
        
        if (data.sessions && data.sessions.length > 0) {
          sessions = data.sessions;
          activeSessionId = data.activeSessionId || sessions[0].id;
        } else if (data.leads && data.leads.length > 0) {
          // Migrate legacy flat leads into first session
          const legacy = {
            id: 'session_' + Date.now(),
            searchTerm: 'Milton Keynes tree cutter',
            createdAt: new Date().toISOString(),
            leadsCount: data.leads.length,
            faultsCount: data.leads.filter(l => (!l.website || l.website === 'N/A') || (l.websiteFault && l.websiteFault.length > 0)).length,
            leads: data.leads
          };
          sessions = [legacy];
          activeSessionId = legacy.id;
          chrome.storage.local.set({ sessions, activeSessionId });
        } else {
          sessions = [];
          activeSessionId = null;
        }

        await applyLoadedSessions();
      });
    } else {
      // LocalStorage fallback for standalone web app (e.g. hosted on Vercel)
      const localSettings = localStorage.getItem('zenscrapper_settings');
      if (localSettings) {
        try { userSettings = { ...userSettings, ...JSON.parse(localSettings) }; } catch (e) {}
      }

      if (typeof SupabaseSync !== 'undefined') {
        SupabaseSync.init(userSettings.supabaseUrl, userSettings.supabaseAnonKey);
      }

      const local = localStorage.getItem('zenscrapper_sessions');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          sessions = parsed.sessions || [];
          activeSessionId = parsed.activeSessionId || (sessions[0] ? sessions[0].id : null);
        } catch (e) { sessions = []; }
      }

      await applyLoadedSessions();
    }
  }

  // Persist Sessions (Local & Live Cloud Sync)
  async function persistSessions() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ sessions, activeSessionId });
    } else {
      localStorage.setItem('zenscrapper_sessions', JSON.stringify({ sessions, activeSessionId }));
    }

    // Auto-sync active session to Supabase if connected
    const cur = getActiveSession();
    if (cur && typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
      SupabaseSync.syncSession(cur).catch(err => {
        console.warn('Auto-sync to Supabase warning:', err);
      });
    }

    renderSessionSelector();
    updateNicheFilterDropdown();
    updateMetrics();
  }

  // Render Session Selector Dropdown (Search History)
  function renderSessionSelector() {
    if (!sessionSelect) return;
    sessionSelect.innerHTML = '';

    if (sessions.length === 0) {
      sessionSelect.innerHTML = '<option value="">No search campaigns yet</option>';
      return;
    }

    sessions.forEach((s, idx) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      const count = (s.leads || []).length;
      const dateStr = new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      opt.textContent = `${idx === 0 ? '🟢 [Present] ' : '📁 '}"${s.searchTerm}" (${count} leads) • ${dateStr}`;
      if (s.id === activeSessionId) {
        opt.selected = true;
      }
      sessionSelect.appendChild(opt);
    });
  }

  // Calculate & Update Metrics for Current Active Session
  function updateMetrics() {
    // Check if user wants Total Leads card visible
    if (cardTotal) {
      cardTotal.style.display = userSettings.showTotalLeads ? 'flex' : 'none';
    }

    const cur = getActiveSession();
    if (!cur) {
      if (statTotal) statTotal.textContent = '0';
      if (statFaults) statFaults.textContent = '0';
      if (statNoWeb) statNoWeb.textContent = '0';
      if (statDeepRecovered) statDeepRecovered.textContent = '0';
      if (statEmail) statEmail.textContent = '0';
      return;
    }

    const leads = cur.leads || [];
    const total = leads.length;
    let faultsCount = 0;
    let noWebCount = 0;
    let emailCount = 0;
    let deepRecoveredCount = 0;

    for (const lead of leads) {
      if (!lead.website || lead.website === 'N/A' || lead.website.trim() === '') {
        noWebCount++;
        faultsCount++;
      } else if (lead.websiteFault && lead.websiteFault.length > 0 && !lead.websiteFault[0].includes('No Critical')) {
        faultsCount++;
      }

      if (lead.websiteFoundViaDeepSearch) {
        deepRecoveredCount++;
      }

      if (lead.email && lead.email !== 'N/A' && lead.email.trim() !== '') {
        emailCount++;
      }
    }

    if (statTotal) statTotal.textContent = total;
    if (statFaults) statFaults.textContent = faultsCount;
    if (statNoWeb) statNoWeb.textContent = noWebCount;
    if (statDeepRecovered) statDeepRecovered.textContent = deepRecoveredCount;
    if (statEmail) statEmail.textContent = emailCount;
  }

  // Filter Leads within the Active Session
  function getFilteredLeads() {
    const cur = getActiveSession();
    if (!cur || !cur.leads) return [];

    let result = [...cur.leads];

    // Filter pills
    if (currentFilter === 'faults') {
      result = result.filter(l => 
        (!l.website || l.website === 'N/A') || 
        (l.websiteFault && l.websiteFault.length > 0 && !l.websiteFault[0].includes('No Critical'))
      );
    } else if (currentFilter === 'no-website') {
      result = result.filter(l => !l.website || l.website === 'N/A' || l.website.trim() === '');
    } else if (currentFilter === 'deep-found') {
      result = result.filter(l => Boolean(l.websiteFoundViaDeepSearch));
    } else if (currentFilter === 'has-email') {
      result = result.filter(l => l.email && l.email !== 'N/A' && l.email.trim() !== '');
    } else if (currentFilter === 'has-phone') {
      result = result.filter(l => l.phone && l.phone !== 'N/A' && l.phone.trim() !== '');
    } else if (currentFilter === 'missing-social') {
      result = result.filter(l => 
        (!l.fbLink || l.fbLink === 'N/A') || 
        (!l.igLink || l.igLink === 'N/A')
      );
    }

    // Niche filter
    if (currentNicheFilter && currentNicheFilter !== 'all') {
      const curSession = getActiveSession();
      const searchTerm = curSession ? curSession.searchTerm : '';
      result = result.filter(lead => {
        if (typeof NicheClassifier !== 'undefined') {
          return NicheClassifier.matches(lead, currentNicheFilter, searchTerm);
        }
        const text = `${lead.category || ''} ${lead.businessName || ''} ${(lead.auditNotes || []).join(' ')}`.toLowerCase();
        return text.includes(currentNicheFilter.toLowerCase());
      });
    }

    // Keyword search
    if (searchKeyword.trim() !== '') {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(l => 
        (l.businessName && l.businessName.toLowerCase().includes(q)) ||
        (l.ownerContact && l.ownerContact.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.pitchAngle && l.pitchAngle.toLowerCase().includes(q)) ||
        (l.otherIssues && l.otherIssues.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // Populate Niche Filter Dropdown dynamically (Clean, sorted by trade, NO rating marks)
  function updateNicheFilterDropdown() {
    if (!filterNicheSelect) return;
    const cur = getActiveSession();
    const leads = (cur && cur.leads) ? cur.leads : [];
    const searchTerm = cur ? cur.searchTerm : '';

    // Count leads per clean classified niche
    const nicheCounts = new Map();

    leads.forEach(l => {
      const cleanNiche = (typeof NicheClassifier !== 'undefined')
        ? NicheClassifier.classify(l.category, l.businessName, searchTerm)
        : l.category;

      if (cleanNiche && cleanNiche !== 'General Local Service') {
        nicheCounts.set(cleanNiche, (nicheCounts.get(cleanNiche) || 0) + 1);
      }
    });

    // Canonical list of primary target niches
    const canonicals = (typeof NicheClassifier !== 'undefined')
      ? NicheClassifier.getCanonicalNiches()
      : [
        "Roofing",
        "Tree Cutter / Arborist",
        "Gutter Installation & Cleaning",
        "Siding Installation",
        "Window & Door Replacement",
        "Fencing Contractors",
        "Decks & Patios",
        "Concrete & Driveways",
        "Masonry & Stonework",
        "Painting Contractors",
        "Pressure Washing",
        "Solar Panel Installers",
        "Kitchen & Bath Remodeling",
        "Flooring Installation",
        "Drywall & Plastering",
        "Water Damage & Restoration",
        "Mold Remediation",
        "Foundation & Waterproofing",
        "Locksmiths",
        "Garage Door Repair",
        "Electricians",
        "Plumbing & Heating",
        "Septic & Well Services",
        "Landscaping & Lawn Care",
        "Pest Control",
        "Cleaning Services",
        "Auto Repair & Mechanics",
        "Moving & Storage",
        "Dental & Healthcare"
      ];

    // Combine niches found in current leads with canonical niches
    const allNiches = new Set([...Array.from(nicheCounts.keys()), ...canonicals]);
    const sortedNiches = Array.from(allNiches)
      .filter(n => typeof NicheClassifier === 'undefined' || !NicheClassifier.isInvalidOrRating(n))
      .sort((a, b) => {
        // Prioritize niches that have actual leads in current campaign
        const countA = nicheCounts.get(a) || 0;
        const countB = nicheCounts.get(b) || 0;
        if (countA > 0 && countB === 0) return -1;
        if (countB > 0 && countA === 0) return 1;
        return a.localeCompare(b);
      });

    let html = `<option value="all">All Niches (${leads.length})</option>`;
    sortedNiches.forEach(n => {
      const count = nicheCounts.get(n) || 0;
      const isSelected = (currentNicheFilter === n) ? 'selected' : '';
      const countBadge = count > 0 ? ` (${count})` : '';
      html += `<option value="${escapeHtml(n)}" ${isSelected}>${escapeHtml(n)}${countBadge}</option>`;
    });

    filterNicheSelect.innerHTML = html;
  }

  // Render Table
  function applyFiltersAndRender() {
    updateMetrics();
    const filtered = getFilteredLeads();

    if (activeFilterBadge) {
      const filterLabels = {
        'all': '',
        'faults': '⚠️ Faults',
        'no-website': '🚨 No Website',
        'deep-found': '🔍 Deep Found',
        'has-email': '✉️ Email',
        'has-phone': '📞 Phone',
        'missing-social': '📸 Missing Socials'
      };
      const activeParts = [];
      if (currentFilter !== 'all' && filterLabels[currentFilter]) {
        activeParts.push(filterLabels[currentFilter]);
      }
      if (currentNicheFilter && currentNicheFilter !== 'all') {
        activeParts.push(`🏷️ ${currentNicheFilter}`);
      }
      if (searchKeyword.trim()) {
        activeParts.push(`🔎 "${searchKeyword.trim()}"`);
      }

      if (activeParts.length > 0) {
        activeFilterBadge.style.display = 'inline-block';
        activeFilterBadge.textContent = `Showing ${filtered.length} leads (${activeParts.join(' • ')})`;
      } else {
        activeFilterBadge.style.display = 'none';
      }
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }

    emptyState.classList.remove('visible');

    let html = '';
    filtered.forEach((lead, idx) => {
      // 1. Business Name & Rating
      const mapsUrl = lead.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(lead.businessName)}`;
      const ratingHtml = lead.rating && lead.rating !== 'N/A' 
        ? `<div class="biz-rating">★ ${lead.rating} <span style="color:#94a3b8">(${lead.reviewsCount || 0})</span></div>` 
        : '';

      // 2. Owner / Contact
      const ownerVal = lead.ownerContact || 'N/A';
      const ownerHtml = ownerVal !== 'N/A' 
        ? `<span class="owner-cell">${escapeHtml(ownerVal)}</span>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 3. Email
      const emailVal = lead.email || 'N/A';
      const emailHtml = emailVal !== 'N/A'
        ? `<span class="email-cell"><a href="mailto:${escapeHtml(emailVal)}">${escapeHtml(emailVal)}</a></span>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 4. Phone
      const phoneVal = lead.phone || 'N/A';
      const phoneHtml = phoneVal !== 'N/A'
        ? `<span class="phone-cell"><a href="tel:${escapeHtml(phoneVal)}" style="color:#e2e8f0;text-decoration:none;">${escapeHtml(phoneVal)}</a></span>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 5. Address
      const addressVal = lead.address || 'N/A';

      // 6. Website with Deep Search highlight if recovered
      const webVal = lead.website || 'N/A';
      let webHtml = '';
      if (webVal !== 'N/A' && webVal.trim() !== '') {
        const cleanHost = webVal.replace(/^https?:\/\/(www\.)?/, '');
        webHtml = `<a href="${escapeHtml(webVal)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:none;font-size:12px;display:block;">${escapeHtml(cleanHost)}</a>`;
        if (lead.websiteFoundViaDeepSearch) {
          webHtml += `<span class="badge-tag badge-deep-search" style="font-size:9px;margin-top:2px;">🔍 Deep Search Found</span>`;
        }
      } else {
        webHtml = `<span class="badge-tag badge-fault">No Website</span>`;
      }

      // 7. Website Faults
      let faultBadges = '';
      if (!lead.website || lead.website === 'N/A' || lead.website.trim() === '') {
        if (lead.websiteFault && lead.websiteFault.some(f => f.includes('No Independent Website'))) {
          faultBadges = lead.websiteFault.map(f => `<span class="badge-tag badge-fault">${escapeHtml(f)}</span>`).join(' ');
        } else {
          faultBadges = `<span class="badge-tag badge-fault">No Website Listed</span>`;
        }
      } else if (lead.websiteFault && lead.websiteFault.length > 0) {
        faultBadges = lead.websiteFault.map(f => `<span class="badge-tag badge-fault">${escapeHtml(f)}</span>`).join(' ');
      } else {
        faultBadges = `<span class="badge-tag badge-success">No Critical Faults</span>`;
      }

      // 8. Last FB Post
      const lastFb = lead.lastFbPost || 'N/A';
      const lastFbHtml = lastFb.includes('❌') 
        ? `<span class="badge-tag badge-fault">${escapeHtml(lastFb)}</span>`
        : `<span class="badge-tag badge-neutral">${escapeHtml(lastFb)}</span>`;

      // 9. FB Link
      const fbVal = lead.fbLink || 'N/A';
      const fbHtml = (fbVal !== 'N/A')
        ? `<a href="${escapeHtml(fbVal)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;font-size:12px;">Facebook</a>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 10. Last IG Post
      const lastIg = lead.lastIgPost || 'N/A';
      const lastIgHtml = lastIg.includes('❌')
        ? `<span class="badge-tag badge-fault">${escapeHtml(lastIg)}</span>`
        : `<span class="badge-tag badge-neutral">${escapeHtml(lastIg)}</span>`;

      // 11. IG Link
      const igVal = lead.igLink || 'N/A';
      const igHtml = (igVal !== 'N/A')
        ? `<a href="${escapeHtml(igVal)}" target="_blank" rel="noopener noreferrer" style="color:#e066ff;font-size:12px;">Instagram</a>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 12. LinkedIn Profile
      const liVal = lead.linkedinUrl || 'N/A';
      const liHtml = (liVal !== 'N/A')
        ? `<a href="${escapeHtml(liVal)}" target="_blank" rel="noopener noreferrer" style="color:#0a66c2;font-size:12px;">LinkedIn</a>`
        : `<span class="badge-tag badge-neutral">N/A</span>`;

      // 13. Other Issues / Audit Notes
      const notesVal = lead.otherIssues || (lead.auditNotes && lead.auditNotes.join('; ')) || 'None';

      // 14. Pitch Angle
      const pitchAngleVal = lead.pitchAngle || 'Ready for outreach';

      html += `
        <tr data-lead-id="${lead.id}">
          <td class="col-num">${idx + 1}</td>
          <td class="biz-name-cell">
            <span class="btn-open-lead-modal" data-id="${lead.id}" style="cursor:pointer;color:#38bdf8;font-weight:700;display:inline-block;" title="Click contact to view details & Deep Search">${escapeHtml(lead.businessName)}</span>
            ${ratingHtml}
          </td>
          <td>${ownerHtml}</td>
          <td>${emailHtml}</td>
          <td>${phoneHtml}</td>
          <td style="font-size:12px;color:#cbd5e1;">${escapeHtml(addressVal)}</td>
          <td>${webHtml}</td>
          <td>${faultBadges}</td>
          <td>${lastFbHtml}</td>
          <td>${fbHtml}</td>
          <td>${lastIgHtml}</td>
          <td>${igHtml}</td>
          <td>${liHtml}</td>
          <td style="font-size:12px;color:#94a3b8;max-width:240px;">${escapeHtml(notesVal)}</td>
          <td class="pitch-cell">
            <strong>Angle:</strong> ${escapeHtml(pitchAngleVal)}
          </td>
          <td>
            <div class="action-btns">
              <button class="btn btn-purple btn-sm btn-action-deepsearch" data-id="${lead.id}" title="Run Google Deep Search for this contact">
                🔍 Deep Search
              </button>
              <button class="btn btn-emerald btn-sm btn-action-pitch" data-id="${lead.id}" title="View Outreach Pitch">
                🎯 Pitch
              </button>
              <button class="btn btn-danger-ghost btn-sm btn-action-delete" data-id="${lead.id}" title="Delete">
                ×
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    attachRowEventListeners();
  }

  // Render Deep Search Details & Research Audit Trail inside Modal
  function renderModalDeepSearchDetails(lead) {
    const container = document.getElementById('modal-deepsearch-details');
    if (!container) return;

    const hasWeb = lead.website && lead.website !== 'N/A';
    const hasFb = lead.fbLink && lead.fbLink !== 'N/A';
    const hasIg = lead.igLink && lead.igLink !== 'N/A';
    const hasLi = lead.linkedinUrl && lead.linkedinUrl !== 'N/A';
    const hasEmail = lead.email && lead.email !== 'N/A';
    const hasPhone = lead.phone && lead.phone !== 'N/A';
    const hasOwner = lead.ownerContact && lead.ownerContact !== 'N/A';

    container.innerHTML = `
      <div class="audit-info-item">
        <strong>🌐 Official Website:</strong>
        <p>${hasWeb ? `<a href="${escapeHtml(lead.website)}" target="_blank" style="color:#38bdf8;font-weight:600;">${escapeHtml(lead.website)}</a>${lead.websiteFoundViaDeepSearch ? ' <span class="badge-tag badge-deep-search" style="font-size:10px;margin-left:6px;">🔍 Recovered via Deep Search</span>' : ''}` : '<span style="color:#fda4af;">No Independent Website Listed</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>📘 Facebook Page / URL:</strong>
        <p>${hasFb ? `<a href="${escapeHtml(lead.fbLink)}" target="_blank" style="color:#38bdf8;font-weight:600;">${escapeHtml(lead.fbLink)}</a>` : '<span style="color:#94a3b8;">None found — Click "Run Deep Search" to research web</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>📸 Instagram Profile:</strong>
        <p>${hasIg ? `<a href="${escapeHtml(lead.igLink)}" target="_blank" style="color:#e066ff;font-weight:600;">${escapeHtml(lead.igLink)}</a>` : '<span style="color:#94a3b8;">None found — Click "Run Deep Search" to research web</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>💼 LinkedIn Profile:</strong>
        <p>${hasLi ? `<a href="${escapeHtml(lead.linkedinUrl)}" target="_blank" style="color:#0a66c2;font-weight:600;">${escapeHtml(lead.linkedinUrl)}</a>` : '<span style="color:#94a3b8;">None found</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>✉️ Direct Email:</strong>
        <p>${hasEmail ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#34d399;font-weight:600;">${escapeHtml(lead.email)}</a>` : '<span style="color:#94a3b8;">None found</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>📞 Direct Phone:</strong>
        <p>${hasPhone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:#38bdf8;font-weight:600;">${escapeHtml(lead.phone)}</a>` : '<span style="color:#94a3b8;">None listed</span>'}</p>
      </div>
      <div class="audit-info-item">
        <strong>👤 Key Person / Decision Maker:</strong>
        <p>${hasOwner ? `<span style="color:#a7f3d0;font-weight:600;">${escapeHtml(lead.ownerContact)}</span>` : '<span style="color:#94a3b8;">Not identified</span>'}</p>
      </div>
    `;

    // Render Research Audit Trail & Log
    const auditLogEl = document.getElementById('modal-deepsearch-audit-log');
    const engineBadgeEl = document.getElementById('modal-deepsearch-engine-badge');
    if (auditLogEl) {
      if (lead.researchAudit && lead.researchAudit.logs && lead.researchAudit.logs.length > 0) {
        if (engineBadgeEl) {
          engineBadgeEl.textContent = lead.researchAudit.engineUsed || 'Web Search';
        }
        let logsHtml = `<div style="margin-bottom:6px;color:#38bdf8;"><strong>🔎 Search Query:</strong> ${escapeHtml(lead.researchAudit.searchQuery || '')}</div>`;
        logsHtml += `<div style="margin-bottom:8px;color:#94a3b8;font-size:11px;">Researched at: ${new Date(lead.researchAudit.researchedAt).toLocaleString()}</div>`;
        logsHtml += `<div style="display:flex;flex-direction:column;gap:4px;">`;
        lead.researchAudit.logs.forEach(log => {
          const isSuccess = log.includes('✅') || log.includes('Discovered') || log.includes('Linked') || log.includes('🏁');
          const isWarn = log.includes('⚠️');
          const color = isSuccess ? '#34d399' : (isWarn ? '#fbbf24' : '#cbd5e1');
          logsHtml += `<div style="color:${color};">• ${escapeHtml(log)}</div>`;
        });
        logsHtml += `</div>`;
        auditLogEl.innerHTML = logsHtml;
      } else {
        if (engineBadgeEl) engineBadgeEl.textContent = 'Pending Search';
        auditLogEl.innerHTML = `<span style="color:#64748b;">No Deep Search executed yet for this contact. Click "Run Deep Search" to research Google & the web.</span>`;
      }
    }
  }

  // Run Google & Web Deep Search for a Single Lead (From table row or modal button)
  async function runDeepSearchForSingleLead(leadId, triggerButton = null) {
    const curSession = getActiveSession();
    if (!curSession) return;
    const lead = curSession.leads.find(l => l.id === leadId);
    if (!lead) return;

    const originalText = triggerButton ? triggerButton.textContent : '';
    if (triggerButton) {
      triggerButton.textContent = 'Searching Web...';
      triggerButton.disabled = true;
    }

    showToast(`Running Deep Search for ${lead.businessName}...`);

    async function applyDeepSearchResult(res) {
      if (triggerButton) {
        triggerButton.textContent = originalText;
        triggerButton.disabled = false;
      }

      if (res && res.success && res.lead) {
        const idx = curSession.leads.findIndex(l => l.id === leadId);
        let updated = sanitizeLeadWebsites(res.lead);
        if (typeof NicheClassifier !== 'undefined') {
          updated.category = NicheClassifier.classify(updated.category, updated.businessName, curSession.searchTerm);
        }
        if (idx !== -1) curSession.leads[idx] = updated;
        activeModalLead = curSession.leads[idx];
        await persistSessions();
        applyFiltersAndRender();

        if (pitchModal && pitchModal.classList.contains('active')) {
          openPitchModal(leadId);
        }

        const foundItems = [];
        if (res.foundWebsite) foundItems.push('Website');
        if (res.foundFb) foundItems.push('Facebook');
        if (res.foundIg) foundItems.push('Instagram');
        if (res.foundLinkedin) foundItems.push('LinkedIn');
        if (res.foundEmail) foundItems.push('Email');
        if (res.foundPhone) foundItems.push('Phone');
        if (res.foundOwner) foundItems.push('Decision Maker');

        if (foundItems.length > 0) {
          showToast(`🎉 Deep Search Found: ${foundItems.join(', ')} for ${lead.businessName}! Arranged into columns.`);
        } else {
          showToast(`Deep Search verified: Researched live web — no unlisted website/socials found.`);
        }
      } else {
        showToast(res && res.message ? res.message : 'Deep search completed.');
      }
    }

    // Try background worker message first; if unavailable, run direct client-side research
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          type: 'RUN_DEEP_SEARCH',
          payload: { lead, sessionId: activeSessionId }
        }, async (res) => {
          if (chrome.runtime.lastError || !res) {
            // Direct client-side research fallback
            if (typeof DeepSearch !== 'undefined') {
              const clientRes = await DeepSearch.executeLeadResearch(lead);
              await applyDeepSearchResult(clientRes);
            }
          } else {
            await applyDeepSearchResult(res);
          }
        });
      } catch (err) {
        if (typeof DeepSearch !== 'undefined') {
          const clientRes = await DeepSearch.executeLeadResearch(lead);
          await applyDeepSearchResult(clientRes);
        }
      }
    } else if (typeof DeepSearch !== 'undefined') {
      const clientRes = await DeepSearch.executeLeadResearch(lead);
      await applyDeepSearchResult(clientRes);
    }
  }

  // Row Event Listeners
  function attachRowEventListeners() {
    // 1. Pitch Button
    document.querySelectorAll('.btn-action-pitch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPitchModal(id);
      });
    });

    // 2. Open Modal via Business Name Click
    document.querySelectorAll('.btn-open-lead-modal').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPitchModal(id);
      });
    });

    // 3. Individual Deep Search Button on Row
    document.querySelectorAll('.btn-action-deepsearch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        runDeepSearchForSingleLead(id, e.currentTarget);
      });
    });

    // 4. Delete Lead Button
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const curSession = getActiveSession();
        if (!curSession) return;
        curSession.leads = curSession.leads.filter(l => l.id !== id);
        curSession.leadsCount = curSession.leads.length;
        if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
          SupabaseSync.deleteLead(id).catch(err => console.warn('Supabase lead delete error:', err));
        }
        persistSessions();
        applyFiltersAndRender();
        showToast('Lead deleted from this campaign.');
      });
    });
  }

  // BULK DEEP SEARCH
  async function runBulkDeepSearch() {
    const curSession = getActiveSession();
    if (!curSession || curSession.leads.length === 0) {
      alert('No leads in current campaign to deep search.');
      return;
    }

    if (isDeepSearchBulkRunning) return;
    isDeepSearchBulkRunning = true;

    const targets = curSession.leads.filter(l => 
      !l.website || l.website === 'N/A' || l.website.trim() === '' || 
      !l.fbLink || l.fbLink === 'N/A' || !l.email || l.email === 'N/A'
    );

    if (targets.length === 0) {
      showToast('All leads in this campaign already have websites and contact details!');
      isDeepSearchBulkRunning = false;
      return;
    }

    deepSearchBanner.classList.add('active');
    deepSearchTitle.textContent = `Deep Searching ${targets.length} leads...`;

    let recoveredCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const lead = targets[i];
      deepSearchDesc.textContent = `Searching web for lead ${i + 1}/${targets.length}: "${lead.businessName}"...`;

      try {
        let res = null;
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          res = await new Promise(resolve => {
            chrome.runtime.sendMessage({
              type: 'RUN_DEEP_SEARCH',
              payload: { lead, sessionId: activeSessionId }
            }, response => {
              if (chrome.runtime.lastError || !response) resolve(null);
              else resolve(response);
            });
          });
        }
        if (!res && typeof DeepSearch !== 'undefined') {
          res = await DeepSearch.executeLeadResearch(lead);
        }

        if (res && res.success && res.lead) {
          const idx = curSession.leads.findIndex(l => l.id === lead.id);
          let updated = sanitizeLeadWebsites(res.lead);
          if (typeof NicheClassifier !== 'undefined') {
            updated.category = NicheClassifier.classify(updated.category, updated.businessName, curSession.searchTerm);
          }
          if (idx !== -1) curSession.leads[idx] = updated;
          if (res.foundWebsite || res.foundFb || res.foundIg || res.foundEmail) recoveredCount++;
        }
      } catch (err) {
        console.error('Deep search error:', err);
      }

      await new Promise(r => setTimeout(r, 600));
    }

    await persistSessions();
    applyFiltersAndRender();

    isDeepSearchBulkRunning = false;
    deepSearchBanner.classList.remove('active');
    showToast(`🎉 Deep Search Complete! Recovered details for ${recoveredCount} contacts.`);
  }

  // Pitch / Contact Modal Opener
  function openPitchModal(leadId) {
    const curSession = getActiveSession();
    if (!curSession) return;
    const lead = curSession.leads.find(l => l.id === leadId);
    if (!lead) return;
    activeModalLead = lead;

    const kit = PitchGenerator.generateOutreachKit(lead, userSettings);

    document.getElementById('modal-biz-name').textContent = lead.businessName;
    document.getElementById('modal-biz-sub').textContent = `${lead.category || 'Local Business'} • ${lead.address || 'Local area'}`;

    // Render Deep Search Details Tab
    renderModalDeepSearchDetails(lead);

    document.getElementById('modal-email-subject').value = kit.email.subject;
    document.getElementById('modal-email-body').value = kit.email.body;
    document.getElementById('modal-call-script').textContent = kit.phoneScript;
    document.getElementById('modal-dm-script').textContent = kit.socialDm;

    const auditContainer = document.getElementById('modal-audit-details');
    auditContainer.innerHTML = `
      <div class="audit-info-item">
        <strong>Detected Website Faults:</strong>
        <p>${(lead.websiteFault && lead.websiteFault.length > 0) ? lead.websiteFault.join(' • ') : 'No critical faults detected.'}</p>
      </div>
      <div class="audit-info-item">
        <strong>Decision Maker / Arborist:</strong>
        <p>${lead.ownerContact || 'N/A'}</p>
      </div>
      <div class="audit-info-item">
        <strong>Direct Contact Info:</strong>
        <p>Email: ${lead.email || 'N/A'} | Phone: ${lead.phone || 'N/A'}</p>
      </div>
      <div class="audit-info-item">
        <strong>Online Presence & Social Links:</strong>
        <p>Website: ${lead.website || 'N/A'}${lead.websiteFoundViaDeepSearch ? ' (Recovered via Deep Search)' : ''} | Facebook: ${lead.fbLink || 'N/A'} | Instagram: ${lead.igLink || 'N/A'} | LinkedIn: ${lead.linkedinUrl || 'N/A'}</p>
      </div>
      <div class="audit-info-item">
        <strong>Tailored Value Proposition / Hook:</strong>
        <p style="color:#34d399;font-weight:600;">${kit.pitchAngle}</p>
      </div>
    `;

    pitchModal.classList.add('active');
  }

  // Helper to generate descriptive filename: prefix_niche_country_date.csv
  function generateExportFilename(prefix = 'google_contacts') {
    const cur = getActiveSession();
    const filtered = getFilteredLeads();

    // 1. Niche
    let nicheTag = 'leads';
    if (currentNicheFilter && currentNicheFilter !== 'all') {
      nicheTag = currentNicheFilter.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    } else if (cur && cur.searchTerm) {
      nicheTag = cur.searchTerm.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }

    // Optional status tag if e.g. "no-website"
    let statusTag = '';
    if (currentFilter === 'no-website') {
      statusTag = 'no_website_';
    } else if (currentFilter === 'faults') {
      statusTag = 'faults_';
    }

    // 2. Country detection
    let countryTag = 'global';
    const sampleText = (filtered.length > 0 ? filtered : (cur ? cur.leads : []))
      .map(l => `${l.address || ''} ${cur ? cur.searchTerm : ''}`)
      .join(' ')
      .toLowerCase();

    if (sampleText.includes('united kingdom') || sampleText.includes(' uk') || sampleText.includes('milton keynes') || sampleText.includes('london') || sampleText.includes('manchester') || sampleText.includes('birmingham') || sampleText.includes('scotland')) {
      countryTag = 'uk';
    } else if (sampleText.includes('united states') || sampleText.includes(' usa') || sampleText.includes('texas') || sampleText.includes(' tx') || sampleText.includes('florida') || sampleText.includes(' fl') || sampleText.includes('california') || sampleText.includes(' ca') || sampleText.includes('austin') || sampleText.includes('dallas')) {
      countryTag = 'usa';
    } else if (sampleText.includes('canada') || sampleText.includes('ontario') || sampleText.includes('toronto') || sampleText.includes('vancouver')) {
      countryTag = 'canada';
    } else if (sampleText.includes('australia') || sampleText.includes('sydney') || sampleText.includes('melbourne') || sampleText.includes('brisbane')) {
      countryTag = 'australia';
    }

    // 3. Date YYYY-MM-DD
    const dateStr = new Date().toISOString().split('T')[0];

    return `${prefix}_${statusTag}${nicheTag}_${countryTag}_${dateStr}.csv`;
  }

  // 📇 EXPORT TO GOOGLE CONTACTS CSV (Standard Google Contacts Import Format)
  function exportToGoogleContactsCsv() {
    const curSession = getActiveSession();
    if (!curSession) return;

    // Export only the currently filtered leads!
    const targetLeads = getFilteredLeads();
    if (targetLeads.length === 0) {
      alert('No leads match the current filter to export.');
      return;
    }

    const headers = [
      "Name",
      "Given Name",
      "Family Name",
      "Organization Name",
      "Organization Title",
      "E-mail 1 - Type",
      "E-mail 1 - Value",
      "Phone 1 - Type",
      "Phone 1 - Value",
      "Address 1 - Type",
      "Address 1 - Formatted",
      "Notes"
    ];

    const rows = targetLeads.map(l => {
      let givenName = '';
      let familyName = '';
      let orgTitle = 'Owner / Contact';
      let displayName = l.businessName || '';

      if (l.ownerContact && l.ownerContact !== 'N/A') {
        const cleanContact = l.ownerContact.replace(/\(.*?\)/g, '').trim();
        const parts = cleanContact.split(/\s+/);
        if (parts.length >= 2) {
          givenName = parts[0];
          familyName = parts.slice(1).join(' ');
          displayName = `${givenName} ${familyName}`;
        } else if (parts.length === 1) {
          givenName = parts[0];
          displayName = givenName;
        }

        const roleMatch = l.ownerContact.match(/\((.*?)\)/);
        if (roleMatch) {
          orgTitle = roleMatch[1];
        }
      }

      const notes = [
        l.pitchAngle ? `Pitch Angle: ${l.pitchAngle}` : '',
        l.websiteFault && l.websiteFault.length > 0 ? `Faults: ${l.websiteFault.join('; ')}` : '',
        l.website && l.website !== 'N/A' ? `Website: ${l.website}` : 'No Website',
        l.fbLink && l.fbLink !== 'N/A' ? `Facebook: ${l.fbLink}` : '',
        l.igLink && l.igLink !== 'N/A' ? `Instagram: ${l.igLink}` : '',
        l.linkedinUrl && l.linkedinUrl !== 'N/A' ? `LinkedIn: ${l.linkedinUrl}` : ''
      ].filter(Boolean).join(' | ');

      return [
        displayName,
        givenName,
        familyName,
        l.businessName || '',
        orgTitle,
        'Work',
        l.email && l.email !== 'N/A' ? l.email : '',
        'Work',
        l.phone && l.phone !== 'N/A' ? l.phone : '',
        'Work',
        l.address && l.address !== 'N/A' ? l.address : '',
        notes
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateExportFilename('google_contacts');
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${targetLeads.length} filtered contacts (${a.download})!`);
  }

  // Standard Lead Spreadsheet CSV Export
  function exportToCsv() {
    const curSession = getActiveSession();
    if (!curSession) return;

    // Export only the currently filtered leads!
    const targetLeads = getFilteredLeads();
    if (targetLeads.length === 0) {
      alert('No leads match the current filter to export.');
      return;
    }

    const headers = [
      "Business Name",
      "Owner / Contact / Arborist",
      "Email Address",
      "Phone Number",
      "Address / Location",
      "Website",
      "Website Fault?",
      "Last FB Post",
      "FB Link",
      "Last IG Post",
      "IG Link",
      "LinkedIn Profile / URL",
      "Other Issues / Audit Notes",
      "Pitch Angle"
    ];

    const rows = targetLeads.map(l => {
      const faultSummary = (l.websiteFault && l.websiteFault.length > 0)
        ? l.websiteFault.join('; ')
        : (l.website && l.website !== 'N/A' ? 'None' : 'No Website Listed');

      const notes = l.otherIssues || (l.auditNotes ? l.auditNotes.join('; ') : '');

      return [
        l.businessName || '',
        l.ownerContact || 'N/A',
        l.email || 'N/A',
        l.phone || 'N/A',
        l.address || 'N/A',
        l.website || 'N/A',
        faultSummary,
        l.lastFbPost || 'N/A',
        l.fbLink || 'N/A',
        l.lastIgPost || 'N/A',
        l.igLink || 'N/A',
        l.linkedinUrl || 'N/A',
        notes,
        l.pitchAngle || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateExportFilename('leads');
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${targetLeads.length} leads (${a.download})!`);
  }

  // 📥 IMPORT CONTACTS CSV
  function handleImportCsvFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert('CSV file appears empty or missing headers.');
          return;
        }

        // CSV line parser handling quotes
        function parseCsvLine(line) {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.replace(/^"|"$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.replace(/^"|"$/g, '').trim());
          return result;
        }

        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
        const newLeads = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i]);
          if (row.length === 0 || !row[0]) continue;

          let bizName = '';
          let owner = 'N/A';
          let email = 'N/A';
          let phone = 'N/A';
          let address = 'N/A';
          let website = 'N/A';

          headers.forEach((h, colIdx) => {
            const val = row[colIdx] || '';
            if (h.includes('business') || h.includes('organization') || h.includes('company') || (h === 'name' && !bizName)) {
              bizName = val;
            } else if (h.includes('contact') || h.includes('given name') || h.includes('owner') || h.includes('arborist')) {
              if (val) owner = val;
            } else if (h.includes('email') || h.includes('e-mail')) {
              if (val) email = val;
            } else if (h.includes('phone') || h.includes('tel') || h.includes('mobile')) {
              if (val) phone = val;
            } else if (h.includes('address') || h.includes('location') || h.includes('city')) {
              if (val) address = val;
            } else if (h.includes('website') || h.includes('url')) {
              if (val) website = val;
            }
          });

          if (!bizName && row[0]) bizName = row[0];

          if (bizName) {
            let lead = {
              id: 'imp_' + Date.now() + '_' + i,
              businessName: bizName,
              ownerContact: owner,
              email: email,
              phone: phone,
              address: address,
              website: website,
              websiteFault: website === 'N/A' ? ['❌ No Website Listed'] : [],
              lastFbPost: 'Pending Check',
              fbLink: 'N/A',
              lastIgPost: 'Pending Check',
              igLink: 'N/A',
              linkedinUrl: 'N/A',
              otherIssues: 'Imported Contact',
              auditNotes: ['Imported via CSV'],
              rating: 'N/A',
              reviewsCount: 0,
              category: 'Local Service',
              scrapedAt: new Date().toISOString()
            };

            lead = sanitizeLeadWebsites(lead);
            if (typeof PitchGenerator !== 'undefined') {
              lead.pitchAngle = PitchGenerator.generatePitchAngle(lead);
              lead.outreachKit = PitchGenerator.generateOutreachKit(lead, userSettings);
            }
            newLeads.push(lead);
          }
        }

        if (newLeads.length > 0) {
          let curSession = getActiveSession();
          if (!curSession) {
            curSession = {
              id: 'session_' + Date.now(),
              searchTerm: file.name.replace(/\.[^/.]+$/, ''),
              createdAt: new Date().toISOString(),
              leadsCount: newLeads.length,
              faultsCount: 0,
              leads: []
            };
            sessions.unshift(curSession);
            activeSessionId = curSession.id;
          }

          curSession.leads.push(...newLeads);
          curSession.leadsCount = curSession.leads.length;
          persistSessions();
          applyFiltersAndRender();
          showToast(`Imported ${newLeads.length} contacts successfully!`);
        } else {
          alert('Could not find valid business contacts in this CSV.');
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Copy Table to Clipboard (TSV for Google Sheets paste)
  function copyTableToClipboard() {
    const curSession = getActiveSession();
    if (!curSession) return;

    const targetLeads = getFilteredLeads();
    if (targetLeads.length === 0) {
      showToast('No filtered leads to copy.');
      return;
    }

    const headers = [
      "Business Name\tOwner / Contact / Arborist\tEmail Address\tPhone Number\tAddress / Location\tWebsite\tWebsite Fault?\tLast FB Post\tFB Link\tLast IG Post\tIG Link\tLinkedIn Profile / URL\tOther Issues / Audit Notes\tPitch Angle"
    ];
    const rows = targetLeads.map(l => [
      l.businessName || '',
      l.ownerContact || 'N/A',
      l.email || 'N/A',
      l.phone || 'N/A',
      l.address || 'N/A',
      l.website || 'N/A',
      (l.websiteFault ? l.websiteFault.join('; ') : 'None'),
      l.lastFbPost || 'N/A',
      l.fbLink || 'N/A',
      l.lastIgPost || 'N/A',
      l.igLink || 'N/A',
      l.linkedinUrl || 'N/A',
      l.otherIssues || '',
      l.pitchAngle || ''
    ].join('\t'));

    const fullTsv = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(fullTsv).then(() => {
      showToast(`Copied ${targetLeads.length} filtered rows to clipboard!`);
    });
  }

  // Launch Google Maps Search
  function launchGoogleMaps() {
    const q = (mapsSearchInput && mapsSearchInput.value) ? mapsSearchInput.value.trim() : 'Milton Keynes tree cutter';
    const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
    window.open(url, '_blank');
  }

  // HTML Escape Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Setup Event Listeners
  function setupEvents() {
    // 1. Session Selector Switcher
    if (sessionSelect) {
      sessionSelect.addEventListener('change', (e) => {
        activeSessionId = e.target.value;
        currentNicheFilter = 'all';
        persistSessions();
        updateNicheFilterDropdown();
        applyFiltersAndRender();
        showToast('Switched campaign.');
      });
    }

    // 2. Clear This Campaign
    const btnClearCurr = document.getElementById('btn-clear-current-session');
    if (btnClearCurr) {
      btnClearCurr.addEventListener('click', async () => {
        const cur = getActiveSession();
        if (!cur) return;
        if (confirm(`Clear all leads in "${cur.searchTerm}"? All leads will be permanently removed from storage.`)) {
          cur.leads = [];
          cur.leadsCount = 0;
          cur.faultsCount = 0;
          await persistSessions();
          if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
            SupabaseSync.syncSession(cur).catch(err => console.warn('Supabase clear session error:', err));
          }
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'CLEAR_CURRENT_SESSION_LEADS', payload: { sessionId: cur.id } });
          }
          updateNicheFilterDropdown();
          applyFiltersAndRender();
          showToast('Campaign leads cleared from storage.');
        }
      });
    }

    // 3. Delete Campaign from History
    const btnDelSess = document.getElementById('btn-delete-session');
    if (btnDelSess) {
      btnDelSess.addEventListener('click', async () => {
        const cur = getActiveSession();
        if (!cur) return;
        if (confirm(`Delete campaign "${cur.searchTerm}" from history?`)) {
          const doomedId = activeSessionId;
          sessions = sessions.filter(s => s.id !== doomedId);
          activeSessionId = sessions[0] ? sessions[0].id : null;
          await persistSessions();
          if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
            SupabaseSync.deleteSession(doomedId).catch(err => console.warn('Supabase delete session error:', err));
          }
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'DELETE_SESSION', payload: { sessionId: doomedId } });
          }
          updateNicheFilterDropdown();
          applyFiltersAndRender();
          showToast('Campaign deleted.');
        }
      });
    }

    // 4. Wipe All History & Permanent Storage
    const btnClearAll = document.getElementById('btn-clear-all');
    if (btnClearAll) {
      btnClearAll.addEventListener('click', async () => {
        if (confirm('Permanently wipe all search history and leads? All campaigns will be erased from storage.')) {
          sessions = [];
          activeSessionId = null;
          if (typeof SupabaseSync !== 'undefined' && SupabaseSync.isConfigured()) {
            SupabaseSync.clearAllData().catch(err => console.warn('Supabase clear all data error:', err));
          }
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ sessions: [], activeSessionId: null, leads: [], hasInitializedSessions: true });
            await chrome.storage.local.remove(['leads']);
          }
          localStorage.removeItem('zenscrapper_sessions');
          localStorage.removeItem('zenscrapper_leads');
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'CLEAR_ALL_HISTORY' });
          }
          renderSessionSelector();
          updateNicheFilterDropdown();
          applyFiltersAndRender();
          showToast('All search history and leads permanently wiped.');
        }
      });
    }

    // 5. Deep Search All (Bulk - Optional)
    const btnDeepAll = document.getElementById('btn-deep-search-all');
    if (btnDeepAll) {
      btnDeepAll.addEventListener('click', runBulkDeepSearch);
    }

    // 6. Niche Filter Dropdown
    if (filterNicheSelect) {
      filterNicheSelect.addEventListener('change', (e) => {
        currentNicheFilter = e.target.value;
        applyFiltersAndRender();
      });
    }

    // 7. Filter Keyword
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value;
        applyFiltersAndRender();
      });
    }

    // 8. Filter Pills
    document.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentFilter = e.currentTarget.getAttribute('data-filter');
        applyFiltersAndRender();
      });
    });

    // 9. Extended Search Input (Press Enter to open Maps)
    const gmapsInput = document.getElementById('gmaps-search-input');
    if (gmapsInput) {
      gmapsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          launchGoogleMaps();
        }
      });
    }

    const btnLaunchMaps = document.getElementById('btn-launch-maps');
    if (btnLaunchMaps) {
      btnLaunchMaps.addEventListener('click', launchGoogleMaps);
    }
    const btnEmptyMaps = document.getElementById('btn-empty-maps');
    if (btnEmptyMaps) {
      btnEmptyMaps.addEventListener('click', launchGoogleMaps);
    }

    // 10. Export & Import Buttons
    document.getElementById('btn-export-gcontacts').addEventListener('click', exportToGoogleContactsCsv);
    document.getElementById('btn-export-csv').addEventListener('click', exportToCsv);
    document.getElementById('btn-copy-clipboard').addEventListener('click', copyTableToClipboard);

    document.getElementById('btn-import-csv-trigger').addEventListener('click', () => {
      fileImportInput.click();
    });
    fileImportInput.addEventListener('change', handleImportCsvFile);

    // 10. Modal Controls
    document.getElementById('btn-close-modal').addEventListener('click', () => pitchModal.classList.remove('active'));
    document.getElementById('btn-modal-done').addEventListener('click', () => pitchModal.classList.remove('active'));

    const btnModalDeepSearch = document.getElementById('btn-modal-deepsearch');
    if (btnModalDeepSearch) {
      btnModalDeepSearch.addEventListener('click', () => {
        if (activeModalLead) {
          runDeepSearchForSingleLead(activeModalLead.id, btnModalDeepSearch);
        }
      });
    }

    const btnTabDeepSearch = document.getElementById('btn-tab-deepsearch-action');
    if (btnTabDeepSearch) {
      btnTabDeepSearch.addEventListener('click', () => {
        if (activeModalLead) {
          runDeepSearchForSingleLead(activeModalLead.id, btnTabDeepSearch);
        }
      });
    }

    document.querySelectorAll('.modal-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const tabId = e.currentTarget.getAttribute('data-tab');
        document.getElementById(`pane-${tabId}`).classList.add('active');
      });
    });

    document.getElementById('btn-copy-subject').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('modal-email-subject').value);
      showToast('Subject copied!');
    });
    document.getElementById('btn-copy-email-body').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('modal-email-body').value);
      showToast('Email body copied!');
    });
    document.getElementById('btn-copy-call-script').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('modal-call-script').textContent);
      showToast('Call script copied!');
    });
    document.getElementById('btn-copy-dm-script').addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('modal-dm-script').textContent);
      showToast('Social DM copied!');
    });

    // 11. Settings Modal & Cloud Sync
    function populateSettingsInputs() {
      document.getElementById('setting-sender-name').value = userSettings.senderName || 'Iqam Ifthikar';
      document.getElementById('setting-agency-name').value = userSettings.agencyName || 'Zenthoz Digital Marketing';
      document.getElementById('setting-agency-website').value = userSettings.agencyWebsite || 'www.zenthoz.com';
      document.getElementById('setting-sender-phone').value = userSettings.senderPhone || '+1 307 301 2270';
      document.getElementById('setting-service-type').value = userSettings.serviceType || 'High-Converting Web Design, SEO & Lead Generation';
      document.getElementById('setting-show-total-leads').checked = Boolean(userSettings.showTotalLeads);
    }

    document.getElementById('btn-settings-modal').addEventListener('click', () => {
      populateSettingsInputs();
      settingsModal.classList.add('active');
    });

    document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('active'));

    // Save Settings (Local storage)
    document.getElementById('btn-save-settings').addEventListener('click', async () => {
      userSettings.senderName = document.getElementById('setting-sender-name').value.trim() || 'Iqam Ifthikar';
      userSettings.agencyName = document.getElementById('setting-agency-name').value.trim() || 'Zenthoz Digital Marketing';
      userSettings.agencyWebsite = document.getElementById('setting-agency-website').value.trim() || 'www.zenthoz.com';
      userSettings.senderPhone = document.getElementById('setting-sender-phone').value.trim() || '+1 307 301 2270';
      userSettings.serviceType = document.getElementById('setting-service-type').value.trim() || 'High-Converting Web Design, SEO & Lead Generation';
      userSettings.showTotalLeads = document.getElementById('setting-show-total-leads').checked;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ settings: userSettings });
      }
      localStorage.setItem('zenscrapper_settings', JSON.stringify(userSettings));

      // Re-generate pitch kits across all sessions
      sessions.forEach(sess => {
        sess.leads = sess.leads.map(l => {
          l.outreachKit = PitchGenerator.generateOutreachKit(l, userSettings);
          return l;
        });
      });
      await persistSessions();
      updateMetrics();

      settingsModal.classList.remove('active');
      showToast('Settings saved!');
    });
  }

  // 12. TARGET SEARCH DIRECTORY (Niches & Location Areas)
  function initDirectoryModal() {
    const dirModal = document.getElementById('directory-modal');
    const btnOpenDir = document.getElementById('btn-open-directory');
    const btnCloseDir = document.getElementById('btn-close-directory');
    const btnDoneDir = document.getElementById('btn-done-directory');

    if (!dirModal || typeof LeadDirectory === 'undefined') return;

    // Open & Close Modal
    if (btnOpenDir) {
      btnOpenDir.addEventListener('click', () => {
        populateBuilderDropdowns();
        renderLocationsTree();
        renderNichesCards();
        dirModal.classList.add('active');
      });
    }
    if (btnCloseDir) {
      btnCloseDir.addEventListener('click', () => dirModal.classList.remove('active'));
    }
    if (btnDoneDir) {
      btnDoneDir.addEventListener('click', () => dirModal.classList.remove('active'));
    }

    // Directory Tab Switching
    document.querySelectorAll('[data-dir-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-dir-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dir-tab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetId = e.currentTarget.getAttribute('data-dir-tab');
        const pane = document.getElementById(`dir-pane-${targetId}`);
        if (pane) pane.classList.add('active');
      });
    });

    // Builder Dropdown Elements
    const countrySel = document.getElementById('builder-country');
    const stateSel = document.getElementById('builder-state');
    const areaSel = document.getElementById('builder-area');
    const catSel = document.getElementById('builder-category');
    const nicheSel = document.getElementById('builder-niche');
    const queryText = document.getElementById('builder-query-text');
    const nicheNote = document.getElementById('builder-niche-note');

    function populateBuilderDropdowns() {
      if (!countrySel) return;
      const countries = LeadDirectory.getCountries();
      countrySel.innerHTML = countries.map(c => `<option value="${escapeHtml(c.country)}">${c.flag} ${escapeHtml(c.country)}</option>`).join('');
      
      catSel.innerHTML = LeadDirectory.categories.map(c => `<option value="${escapeHtml(c.name)}">${c.icon} ${escapeHtml(c.name)}</option>`).join('');

      updateStates();
      updateNiches();
    }

    function updateStates() {
      const selectedCountry = countrySel.value;
      const states = LeadDirectory.getStates(selectedCountry);
      stateSel.innerHTML = states.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
      updateAreas();
    }

    function updateAreas() {
      const selectedCountry = countrySel.value;
      const selectedState = stateSel.value;
      const areas = LeadDirectory.getAreas(selectedCountry, selectedState);
      areaSel.innerHTML = areas.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
      updateQueryPreview();
    }

    function updateNiches() {
      const selectedCatName = catSel.value;
      const cat = LeadDirectory.categories.find(c => c.name === selectedCatName) || LeadDirectory.categories[0];
      nicheSel.innerHTML = cat.niches.map(n => `<option value="${escapeHtml(n.keyword)}" data-note="${escapeHtml(n.note || '')}">${escapeHtml(n.name)}</option>`).join('');
      updateQueryPreview();
    }

    function updateQueryPreview() {
      const country = countrySel ? countrySel.value : '';
      const state = stateSel ? stateSel.value : '';
      const area = areaSel ? areaSel.value : '';
      const nicheKeyword = nicheSel ? nicheSel.value : '';
      const opt = nicheSel && nicheSel.options ? nicheSel.options[nicheSel.selectedIndex] : null;
      const note = opt ? opt.getAttribute('data-note') : 'Profitable Niche';

      const query = LeadDirectory.buildSearchQuery(area, state, country, nicheKeyword);
      if (queryText) queryText.textContent = query;
      if (nicheNote) nicheNote.textContent = note || 'Profitable Niche';
      return query;
    }

    if (countrySel) countrySel.addEventListener('change', updateStates);
    if (stateSel) stateSel.addEventListener('change', updateAreas);
    if (areaSel) areaSel.addEventListener('change', updateQueryPreview);
    if (catSel) catSel.addEventListener('change', updateNiches);
    if (nicheSel) nicheSel.addEventListener('change', updateQueryPreview);

    // Builder Action Buttons
    const btnCopyQuery = document.getElementById('btn-copy-builder-query');
    if (btnCopyQuery) {
      btnCopyQuery.addEventListener('click', () => {
        const query = updateQueryPreview();
        navigator.clipboard.writeText(query);
        showToast(`📋 Copied search term: "${query}"`);
      });
    }

    const btnApplyQuery = document.getElementById('btn-apply-builder-query');
    if (btnApplyQuery) {
      btnApplyQuery.addEventListener('click', () => {
        const query = updateQueryPreview();
        const mainInput = document.getElementById('gmaps-search-input');
        if (mainInput) mainInput.value = query;
        dirModal.classList.remove('active');
        showToast(`Loaded "${query}" into Google Maps search box!`);
      });
    }

    const btnLaunchMaps = document.getElementById('btn-launch-builder-maps');
    if (btnLaunchMaps) {
      btnLaunchMaps.addEventListener('click', () => {
        const query = updateQueryPreview();
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        window.open(url, '_blank');
      });
    }

    // TAB 2: Locations Tree & Real-time Filter
    const locationsContainer = document.getElementById('locations-tree-container');
    const filterLocInput = document.getElementById('filter-locations');

    function renderLocationsTree(filterText = '') {
      if (!locationsContainer) return;
      const query = (filterText || '').toLowerCase().trim();
      const countries = LeadDirectory.getCountries();

      let html = '';
      countries.forEach(country => {
        const matchingStates = country.states.filter(st => {
          if (!query) return true;
          if (country.country.toLowerCase().includes(query)) return true;
          if (st.name.toLowerCase().includes(query)) return true;
          return st.areas.some(a => a.toLowerCase().includes(query));
        });

        if (matchingStates.length === 0) return;

        html += `
          <div class="location-country-card">
            <div class="location-country-header">
              <div class="country-flag-name">
                <span style="font-size:20px;">${country.flag}</span>
                <strong>${escapeHtml(country.country)}</strong>
              </div>
              <span style="font-size:11px;color:#94a3b8;">${matchingStates.length} states/regions</span>
            </div>
            ${matchingStates.map(st => {
              const matchingAreas = st.areas.filter(a => !query || a.toLowerCase().includes(query) || st.name.toLowerCase().includes(query) || country.country.toLowerCase().includes(query));
              return `
                <div class="location-state-block">
                  <div class="state-title">${escapeHtml(st.name)}</div>
                  <div class="areas-pill-wrap">
                    ${matchingAreas.map(area => `
                      <span class="area-chip" data-country="${escapeHtml(country.country)}" data-state="${escapeHtml(st.name)}" data-area="${escapeHtml(area)}" title="Click to set ${area}, ${st.name} in query builder">
                        ${escapeHtml(area)}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      });

      if (!html) {
        html = '<div style="padding:20px;text-align:center;color:#94a3b8;">No matching locations found.</div>';
      }

      locationsContainer.innerHTML = html;

      // Clicking an area chip loads it into the Query Builder tab
      locationsContainer.querySelectorAll('.area-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          const c = e.currentTarget.getAttribute('data-country');
          const s = e.currentTarget.getAttribute('data-state');
          const a = e.currentTarget.getAttribute('data-area');

          if (countrySel) {
            countrySel.value = c;
            updateStates();
          }
          if (stateSel) {
            stateSel.value = s;
            updateAreas();
          }
          if (areaSel) {
            areaSel.value = a;
            updateQueryPreview();
          }

          // Switch to builder tab
          document.querySelectorAll('[data-dir-tab]').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.dir-tab-pane').forEach(p => p.classList.remove('active'));
          const builderTabBtn = document.querySelector('[data-dir-tab="builder"]');
          const builderPane = document.getElementById('dir-pane-builder');
          if (builderTabBtn) builderTabBtn.classList.add('active');
          if (builderPane) builderPane.classList.add('active');

          showToast(`Selected ${a}, ${s} in Query Generator!`);
        });
      });
    }

    if (filterLocInput) {
      filterLocInput.addEventListener('input', (e) => {
        renderLocationsTree(e.target.value);
      });
    }

    // Custom Location Form (For adding more countries in the future)
    const customForm = document.getElementById('custom-location-form');
    const btnToggleAdd = document.getElementById('btn-toggle-add-location');
    const btnSaveCustom = document.getElementById('btn-save-custom-location');

    if (btnToggleAdd && customForm) {
      btnToggleAdd.addEventListener('click', () => {
        customForm.style.display = customForm.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (btnSaveCustom) {
      btnSaveCustom.addEventListener('click', () => {
        const c = document.getElementById('custom-country').value.trim();
        const f = document.getElementById('custom-flag').value.trim() || '🌐';
        const s = document.getElementById('custom-state').value.trim();
        const a = document.getElementById('custom-area').value.trim();

        if (!c || !s || !a) {
          alert('Please fill out Country, State/Region, and City/Area.');
          return;
        }

        LeadDirectory.addCustomLocation(c, f, s, a);

        // Persist to storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['customLocations'], (data) => {
            const customLocations = data.customLocations || [];
            customLocations.push({ country: c, flag: f, state: s, area: a });
            chrome.storage.local.set({ customLocations });
          });
        }

        populateBuilderDropdowns();
        renderLocationsTree(filterLocInput ? filterLocInput.value : '');
        customForm.style.display = 'none';
        showToast(`Saved ${a}, ${s} (${c}) to directory!`);
      });
    }

    // TAB 3: Niches Grid & Real-time Filter
    const nichesContainer = document.getElementById('niches-cards-container');
    const filterNichesInput = document.getElementById('filter-niches');

    function renderNichesCards(filterText = '') {
      if (!nichesContainer) return;
      const query = (filterText || '').toLowerCase().trim();

      let html = '';
      LeadDirectory.categories.forEach(cat => {
        const matchingNiches = cat.niches.filter(n => {
          if (!query) return true;
          if (cat.name.toLowerCase().includes(query)) return true;
          if (n.name.toLowerCase().includes(query)) return true;
          if (n.keyword.toLowerCase().includes(query)) return true;
          if (n.note && n.note.toLowerCase().includes(query)) return true;
          return false;
        });

        if (matchingNiches.length === 0) return;

        html += `
          <div class="niche-category-card">
            <div class="niche-cat-header">
              <span class="niche-cat-icon">${cat.icon}</span>
              <span class="niche-cat-title">${escapeHtml(cat.name)}</span>
            </div>
            <div class="niche-cat-desc">${escapeHtml(cat.description)}</div>
            <div class="niche-list">
              ${matchingNiches.map(n => `
                <div class="niche-row">
                  <div class="niche-name-wrap">
                    <span class="niche-name">${escapeHtml(n.name)}</span>
                    <span class="niche-note">${escapeHtml(n.note || '')}</span>
                  </div>
                  <button class="niche-copy-btn" data-keyword="${escapeHtml(n.keyword)}" data-cat="${escapeHtml(cat.name)}" title="Copy search keyword">
                    📋 Copy
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });

      if (!html) {
        html = '<div style="padding:20px;text-align:center;color:#94a3b8;grid-column:1/-1;">No matching niches found.</div>';
      }

      nichesContainer.innerHTML = html;

      // Clicking niche copy
      nichesContainer.querySelectorAll('.niche-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const kw = e.currentTarget.getAttribute('data-keyword');
          const cat = e.currentTarget.getAttribute('data-cat');
          navigator.clipboard.writeText(kw);
          showToast(`📋 Copied niche keyword: "${kw}"`);

          // Update query builder
          if (catSel) catSel.value = cat;
          updateNiches();
          if (nicheSel) nicheSel.value = kw;
          updateQueryPreview();
        });
      });
    }

    if (filterNichesInput) {
      filterNichesInput.addEventListener('input', (e) => {
        renderNichesCards(e.target.value);
      });
    }

    // Initial population
    populateBuilderDropdowns();
    renderLocationsTree();
    renderNichesCards();
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    initDirectoryModal();
    loadData();
  });
})();

