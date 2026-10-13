/**
 * Realistic Mock Data for "Milton Keynes tree cutter" / Arborists
 * Perfect for instant testing and demonstration of all 14 required fields.
 */

const MOCK_MILTON_KEYNES_LEADS = [
  {
    id: "mk_lead_01",
    businessName: "Milton Keynes Tree Care Ltd",
    ownerContact: "Mark Jenkins (Head Arborist)",
    email: "mark@mktreecare.co.uk",
    phone: "+44 1908 678234",
    address: "Bletchley, Milton Keynes MK2 2EH, UK",
    website: "http://www.mktreecare.co.uk",
    websiteFault: [
      "⚠️ No SSL (HTTP Only - Chrome warns 'Not Secure')",
      "📱 Missing Mobile Viewport (Unresponsive on phones)",
      "⏳ Outdated Website (Copyright shows 2018)"
    ],
    websiteFaultSummary: "No SSL (HTTP Only); Missing Mobile Viewport; Outdated (© 2018)",
    lastFbPost: "Profile Linked (Needs Activity Check)",
    fbLink: "https://facebook.com/mktreecareltd",
    lastIgPost: "❌ No IG Account Found",
    igLink: "N/A",
    linkedinUrl: "https://linkedin.com/company/milton-keynes-tree-care",
    otherIssues: "⭐ Outstanding 4.9★ reputation (68 reviews) but website looks 10 years old; No click-to-call button on mobile header",
    auditNotes: [
      "⭐ Outstanding 4.9★ reputation (68 reviews) but website looks 10 years old",
      "No click-to-call button on mobile header",
      "No conversion tracking pixel found"
    ],
    rating: "4.9",
    reviewsCount: 68,
    category: "Tree Service / Arborist",
    mapsUrl: "https://maps.google.com/?q=Milton+Keynes+Tree+Care+Ltd",
    pitchAngle: "⭐ Reputation Disconnect: Incredible 4.9★ rating with 68 reviews, but website triggers Chrome 'Not Secure' alert and breaks on mobile phones. Pitch modern responsive redesign with emergency storm quote button to capture 2x more inquiries."
  },
  {
    id: "mk_lead_02",
    businessName: "Apex Arborists MK",
    ownerContact: "Dave Edwards (Arborist)",
    email: "N/A",
    phone: "+44 1908 612345",
    address: "Newport Pagnell, Milton Keynes MK16 0AH, UK",
    website: "N/A",
    websiteFault: [
      "❌ No Website Listed (100% reliant on Google Maps)"
    ],
    websiteFaultSummary: "❌ No Website Listed (100% reliant on Google Maps)",
    lastFbPost: "❌ No FB Page Found",
    fbLink: "N/A",
    lastIgPost: "❌ No IG Account Found",
    igLink: "N/A",
    linkedinUrl: "N/A",
    otherIssues: "Missing professional website presence; prospective high-ticket commercial tree surgery clients bounce to competitors",
    auditNotes: [
      "No website attached to Google Business Profile",
      "4.7★ (14 Google reviews) but leaving search traffic on the table"
    ],
    rating: "4.7",
    reviewsCount: 14,
    category: "Tree Surgeon",
    mapsUrl: "https://maps.google.com/?q=Apex+Arborists+MK",
    pitchAngle: "🚨 Urgent No Website Pitch: Apex Arborists has zero web presence, missing 60%+ of high-ticket tree felling and stump grinding searches in Milton Keynes. Pitch an affordable, turnkey 1-page local booking site with click-to-call."
  },
  {
    id: "mk_lead_03",
    businessName: "Crown Tree Surgeons & Stump Grinding",
    ownerContact: "Stuart Clarke (Lead Climber)",
    email: "enquiries@crowntreesurgeonsmk.co.uk",
    phone: "+44 1908 923811",
    address: "Stony Stratford, Milton Keynes MK11 1AA, UK",
    website: "https://www.crowntreesurgeonsmk.co.uk",
    websiteFault: [
      "⚡ Slow Load Time (3.8s initial render)",
      "📝 Missing Meta Description (Poor Google SERP CTR)",
      "🔗 Missing OpenGraph Tags (Blank link previews on WhatsApp/FB)"
    ],
    websiteFaultSummary: "Slow Load Time (3.8s); Missing Meta Description; Missing OpenGraph Tags",
    lastFbPost: "Profile Linked (Needs Activity Check)",
    fbLink: "https://facebook.com/crowntreesurgeonsmk",
    lastIgPost: "❌ No IG Account Found",
    igLink: "N/A",
    linkedinUrl: "https://linkedin.com/in/stuart-clarke-treesurgeon",
    otherIssues: "Tree surgery is highly visual yet they have no Instagram presence; website speed score fails Google Core Web Vitals",
    auditNotes: [
      "Fails Google Core Web Vitals (3.8s mobile load)",
      "No Instagram portfolio for before/after felling photos"
    ],
    rating: "4.8",
    reviewsCount: 31,
    category: "Tree Surgery & Stump Removal",
    mapsUrl: "https://maps.google.com/?q=Crown+Tree+Surgeons",
    pitchAngle: "📸 Missing Visual Proof + Speed Drag: Pitch speed optimization to pass Google Core Web Vitals, plus an automated Instagram before/after portfolio integration to attract high-paying residential pruning jobs."
  },
  {
    id: "mk_lead_04",
    businessName: "Oakhaven Tree & Forestry Services",
    ownerContact: "Graham Evans (Director)",
    email: "graham@oakhaventrees.co.uk",
    phone: "+44 1908 410889",
    address: "Woburn Sands, Milton Keynes MK17 8SG, UK",
    website: "https://www.oakhaventrees.co.uk",
    websiteFault: [
      "📞 No Click-to-Call Link (Mobile visitors cannot tap phone)",
      "📋 No Online Quote Form Detected",
      "🔍 Generic Page Title (\"Home - Oak Haven\")"
    ],
    websiteFaultSummary: "No Click-to-Call Link; No Online Quote Form; Generic Title Tag",
    lastFbPost: "Profile Linked (Needs Activity Check)",
    fbLink: "https://facebook.com/oakhaventrees",
    lastIgPost: "Profile Linked (Needs Activity Check)",
    igLink: "https://instagram.com/oakhaventrees_mk",
    linkedinUrl: "N/A",
    otherIssues: "Lead loss leak: Homeowners browsing on smartphones cannot tap to dial and there is no weekend quote form; title tag unoptimized for 'Milton Keynes tree surgeon'",
    auditNotes: [
      "Title tag doesn't mention Milton Keynes or tree surgeon keywords",
      "No interactive emergency quote form"
    ],
    rating: "4.6",
    reviewsCount: 22,
    category: "Tree Service & Forestry",
    mapsUrl: "https://maps.google.com/?q=Oakhaven+Tree+Services",
    pitchAngle: "🎯 Lead Capture Leak: Great services but no direct mobile click-to-call link and no out-of-hours quote form. Pitch adding a high-converting emergency estimate widget + title tag SEO optimization for 'Milton Keynes tree cutter'."
  },
  {
    id: "mk_lead_05",
    businessName: "MK Urban Forestry Specialists",
    ownerContact: "Liam O'Connor (Arboricultural Consultant)",
    email: "info@mkurbanforestry.co.uk",
    phone: "+44 1908 554321",
    address: "Central Milton Keynes MK9 3BN, UK",
    website: "https://www.mkurbanforestry.co.uk",
    websiteFault: [
      "⏳ Outdated Website (Copyright shows 2021)",
      "🔍 Generic Page Title (\"Welcome to our site\")"
    ],
    websiteFaultSummary: "Outdated Website (© 2021); Generic SEO Page Title",
    lastFbPost: "❌ No FB Page Found",
    fbLink: "N/A",
    lastIgPost: "❌ No IG Account Found",
    igLink: "N/A",
    linkedinUrl: "https://linkedin.com/company/mk-urban-forestry",
    otherIssues: "⚠️ Low Google review volume (only 3 reviews) makes them vulnerable to falling off the Google 3-Pack; zero social presence",
    auditNotes: [
      "Only 3 Google reviews — vulnerable to competitors with 20+ reviews",
      "Missing Facebook & Instagram business pages"
    ],
    rating: "5.0",
    reviewsCount: 3,
    category: "Arboricultural Consultant",
    mapsUrl: "https://maps.google.com/?q=MK+Urban+Forestry",
    pitchAngle: "📈 Local 3-Pack SEO & Review Velocity: Currently sitting at only 3 Google reviews despite 5-star quality. Pitch automated review generation campaign + local GMB SEO pack to rank #1 for commercial council & development tree surveys."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_MILTON_KEYNES_LEADS;
}
if (typeof window !== 'undefined') {
  window.MOCK_MILTON_KEYNES_LEADS = MOCK_MILTON_KEYNES_LEADS;
}
