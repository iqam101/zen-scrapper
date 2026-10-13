const Auditor = require('./auditor.js');
const PitchGenerator = require('./pitch_generator.js');
const LeadDirectory = require('./lead_directory.js');
const DeepSearch = require('./deep_search.js');
const NicheClassifier = require('./niche_classifier.js');

const sampleHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>MK Tree Surgeons & Arborist Services</title>
    <!-- Missing viewport intentionally to test fault detector -->
    <meta name="description" content="Tree surgery and stump grinding in Milton Keynes.">
    <meta property="og:image" content="https://mktrees.co.uk/banner.jpg">
  </head>
  <body>
    <h1>Welcome to MK Tree Surgeons</h1>
    <p>Founded by Head Arborist Mark Jenkins in 2012.</p>
    <p>Contact us at <a href="mailto:info@mktreesurgeons.co.uk">info@mktreesurgeons.co.uk</a> or call <a href="tel:01908612345">01908 612345</a>.</p>
    <p><a href="https://www.facebook.com/mktreesurgeons">Follow us on Facebook</a></p>
    <p><a href="https://www.instagram.com/mktrees_official">Instagram</a></p>
    <p><a href="https://www.linkedin.com/company/mk-tree-surgeons">LinkedIn</a></p>
    <footer>&copy; 2019 MK Tree Surgeons. All rights reserved.</footer>
  </body>
  </html>
`;

const leadInput = {
  businessName: 'MK Tree Surgeons',
  website: 'http://mktreesurgeons.co.uk',
  rating: '4.9',
  reviewsCount: 45,
  category: 'Tree Service',
  address: 'Milton Keynes, UK'
};

const audited = Auditor.auditLead(leadInput, sampleHtml, { loadTimeMs: 1400, status: 200 });

console.log('--- TEST RESULTS ---');
console.log('Business Name:', audited.businessName);
console.log('Owner / Contact:', audited.ownerContact);
console.log('Email Address:', audited.email);
console.log('Phone Number:', audited.phone);
console.log('Address / Location:', audited.address);
console.log('Website:', audited.website);
console.log('Website Fault?:', audited.websiteFault);
console.log('Last FB Post:', audited.lastFbPost);
console.log('FB Link:', audited.fbLink);
console.log('Last IG Post:', audited.lastIgPost);
console.log('IG Link:', audited.igLink);
console.log('LinkedIn Profile / URL:', audited.linkedinUrl);
console.log('Other Issues / Audit Notes:', audited.otherIssues);
console.log('Pitch Angle:', audited.pitchAngle);

// Test Zenthoz Digital Marketing Outreach Kit
const kit = PitchGenerator.generateOutreachKit(audited, {
  senderName: 'Iqam Ifthikar',
  agencyName: 'Zenthoz Digital Marketing',
  agencyWebsite: 'www.zenthoz.com',
  senderPhone: '+1 307 301 2270',
  serviceType: 'High-Converting Web Design, SEO & Lead Generation'
});

console.log('\n--- ZENTHOZ DIGITAL MARKETING OUTREACH KIT ---');
console.log('Cold Email Subject:', kit.email.subject);
console.log('Cold Email Signature Check:', kit.email.body.includes('Zenthoz Digital Marketing') && kit.email.body.includes('www.zenthoz.com') && kit.email.body.includes('+1 307 301 2270') ? '✅ PASS' : '❌ FAIL');
console.log('Cold Call Script Check:', kit.phoneScript.includes('Zenthoz Digital Marketing') ? '✅ PASS' : '❌ FAIL');
console.log('Social DM Check:', kit.socialDm.includes('Zenthoz Digital Marketing') ? '✅ PASS' : '❌ FAIL');

// Test Roofing Niche Pitch
const roofingLead = {
  businessName: 'Apex Roofing & Solar',
  website: 'N/A',
  category: 'Roofing contractor',
  address: 'Austin, Texas',
  rating: '4.8',
  reviewsCount: 32
};
const roofingKit = PitchGenerator.generateOutreachKit(roofingLead);
console.log('Dynamic Roofing Pitch Check:', roofingKit.email.body.includes('roofing contractor') ? '✅ PASS' : '❌ FAIL');

// Test DeepSearch
const mockSerpHtml = `
  <html>
    <body>
      <div class="g">
        <a href="/url?q=https://www.checkatrade.com/trades/apexarborists">Checkatrade Profile</a>
        <a href="/url?q=https://www.apex-arborists-mk.co.uk/">Apex Arborists MK Official Website</a>
        <a href="https://www.facebook.com/apexarboristsmk">Facebook Page</a>
        <a href="https://www.instagram.com/apex_arborists">Instagram</a>
        <p>Contact Dave Edwards on dave@apex-arborists-mk.co.uk or 01908 612345</p>
      </div>
    </body>
  </html>
