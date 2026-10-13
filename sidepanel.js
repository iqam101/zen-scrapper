/**
 * LeadPitcher AI - Chrome Side Panel Script
 */

(function () {
  let leads = [];

  const listEl = document.getElementById('sp-leads-list');
  const totalEl = document.getElementById('sp-total');
  const faultsEl = document.getElementById('sp-faults');
  const emailsEl = document.getElementById('sp-emails');
  const searchInput = document.getElementById('sp-search');

  function render() {
    const q = searchInput.value.toLowerCase().trim();
    const filtered = leads.filter(l => 
      !q || 
      (l.businessName && l.businessName.toLowerCase().includes(q)) ||
      (l.ownerContact && l.ownerContact.toLowerCase().includes(q)) ||
      (l.pitchAngle && l.pitchAngle.toLowerCase().includes(q))
    );

    totalEl.textContent = leads.length;
    faultsEl.textContent = leads.filter(l => (!l.website || l.website === 'N/A') || (l.websiteFault && l.websiteFault.length > 0)).length;
    emailsEl.textContent = leads.filter(l => l.email && l.email !== 'N/A').length;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;padding:20px;color:#64748b;">No leads found. Scrape Google Maps on the left!</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(l => `
      <div class="sp-card">
        <div class="sp-card-title">${l.businessName}</div>
        <div class="sp-card-sub">${l.ownerContact !== 'N/A' ? '👤 ' + l.ownerContact : ''} ${l.rating !== 'N/A' ? '⭐ ' + l.rating : ''}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${l.website === 'N/A' ? '<span class="sp-badge sp-badge-fault">No Website</span>' : ''}
          ${(l.websiteFault && l.websiteFault.length > 0) ? `<span class="sp-badge sp-badge-fault">${l.websiteFault[0]}</span>` : ''}
          ${l.email !== 'N/A' ? `<span class="sp-badge" style="background:#0284c7;color:white;">${l.email}</span>` : ''}
          ${l.phone !== 'N/A' ? `<span class="sp-badge" style="background:#334155;color:#e2e8f0;">${l.phone}</span>` : ''}
        </div>
        <div class="sp-card-pitch">
          <strong>Pitch:</strong> ${l.pitchAngle ? l.pitchAngle.slice(0, 110) + '...' : 'Outreach ready'}
        </div>
        <div class="sp-card-actions">
          <button class="sp-btn-sm btn-copy-pitch" data-pitch="${encodeURIComponent(l.pitchAngle || '')}">Copy Pitch</button>
          ${l.phone !== 'N/A' ? `<button class="sp-btn-sm btn-copy-phone" data-phone="${l.phone}">Copy Phone</button>` : ''}
          ${l.email !== 'N/A' ? `<button class="sp-btn-sm btn-copy-email" data-email="${l.email}">Copy Email</button>` : ''}
        </div>
      </div>
    `).join('');

    // Attach copy events
    listEl.querySelectorAll('.btn-copy-pitch').forEach(b => {
      b.addEventListener('click', (e) => {
        navigator.clipboard.writeText(decodeURIComponent(e.target.dataset.pitch));
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = 'Copy Pitch', 1500);
      });
    });

    listEl.querySelectorAll('.btn-copy-phone').forEach(b => {
      b.addEventListener('click', (e) => {
        navigator.clipboard.writeText(e.target.dataset.phone);
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = 'Copy Phone', 1500);
      });
    });

    listEl.querySelectorAll('.btn-copy-email').forEach(b => {
      b.addEventListener('click', (e) => {
        navigator.clipboard.writeText(e.target.dataset.email);
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = 'Copy Email', 1500);
      });
    });
  }

  function load() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['sessions', 'activeSessionId', 'leads'], (data) => {
        if (data.sessions && data.sessions.length > 0) {
          const active = data.sessions.find(s => s.id === data.activeSessionId) || data.sessions[0];
          leads = active.leads || [];
        } else {
          leads = data.leads || [];
        }
        render();
      });
    } else if (typeof MOCK_MILTON_KEYNES_LEADS !== 'undefined') {
      leads = MOCK_MILTON_KEYNES_LEADS;
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    searchInput.addEventListener('input', render);

    document.getElementById('sp-btn-full').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });

    document.getElementById('sp-btn-dash').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });

    document.getElementById('sp-btn-export').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });

    // Storage change listener for live syncing
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.leads) {
          leads = changes.leads.newValue || [];
          render();
        }
      });
    }
  });
})();
