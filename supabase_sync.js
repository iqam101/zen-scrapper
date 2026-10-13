/**
 * Zen Scrapper - Supabase Live Database & Team Authentication Client
 * Agency: Zenthoz Digital Marketing (www.zenthoz.com)
 * Author: Iqam Ifthikar
 *
 * Provides real-time bidirectional synchronization between Zen Scrapper
 * (Chrome Extension and Live Vercel Web Dashboard) and Supabase PostgreSQL.
 * Also handles Team Sign-In and Role-Based Access Control (Admin vs Staff).
 * Lightweight, zero external dependencies, uses standard native fetch().
 */

const SupabaseSync = {
  config: {
    url: 'https://yvyzaxvslbtilcaalwdw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eXpheHZzbGJ0aWxjYWFsd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODkyNzUsImV4cCI6MjEwNzQ2NTI3NX0.CZvbtsEhh68h-xAqEE2TgYMuKMtJYv3OTPFRVmJRp-I'
  },
  authSession: null,
  currentUser: null,
  currentRole: null, // 'admin' | 'staff'

  /**
   * Initialize or update credentials
   */
  init(url = '', anonKey = '') {
    this.config.url = (url || '').trim().replace(/\/+$/, '');
    this.config.anonKey = (anonKey || '').trim();
  },

  /**
   * Check if credentials are set
   */
  isConfigured() {
    return Boolean(
      this.config.url && 
      this.config.url.startsWith('https://') && 
      this.config.anonKey && 
      this.config.anonKey.length > 20
    );
  },

  /**
   * Headers for PostgREST requests
   */
  getHeaders(extra = {}) {
    const token = this.authSession?.access_token || this.config.anonKey;
    return {
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extra
    };
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(email, password) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Supabase configuration is missing.' };
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const res = await fetch(`${this.config.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.config.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });

      const data = await res.json();
      if (!res.ok) {
        let errMsg = data.error_description || data.msg || data.message || 'Login failed';
        if (data.error_code === 'email_not_confirmed') {
          errMsg = 'Email not confirmed yet. Please execute supabase_schema.sql in Supabase SQL editor to auto-confirm accounts, or click the email confirmation link.';
        } else if (data.error === 'invalid_grant' || errMsg.includes('Invalid login credentials')) {
          errMsg = 'Invalid email or password. Please verify your credentials.';
        }
        return { success: false, error: errMsg };
      }

      this.authSession = data;
      this.currentUser = data.user;

      // Determine Role
      let role = 'staff';
      if (cleanEmail === 'zenthoztechnologies@gmail.com') {
        role = 'admin';
      } else {
        try {
          const memberRes = await fetch(`${this.config.url}/rest/v1/team_members?email=eq.${encodeURIComponent(cleanEmail)}&select=role&limit=1`, {
            method: 'GET',
            headers: this.getHeaders()
          });
          if (memberRes.ok) {
            const members = await memberRes.json();
            if (members && members[0] && members[0].role) {
              role = members[0].role;
            }
          }
        } catch (e) {
          console.warn('Role fetch warning:', e);
        }
      }

      this.currentRole = role;
      await this.persistAuth();
      return { success: true, user: this.currentUser, role: this.currentRole };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during sign in' };
    }
  },

  /**
   * Sign Out
   */
  async signOut() {
    this.authSession = null;
    this.currentUser = null;
    this.currentRole = null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(['zenscrapper_auth']);
    }
    localStorage.removeItem('zenscrapper_auth');
    return { success: true };
  },

  /**
   * Save Auth Session to Storage
   */
  async persistAuth() {
    const payload = {
      authSession: this.authSession,
      currentUser: this.currentUser,
      currentRole: this.currentRole
    };
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ zenscrapper_auth: payload });
    }
    localStorage.setItem('zenscrapper_auth', JSON.stringify(payload));
  },

  /**
   * Restore Auth Session on App Load
   */
  async restoreAuth() {
    let saved = null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await new Promise(r => chrome.storage.local.get(['zenscrapper_auth'], r));
      if (res && res.zenscrapper_auth) saved = res.zenscrapper_auth;
    }
    if (!saved) {
      const local = localStorage.getItem('zenscrapper_auth');
      if (local) {
        try { saved = JSON.parse(local); } catch (e) {}
      }
    }
    if (saved && saved.authSession && saved.currentUser) {
      this.authSession = saved.authSession;
      this.currentUser = saved.currentUser;
      const email = (saved.currentUser.email || '').toLowerCase();
      this.currentRole = saved.currentRole || (email === 'zenthoztechnologies@gmail.com' ? 'admin' : 'staff');
      return { isAuthenticated: true, user: this.currentUser, role: this.currentRole };
    }
    return { isAuthenticated: false, user: null, role: null };
  },

  /**
   * Check if User is Authenticated
   */
  isAuthenticated() {
    return Boolean(this.currentUser && this.authSession);
  },

  /**
   * Check if User is Admin
   */
  isAdmin() {
    if (!this.currentUser) return false;
    const email = (this.currentUser.email || '').toLowerCase();
    return this.currentRole === 'admin' || email === 'zenthoztechnologies@gmail.com';
  },

  /**
   * Create New Team User (Admin Only)
   */
  async createTeamUser(email, password, role = 'staff', name = '') {
    if (!this.isAdmin()) {
      return { success: false, error: 'Only administrators can create new team users.' };
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // 1. Create user in Supabase Auth
      const res = await fetch(`${this.config.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.config.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPass,
          data: { name: name || cleanEmail.split('@')[0], role }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.msg || data.message || 'Failed to create user in Auth' };
      }

      const userId = data.id || ('user_' + Date.now());

      // 2. Insert into team_members table
      const memberPayload = [{
        id: String(userId),
        email: cleanEmail,
        role: role === 'admin' ? 'admin' : 'staff',
        name: name || cleanEmail.split('@')[0],
        created_by: this.currentUser?.email || 'admin'
      }];

      await fetch(`${this.config.url}/rest/v1/team_members?on_conflict=email`, {
        method: 'POST',
        headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
        body: JSON.stringify(memberPayload)
      });

      return {
        success: true,
        message: `Successfully created ${role.toUpperCase()} user for ${cleanEmail}!`,
        user: data
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch All Team Members (Admin Only)
   */
  async fetchTeamMembers() {
    try {
      const res = await fetch(`${this.config.url}/rest/v1/team_members?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) {
        return {
          success: true,
          members: [{ id: 'admin_primary', email: 'zenthoztechnologies@gmail.com', role: 'admin', name: 'Iqam Ifthikar (Admin)' }]
        };
      }
      const members = await res.json();
      return { success: true, members };
    } catch (err) {
      return { success: false, error: err.message, members: [] };
    }
  },

  /**
   * Delete Team Member (Admin Only)
   */
  async deleteTeamMember(memberEmail) {
    if (!this.isAdmin()) return { success: false, error: 'Unauthorized' };
    if (memberEmail.toLowerCase() === 'zenthoztechnologies@gmail.com') {
      return { success: false, error: 'Primary Administrator account cannot be deleted.' };
    }
    try {
      const res = await fetch(`${this.config.url}/rest/v1/team_members?email=eq.${encodeURIComponent(memberEmail)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return { success: res.ok };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Test connection to Supabase database
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: 'Please provide both Supabase Project URL and Anon Public Key.' };
    }

    try {
      const endpoint = `${this.config.url}/rest/v1/sessions?select=id&limit=1`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { 
          success: false, 
          message: `Connection failed (HTTP ${res.status}): ${errorText || res.statusText}` 
        };
      }

      return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
    } catch (err) {
      return { success: false, message: `Network error connecting to Supabase: ${err.message}` };
    }
  },

  /**
   * Format lead object to Supabase database schema
   */
  formatLeadForDb(lead, sessionId) {
    return {
      id: String(lead.id || ('lead_' + Date.now())),
      session_id: String(sessionId),
      business_name: String(lead.businessName || 'Unnamed Business'),
      owner_contact: String(lead.ownerContact || 'N/A'),
      email: String(lead.email || 'N/A'),
      phone: String(lead.phone || 'N/A'),
      address: String(lead.address || 'N/A'),
      website: String(lead.website || 'N/A'),
      category: String(lead.category || 'Local Service'),
      rating: String(lead.rating || 'N/A'),
      reviews_count: Number(lead.reviewsCount || 0),
      website_faults: Array.isArray(lead.websiteFault) ? lead.websiteFault : [],
      website_fault_summary: String(lead.websiteFaultSummary || ''),
      last_fb_post: String(lead.lastFbPost || 'Pending Check'),
      fb_link: String(lead.fbLink || 'N/A'),
      last_ig_post: String(lead.lastIgPost || 'Pending Check'),
      ig_link: String(lead.igLink || 'N/A'),
      linkedin_url: String(lead.linkedinUrl || 'N/A'),
      other_issues: String(lead.otherIssues || ''),
      audit_notes: Array.isArray(lead.auditNotes) ? lead.auditNotes : [],
      pitch_angle: String(lead.pitchAngle || ''),
      research_audit: (lead.researchAudit && typeof lead.researchAudit === 'object') ? lead.researchAudit : {},
      scraped_at: lead.scrapedAt ? new Date(lead.scrapedAt).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  /**
   * Format DB record back to client lead object
   */
  formatLeadFromDb(db) {
    return {
      id: db.id,
      businessName: db.business_name || '',
      ownerContact: db.owner_contact || 'N/A',
      email: db.email || 'N/A',
      phone: db.phone || 'N/A',
      address: db.address || 'N/A',
      website: db.website || 'N/A',
      category: db.category || 'Local Service',
      rating: db.rating || 'N/A',
      reviewsCount: db.reviews_count || 0,
      websiteFault: Array.isArray(db.website_faults) ? db.website_faults : [],
      websiteFaultSummary: db.website_fault_summary || '',
      lastFbPost: db.last_fb_post || 'Pending Check',
      fbLink: db.fb_link || 'N/A',
      lastIgPost: db.last_ig_post || 'Pending Check',
      igLink: db.ig_link || 'N/A',
      linkedinUrl: db.linkedin_url || 'N/A',
      otherIssues: db.other_issues || '',
      auditNotes: Array.isArray(db.audit_notes) ? db.audit_notes : [],
      pitchAngle: db.pitch_angle || '',
      researchAudit: db.research_audit || {},
      scrapedAt: db.scraped_at || new Date().toISOString()
    };
  },

  /**
   * Fetch all campaigns and their leads from the cloud
   */
  async fetchSessionsAndLeads() {
    if (!this.isConfigured()) return { success: false, sessions: [] };

    try {
      const endpoint = `${this.config.url}/rest/v1/sessions?select=*,leads(*)&order=created_at.desc`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const rows = await res.json();
      const sessions = rows.map(r => ({
        id: r.id,
        searchTerm: r.search_term,
        createdAt: r.created_at,
        leadsCount: Number(r.leads_count || (r.leads ? r.leads.length : 0)),
        faultsCount: Number(r.faults_count || 0),
        leads: (r.leads || []).map(l => this.formatLeadFromDb(l))
      }));

      return { success: true, sessions };
    } catch (err) {
      console.error('Fetch from Supabase error:', err);
      return { success: false, error: err.message, sessions: [] };
    }
  },

  /**
   * Sync a campaign session and all its leads to Supabase
   */
  async syncSession(session) {
    if (!this.isConfigured() || !session) return { success: false };

    try {
      // 1. Upsert Session
      const sessPayload = [{
        id: String(session.id),
        search_term: String(session.searchTerm || 'Local Search'),
        created_at: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
        leads_count: (session.leads || []).length,
        faults_count: Number(session.faultsCount || 0)
      }];

      const sessRes = await fetch(`${this.config.url}/rest/v1/sessions?on_conflict=id`, {
        method: 'POST',
        headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
        body: JSON.stringify(sessPayload)
      });

      if (!sessRes.ok) {
        throw new Error(`Failed to save session: ${await sessRes.text()}`);
      }

      // 2. Upsert Leads in batches of 50
      const leads = session.leads || [];
      if (leads.length > 0) {
        const dbLeads = leads.map(l => this.formatLeadForDb(l, session.id));
        const batchSize = 50;

        for (let i = 0; i < dbLeads.length; i += batchSize) {
          const batch = dbLeads.slice(i, i + batchSize);
          const leadRes = await fetch(`${this.config.url}/rest/v1/leads?on_conflict=id`, {
            method: 'POST',
            headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
            body: JSON.stringify(batch)
          });

          if (!leadRes.ok) {
            console.warn('Batch lead sync warning:', await leadRes.text());
          }
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Sync session to Supabase error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Sync a single updated lead to Supabase
   */
  async syncLead(lead, sessionId) {
    if (!this.isConfigured() || !lead || !sessionId) return { success: false };

    try {
      const payload = [this.formatLeadForDb(lead, sessionId)];
      const res = await fetch(`${this.config.url}/rest/v1/leads?on_conflict=id`, {
        method: 'POST',
        headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
        body: JSON.stringify(payload)
      });

      return { success: res.ok };
    } catch (err) {
      console.error('Sync single lead error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete a campaign session from Supabase (cascades to all its leads)
   */
  async deleteSession(sessionId) {
    if (!this.isConfigured() || !sessionId) return { success: false };

    try {
      const res = await fetch(`${this.config.url}/rest/v1/sessions?id=eq.${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return { success: res.ok };
    } catch (err) {
      console.error('Delete session error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete a single lead from Supabase
   */
  async deleteLead(leadId) {
    if (!this.isConfigured() || !leadId) return { success: false };

    try {
      const res = await fetch(`${this.config.url}/rest/v1/leads?id=eq.${encodeURIComponent(leadId)}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return { success: res.ok };
    } catch (err) {
      console.error('Delete lead error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Wipe all sessions and leads from Supabase
   */
  async clearAllData() {
    if (!this.isConfigured()) return { success: false };

    try {
      const res = await fetch(`${this.config.url}/rest/v1/sessions?id=neq.placeholder_none`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return { success: res.ok };
    } catch (err) {
      console.error('Clear cloud data error:', err);
      return { success: false, error: err.message };
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseSync;
}
if (typeof globalThis !== 'undefined') {
  globalThis.SupabaseSync = SupabaseSync;
}
if (typeof window !== 'undefined') {
  window.SupabaseSync = SupabaseSync;
}
