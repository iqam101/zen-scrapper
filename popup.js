/**
 * LeadPitcher AI - Extension Toolbar Popup Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const totalEl = document.getElementById('pop-total');
  const faultsEl = document.getElementById('pop-faults');
  const emailsEl = document.getElementById('pop-emails');
  const searchInput = document.getElementById('pop-search-input');

  // Load count from active session or all sessions
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['sessions', 'activeSessionId', 'leads'], (data) => {
      let leads = [];
      if (data.sessions && data.sessions.length > 0) {
        const active = data.sessions.find(s => s.id === data.activeSessionId) || data.sessions[0];
        leads = active.leads || [];
      } else if (data.leads) {
        leads = data.leads;
      }
      totalEl.textContent = leads.length;
      faultsEl.textContent = leads.filter(l => (!l.website || l.website === 'N/A') || (l.websiteFault && l.websiteFault.length > 0)).length;
      emailsEl.textContent = leads.filter(l => l.email && l.email !== 'N/A').length;
    });
  }

  // Search button
  document.getElementById('pop-btn-search').addEventListener('click', () => {
    const q = searchInput.value.trim() || 'Milton Keynes tree cutter';
    chrome.tabs.create({ url: `https://www.google.com/maps/search/${encodeURIComponent(q)}` });
  });

  // Open Local Dashboard
  document.getElementById('pop-btn-dash').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  // Open Side Panel
  document.getElementById('pop-btn-sidepanel').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  });
});
