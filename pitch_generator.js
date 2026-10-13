/**
 * LeadPitcher AI - Outreach Pitch & Angle Generator
 * Zen Scrapper | Zenthoz Digital Marketing (www.zenthoz.com)
 * Author: Iqam Ifthikar
 *
 * Generates tailored pitch angles, cold email templates, cold call scripts, and DMs
 * based on real detected audit faults, business niche, and agency branding.
 */

const PitchGenerator = {
  /**
   * Helper to format a clean niche description
   */
  getCleanNiche(lead) {
    if (lead && lead.category && lead.category.trim() !== '' && lead.category !== 'Local Business') {
      return lead.category.toLowerCase().trim();
    }
    return 'local service';
  },

  /**
   * Generates a primary high-converting pitch angle string
   */
  generatePitchAngle(lead) {
    const faults = lead.websiteFault || [];
    const notes = lead.auditNotes || [];
    const name = lead.businessName || 'the business';
    const hasWebsite = Boolean(lead.website && lead.website.trim() !== '' && lead.website !== 'N/A');
    const hasEmail = Boolean(lead.email && lead.email !== 'N/A');
    const hasPhone = Boolean(lead.phone && lead.phone !== 'N/A');
    const rating = parseFloat(lead.rating) || 0;
    const reviewCount = parseInt(lead.reviewsCount) || 0;
    const niche = this.getCleanNiche(lead);

    // Angle 1: No website at all
    if (!hasWebsite) {
      return `🚨 No Website Found: ${name} is losing 60%+ of high-ticket ${niche} leads to competitors. Pitch an affordable, high-converting 1-page local landing page with instant quote calculator & click-to-call button.`;
    }

    // Angle 2: Site is offline or SSL error
    if (faults.some(f => f.toLowerCase().includes('offline') || f.toLowerCase().includes('ssl') || f.toLowerCase().includes('security'))) {
      return `⚠️ Security / Site Warning: Website triggers 'Not Secure' SSL warning or loading errors in Chrome. Pitch urgent security fix & modern revamp to stop scaring away local clients.`;
    }

    // Angle 3: Not Mobile Friendly
    if (faults.some(f => f.toLowerCase().includes('viewport') || f.toLowerCase().includes('mobile'))) {
      return `📱 Mobile Breakdown: Site lacks mobile viewport. Over 75% of emergency ${niche} searches happen on phones. Pitch a mobile-first responsive redesign for immediate call conversion.`;
    }

    // Angle 4: Outdated website + high reviews
    if (faults.some(f => f.toLowerCase().includes('outdated')) && reviewCount >= 10) {
      return `⭐ Reputation Disconnect: Incredible ${rating}★ reputation (${reviewCount} reviews) but their website looks outdated (pre-2023). Pitch modernizing their site to match their 5-star real-world credibility and double lead intake.`;
    }

    // Angle 5: Missing Social Media (FB / IG)
    const missingSocial = !lead.fbLink || lead.fbLink === 'N/A' || !lead.igLink || lead.igLink === 'N/A';
    if (missingSocial) {
      return `📸 Missing Local Social Proof: ${niche} is visually driven, yet they lack active Instagram/FB links. Pitch a 'Before/After' social showcase funnel that generates automated word-of-mouth quotes.`;
    }

    // Angle 6: Missing Lead Capture / Call to action
    if (faults.some(f => f.toLowerCase().includes('cta') || f.toLowerCase().includes('tracking') || f.toLowerCase().includes('form'))) {
      return `🎯 Lead Capture Leak: No instant quote form or prominent click-to-call on their site. Pitch adding a high-converting emergency quote widget and automated SMS lead alerts.`;
    }

    // Angle 7: Low Reviews / Local SEO
    if (reviewCount < 10 && hasWebsite) {
      return `📈 Local SEO & Review Growth: Low Google review volume (${reviewCount} reviews) leaves them vulnerable. Pitch automated Google review generation system + local map pack ranking booster.`;
    }

    // Fallback Strong Angle
    return `🚀 Growth & Conversion Boost: Pitch modern speed optimization, local SEO keyword targeting for "${lead.category || 'Local Contractor'}", and automated quote request booking system.`;
  },

  /**
   * Generates a complete outreach package (Email, Call Script, DM)
   * tailored to Zenthoz Digital Marketing branding.
   */
  generateOutreachKit(lead, userSettings = {}) {
    const senderName = userSettings.senderName || 'Iqam Ifthikar';
    const agencyName = userSettings.agencyName || 'Zenthoz Digital Marketing';
    const agencyWebsite = userSettings.agencyWebsite || 'www.zenthoz.com';
    const senderService = userSettings.serviceType || 'Web Design & Digital Marketing';
    const senderPhone = userSettings.senderPhone || '+1 307 301 2270';
    const bizName = lead.businessName || 'Business';
    const contactName = lead.ownerContact && lead.ownerContact !== 'N/A' ? lead.ownerContact : 'Team';
    const city = lead.address ? lead.address.split(',')[0].trim() : 'your area';
    const website = lead.website || '';
    const mainFault = (lead.websiteFault && lead.websiteFault.length > 0) ? lead.websiteFault[0] : 'missing mobile optimization';
    const pitchAngle = this.generatePitchAngle(lead);
    const niche = this.getCleanNiche(lead);

    // 1. Cold Email Draft
    const emailSubject = lead.website && lead.website !== 'N/A'
      ? `Quick question regarding ${bizName}'s website / local quotes in ${city}`
      : `Question about ${bizName}'s customer booking in ${city}`;

    const emailBody = `Hi ${contactName},

I was looking at ${niche} providers in ${city} and came across ${bizName}. 

${lead.reviewsCount > 5 ? `First off, congrats on your ${lead.rating || '5'}★ rating on Google — your clients clearly value your work!` : `I love the quality of work you do in the ${city} area.`}

I took a quick look at your online setup and noticed a key opportunity:
${lead.website && lead.website !== 'N/A' ? `• On your website (${website}), ${lead.websiteFault && lead.websiteFault.length > 0 ? lead.websiteFault.join(', ') : 'there is no easy 1-click mobile quote request button'}.` : `• You currently don't have a direct website linked to your Google Business Profile, which means local customers looking for ${niche} are clicking right through to competitors.`}
${!lead.igLink || lead.igLink === 'N/A' ? `• Also noticed you don't have an active Instagram/Facebook portfolio linked to showcase your recent before/after projects.` : ''}

I put together a quick 90-second video mockup showing how fixing this could get you 4-8 extra high-value quote requests every month on autopilot.

Mind if I send the video over, ${contactName}? No pressure at all.

Best regards,
${senderName}
${agencyName} | ${agencyWebsite}
Direct: ${senderPhone}`;

    // 2. Cold Call Opener Script (30 Seconds)
    const phoneScript = `[Gatekeeper / Owner Opener]:
"Hi, is ${contactName !== 'Team' ? contactName : 'the business owner'} around? 

[When they answer]:
"Hi ${contactName}, my name is ${senderName} with ${agencyName} (${agencyWebsite}). I know you're busy out on jobs, so I’ll be brief. 
I was searching for ${niche} services in ${city} and saw ${bizName} on Google Maps. 

I noticed ${lead.website ? `your website currently has an issue with ${mainFault}` : `you don't have an independent website attached to your Google listing`}, which is costing you customer calls from homeowners searching for quotes right now.

We specialize in helping local ${niche} contractors get steady, exclusive jobs. Would you be open to seeing a 2-minute mockup I made for ${bizName}?"`;

    // 3. Instagram / LinkedIn / Facebook DM
    const socialDm = `Hey ${contactName}! 👋 
Came across ${bizName} while looking at local contractors in ${city}. Great reputation! 

I noticed a couple of quick things with your online booking & website setup (${mainFault}) that might be losing you some qualified quote requests to other local crews. 

I'm with ${agencyName} (${agencyWebsite}) — I made a quick 60-second walkthrough showing how you can easily fix it and capture more inbound jobs. Would it be okay if I drop the link here?`;

    return {
      pitchAngle,
      email: {
        subject: emailSubject,
        body: emailBody
      },
      phoneScript,
      socialDm
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PitchGenerator;
}
if (typeof globalThis !== 'undefined') {
  globalThis.PitchGenerator = PitchGenerator;
}
if (typeof window !== 'undefined') {
  window.PitchGenerator = PitchGenerator;
}