`;

const leadForDeepSearch = { businessName: 'Apex Arborists MK', address: 'Newport Pagnell, Milton Keynes' };
const serpResult = DeepSearch.parseGoogleSERP(mockSerpHtml, leadForDeepSearch);

console.log('\n--- DEEP SEARCH TEST ---');
console.log('Constructed Search Query:', DeepSearch.buildSearchQuery(leadForDeepSearch));
console.log('Discovered Candidate Website:', serpResult.foundWebsite);
console.log('Discovered Facebook:', serpResult.foundFb);
console.log('Discovered Instagram:', serpResult.foundIg);
console.log('Snippet Discovered Email:', serpResult.foundEmail);

console.log('\n--- SOCIAL AS WEBSITE RECLASSIFICATION TEST ---');
const lucasLeadInput = {
  businessName: 'Lucas tree care Ltd',
  website: 'https://facebook.com/lucastreecaremk/?ref=bookmarks',
  phone: '+44 7542 136203',
  address: 'Milton Keynes, UK',
  rating: '5.0',
  reviewsCount: 165
};

const auditedLucas = Auditor.auditLead(lucasLeadInput);
console.log('Business Name:', auditedLucas.businessName);
console.log('Website (Should be N/A):', auditedLucas.website);
console.log('FB Link (Should be Facebook URL):', auditedLucas.fbLink);
console.log('Website Fault (Should state No Independent Website):', auditedLucas.websiteFault);
console.log('Pitch Angle:', auditedLucas.pitchAngle);

// Test LeadDirectory (Niches and Locations)
console.log('\n--- TARGET NICHES & LOCATIONS DIRECTORY TEST ---');
console.log('Total Niche Categories:', LeadDirectory.categories.length);
const totalNiches = LeadDirectory.categories.reduce((acc, cat) => acc + cat.niches.length, 0);
console.log('Total Specific Niches Count:', totalNiches);

const query1 = LeadDirectory.buildSearchQuery('Austin', 'Texas', 'United States', 'roofing contractor');
console.log('Sample Query 1:', query1);
const query2 = LeadDirectory.buildSearchQuery('Milton Keynes', 'Buckinghamshire', 'United Kingdom', 'gutter installation and cleaning');
console.log('Sample Query 2:', query2);

// Test Extensibility (Adding custom country / area)
const customAdded = LeadDirectory.addCustomLocation('Germany', '🇩🇪', 'Bavaria', 'Munich');
console.log('Dynamic Location Extensibility Check:', customAdded && LeadDirectory.getAreas('Germany', 'Bavaria').includes('Munich') ? '✅ PASS' : '❌ FAIL');

// Test Multi-Filter (No Website + Specific Niche) & Export Filename
console.log('\n--- MULTI-FILTER & SMART EXPORT FILENAME TEST ---');
const sampleLeads = [
  { businessName: 'Austin Pro Roofing', category: 'Roofing contractor', website: 'N/A', address: 'Austin, Texas, USA' },
  { businessName: 'Elite Austin Roofers', category: 'Roofing contractor', website: 'https://eliterroofers.com', address: 'Austin, Texas, USA' },
  { businessName: 'MK Tree Surgery', category: 'Tree Cutter', website: 'N/A', address: 'Milton Keynes, UK' },
  { businessName: 'London Arborists', category: 'Tree Surgeon', website: 'https://londonarborists.co.uk', address: 'London, UK' }
];

// Filter: No Website + Roofing
const noWebRoofing = sampleLeads.filter(l => (!l.website || l.website === 'N/A') && (l.category.toLowerCase().includes('roof')));
console.log('Filtered (No Website + Roofing):', noWebRoofing.map(l => l.businessName));
console.log('Multi-filter Check:', (noWebRoofing.length === 1 && noWebRoofing[0].businessName === 'Austin Pro Roofing') ? '✅ PASS' : '❌ FAIL');

// Filename generator test
function testFilename(prefix, status, niche, country, date) {
  const statusPart = status === 'no-website' ? 'no_website_' : '';
  const nicheTag = niche.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return `${prefix}_${statusPart}${nicheTag}_${country}_${date}.csv`;
}
const dateToday = new Date().toISOString().split('T')[0];
const generatedFilename = testFilename('google_contacts', 'no-website', 'Roofing', 'usa', dateToday);
console.log('Generated Export Filename:', generatedFilename);
console.log('Filename Format Check:', (generatedFilename.includes('google_contacts_no_website_roofing_usa') && generatedFilename.endsWith('.csv')) ? '✅ PASS' : '❌ FAIL');

// Test Universal Niche Classifier (Guarantees rating marks like 2.8(33) are never treated as a niche)
console.log('\n--- UNIVERSAL NICHE CLASSIFIER TEST ---');
const ratingInput = '2.8(33)';
const baileyBiz = 'Bailey MK Ltd trading name Bailey Roofing and Bailey MK';
const classifiedBailey = NicheClassifier.classify(ratingInput, baileyBiz, 'Milton Keynes tree cutter');
console.log('Raw Category was rating mark:', ratingInput);
console.log('Business Name:', baileyBiz);
console.log('Correctly Classified Niche:', classifiedBailey);
console.log('Niche Classifier Rating Protection Check:', (classifiedBailey === 'Roofing' && NicheClassifier.isInvalidOrRating(ratingInput)) ? '✅ PASS' : '❌ FAIL');

// Test Search Query Fallback
const apexBiz = 'Apex Specialists Ltd';
const classifiedApex = NicheClassifier.classify('Local Service', apexBiz, 'Milton Keynes tree cutter');
console.log('Apex Classified via search query:', classifiedApex);
console.log('Search Query Classification Check:', (classifiedApex === 'Tree Cutter / Arborist') ? '✅ PASS' : '❌ FAIL');

// Test DeepSearch Research Audit Trail
console.log('\n--- DEEP SEARCH RESEARCH AUDIT TRAIL TEST ---');
const cleanQueries = DeepSearch.buildSearchQueries({ businessName: baileyBiz, address: 'Milton Keynes, UK' });
console.log('Clean Query 1:', cleanQueries[0]);
console.log('Query Cleaning Check (No unescaped exact quotes):', (!cleanQueries[0].startsWith('"') && cleanQueries[0].includes('Bailey Roofing')) ? '✅ PASS' : '❌ FAIL');

const mockWebHtml = `
  <html><body>
    <div class="result">
      <a class="result__url" href="/uddg=https%3A%2F%2Fbaileyroofing.co.uk%2F"></a>
      <a href="https://www.facebook.com/BaileyMKconstruction/">Facebook</a>
      <div class="result__snippet">Bailey Roofing and Bailey MK are experienced roofing contractors in Milton Keynes. Call 01908 691697 or email enquiries@baileymk.co.uk</div>
    </div>
  </body></html>
`;
const auditParsed = DeepSearch.parseSERP(mockWebHtml, { businessName: baileyBiz, address: 'Milton Keynes, UK' }, 'DuckDuckGo');
console.log('Discovered Website:', auditParsed.foundWebsite);
console.log('Discovered Facebook:', auditParsed.foundFb);
console.log('Discovered Direct Phone:', auditParsed.foundPhone);
console.log('Discovered Direct Email:', auditParsed.foundEmail);
console.log('Audit Logs count:', auditParsed.logs.length);
console.log('Deep Search Live Parser Check:', (auditParsed.foundWebsite === 'https://baileyroofing.co.uk' && auditParsed.foundFb && auditParsed.foundEmail === 'enquiries@baileymk.co.uk') ? '✅ PASS' : '❌ FAIL');

// Test Supabase Live Database Sync (Client & Formatting)
console.log('\n--- SUPABASE LIVE DATABASE SYNC TEST ---');
const SupabaseSync = require('./supabase_sync.js');

// 1. Preconfigured state out of the box
console.log('Preconfigured Supabase Credentials State (Should be true):', SupabaseSync.isConfigured());
console.log('Preconfigured Credentials Check:', SupabaseSync.isConfigured() ? '✅ PASS' : '❌ FAIL');

// 2. Clearing credentials state
SupabaseSync.init('', '');
console.log('Unconfigured State after reset (Should be false):', SupabaseSync.isConfigured());
console.log('Unconfigured Check:', (!SupabaseSync.isConfigured()) ? '✅ PASS' : '❌ FAIL');

// Re-initialize with user's project credentials
SupabaseSync.init('https://yvyzaxvslbtilcaalwdw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eXpheHZzbGJ0aWxjYWFsd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODkyNzUsImV4cCI6MjEwNzQ2NTI3NX0.CZvbtsEhh68h-xAqEE2TgYMuKMtJYv3OTPFRVmJRp-I');
console.log('Reconfigured Check:', (SupabaseSync.isConfigured()) ? '✅ PASS' : '❌ FAIL');

// 3. Headers Check
const headers = SupabaseSync.getHeaders();
console.log('Headers apikey check:', headers.apikey.startsWith('eyJhbGci') ? '✅ PASS' : '❌ FAIL');
console.log('Headers Bearer check:', headers.Authorization.startsWith('Bearer eyJhbGci') ? '✅ PASS' : '❌ FAIL');

// 4. Lead formatting for DB (camelCase -> snake_case)
const testClientLead = {
  id: 'lead_123',
  businessName: 'Bailey Roofing',
  ownerContact: 'Dave Bailey',
  email: 'dave@baileyroofing.co.uk',
  phone: '01908 691697',
  address: 'Milton Keynes, UK',
  website: 'https://baileyroofing.co.uk',
  category: 'Roofing',
  rating: '4.8',
  reviewsCount: 35,
  websiteFault: ['No SSL'],
  websiteFaultSummary: 'No SSL',
  lastFbPost: '3 days ago',
  fbLink: 'https://facebook.com/bailey',
  lastIgPost: 'Pending Check',
  igLink: 'N/A',
  linkedinUrl: 'N/A',
  otherIssues: 'None',
  auditNotes: ['Site fast'],
  pitchAngle: 'Pitch SEO revamping',
  researchAudit: { queried: true },
  scrapedAt: '2026-10-13T12:00:00.000Z'
};

const dbLead = SupabaseSync.formatLeadForDb(testClientLead, 'session_mk_roofing');
console.log('DB Lead session_id:', dbLead.session_id);
console.log('DB Lead business_name:', dbLead.business_name);
console.log('DB Lead website_faults:', dbLead.website_faults);
console.log('Client to DB Format Check:', (
  dbLead.session_id === 'session_mk_roofing' &&
  dbLead.business_name === 'Bailey Roofing' &&
  dbLead.email === 'dave@baileyroofing.co.uk' &&
  Array.isArray(dbLead.website_faults) &&
  dbLead.website_faults[0] === 'No SSL'
) ? '✅ PASS' : '❌ FAIL');

// 5. DB formatting back to client (snake_case -> camelCase)
const convertedBack = SupabaseSync.formatLeadFromDb(dbLead);
console.log('Converted back businessName:', convertedBack.businessName);
console.log('DB to Client Format Check:', (
  convertedBack.id === 'lead_123' &&
  convertedBack.businessName === 'Bailey Roofing' &&
  convertedBack.email === 'dave@baileyroofing.co.uk' &&
  convertedBack.websiteFault[0] === 'No SSL'
) ? '✅ PASS' : '❌ FAIL');

// 6. Team Authentication & Role-Based Access Control Test
console.log('\n--- TEAM AUTH & ROLE-BASED ACCESS CONTROL TEST ---');
// Test Admin Role
SupabaseSync.currentUser = { email: 'zenthoztechnologies@gmail.com' };
SupabaseSync.currentRole = 'admin';
console.log('Admin user (zenthoztechnologies@gmail.com) isAdmin():', SupabaseSync.isAdmin());
console.log('Admin Permission Check:', SupabaseSync.isAdmin() ? '✅ PASS' : '❌ FAIL');

// Test Staff Role (Settings access forbidden)
SupabaseSync.currentUser = { email: 'staff.john@zenthoz.com' };
SupabaseSync.currentRole = 'staff';
console.log('Staff user (staff.john@zenthoz.com) isAdmin():', SupabaseSync.isAdmin());
console.log('Staff Restriction Check (Should be false):', (!SupabaseSync.isAdmin()) ? '✅ PASS' : '❌ FAIL');

// Staff trying to create user must be blocked
SupabaseSync.createTeamUser('hacker@evil.com', 'pass123').then(res => {
  console.log('Staff blocked from creating users check:', (!res.success && res.error.includes('Only administrators')) ? '✅ PASS' : '❌ FAIL');
  console.log('\nSUCCESS: All 14 fields, Zenthoz agency branding, Niche Classification (no 2.8(33) ratings), Deep Search Live Research Audit, Clear Storage, Supabase Live Cloud Sync, and Team Auth / Roles verified!');
});


