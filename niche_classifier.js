/**
 * Zen Scrapper - Universal Niche Classifier
 * Author: Iqam Ifthikar
 * Zenthoz Digital Marketing (www.zenthoz.com)
 *
 * Reliably classifies business leads into clean, standardized industry niches.
 * Identifies trade from:
 * 1. Clean Google Maps category (filters out ratings, review counts, hours)
 * 2. Business name keywords (e.g., "Bailey Roofing and Bailey MK" -> "Roofing")
 * 3. Search query used to scrape the leads (e.g., "Milton Keynes tree cutter" -> "Tree Cutter / Arborist")
 *
 * Guarantees that rating marks (like "2.8(33)") are NEVER treated as a niche.
 */

const NicheClassifier = {
  // Comprehensive mapping of trade niches and their detection keywords
  NICHE_RULES: [
    {
      canonical: "Roofing",
      category: "Home exterior",
      keywords: ["roof", "roofing", "roofer", "roofers", "shingle", "slate roof", "flat roof", "felt roof", "leadwork", "reroof"]
    },
    {
      canonical: "Tree Cutter / Arborist",
      category: "Outdoor and property",
      keywords: ["tree", "arborist", "tree cutter", "tree surgery", "tree surgeon", "tree care", "tree service", "tree removal", "tree work", "stump grinding", "stump removal", "tree pruning"]
    },
    {
      canonical: "Gutter Installation & Cleaning",
      category: "Home exterior",
      keywords: ["gutter", "guttering", "fascia", "soffit", "downpipe", "downspout", "eavestrough"]
    },
    {
      canonical: "Siding Installation",
      category: "Home exterior",
      keywords: ["siding", "cladding", "wall cladding", "exterior cladding"]
    },
    {
      canonical: "Window & Door Replacement",
      category: "Home exterior",
      keywords: ["window", "glazing", "double glazing", "door replacement", "upvc window", "patio door", "bi-fold"]
    },
    {
      canonical: "Fencing Contractors",
      category: "Home exterior",
      keywords: ["fenc", "fencing", "fence installation", "garden fence", "gate installer"]
    },
    {
      canonical: "Decks & Patios",
      category: "Home exterior",
      keywords: ["deck", "decking", "patio", "patios", "pergola", "veranda", "timber decking"]
    },
    {
      canonical: "Concrete & Driveways",
      category: "Home exterior",
      keywords: ["concrete", "driveway", "paving", "asphalt", "sealcoat", "tarmac", "block paving", "resin driveway", "pattern imprinted concrete"]
    },
    {
      canonical: "Masonry & Stonework",
      category: "Home exterior",
      keywords: ["masonry", "stonework", "bricklayer", "bricklaying", "stonemason", "stone wall", "pointing"]
    },
    {
      canonical: "Painting Contractors",
      category: "Home exterior",
      keywords: ["paint", "painter", "painting", "decorator", "decorating", "interior painting", "exterior painting"]
    },
    {
      canonical: "Pressure Washing",
      category: "Home exterior",
      keywords: ["pressure wash", "power wash", "soft wash", "jet wash", "roof cleaning", "patio cleaning", "driveway cleaning"]
    },
    {
      canonical: "Solar Panel Installers",
      category: "Home exterior",
      keywords: ["solar", "solar panel", "photovoltaic", "pv installation", "clean energy"]
    },
    {
      canonical: "Kitchen & Bath Remodeling",
      category: "Home interior",
      keywords: ["kitchen", "bathroom", "remodel", "kitchen fitting", "bathroom fitting", "renovation", "refurbishment", "ensuite"]
    },
    {
      canonical: "Flooring Installation",
      category: "Home interior",
      keywords: ["flooring", "hardwood floor", "wood floor", "carpet", "tile installation", "epoxy", "laminate", "vinyl floor"]
    },
    {
      canonical: "Cabinet Makers & Countertops",
      category: "Home interior",
      keywords: ["cabinet", "joinery", "countertop", "granite", "quartz", "worktop", "custom joiner"]
    },
    {
      canonical: "Drywall & Plastering",
      category: "Home interior",
      keywords: ["drywall", "plaster", "plasterer", "plastering", "rendering", "skimming", "stud wall"]
    },
    {
      canonical: "Water Damage & Restoration",
      category: "Emergency and restoration",
      keywords: ["water damage", "flood", "flood restoration", "drying", "fire damage", "smoke damage", "damage restoration", "structural drying"]
    },
    {
      canonical: "Mold Remediation",
      category: "Emergency and restoration",
      keywords: ["mold", "mould", "mold remediation", "black mold", "damp proofing", "condensation control"]
    },
    {
      canonical: "Foundation & Waterproofing",
      category: "Emergency and restoration",
      keywords: ["foundation", "waterproofing", "basement waterproofing", "tanking", "underpinning", "subsidence"]
    },
    {
      canonical: "Locksmiths",
      category: "Emergency and restoration",
      keywords: ["locksmith", "emergency lock", "key cutting", "lock replacement", "door lock"]
    },
    {
      canonical: "Garage Door Repair",
      category: "Emergency and restoration",
      keywords: ["garage door", "roller shutter", "roller door", "garage door opener"]
    },
    {
      canonical: "Electricians",
      category: "Trades and systems",
      keywords: ["electric", "electrician", "electrical", "rewire", "fuse box", "consumer unit", "lighting installation", "ev charger"]
    },
    {
      canonical: "Plumbing & Heating",
      category: "Trades and systems",
      keywords: ["plumb", "plumber", "plumbing", "heating", "boiler", "drain", "drainage", "blocked drain", "gas safe", "radiator"]
    },
    {
      canonical: "Septic & Well Services",
      category: "Trades and systems",
      keywords: ["septic", "septic tank", "cesspool", "well drill", "well pump", "water treatment", "water softener"]
    },
    {
      canonical: "Landscaping & Lawn Care",
      category: "Outdoor and property",
      keywords: ["landscape", "landscaping", "lawn care", "gardener", "gardening", "grounds maintenance", "turf", "artificial turf", "garden design"]
    },
    {
      canonical: "Pest Control",
      category: "Pest and cleaning",
      keywords: ["pest", "pest control", "termite", "exterminator", "wasp", "wasp nest", "rodent", "mice", "rat removal", "bed bug", "fumigation"]
    },
    {
      canonical: "Cleaning Services",
      category: "Pest and cleaning",
      keywords: ["cleaning", "cleaner", "maid", "commercial cleaning", "office cleaning", "carpet cleaning", "window cleaning", "end of tenancy"]
    },
    {
      canonical: "Car Wash & Auto Detailing",
      category: "Auto and mobile",
      keywords: [
        "car wash", "carwash", "auto wash", "hand car wash", "mobile car wash",
        "valeting", "valet", "car valeting", "mobile valeting", "auto detailing",
        "car detailing", "detailer", "detailing", "ceramic coating", "paint correction",
        "car polish", "jet wash", "touchless car wash", "fleet wash", "truck wash",
        "interior detailing", "auto spa", "car spa", "coin op car wash"
      ]
    },
    {
      canonical: "Window Tinting & Vehicle Wraps",
      category: "Auto and mobile",
      keywords: ["tinting", "window tint", "car tint", "vehicle wrap", "car wrap", "vinyl wrap", "ppf", "paint protection film", "de-chrome"]
    },
    {
      canonical: "Auto Body & Collision Repair",
      category: "Auto and mobile",
      keywords: ["body shop", "collision repair", "accident repair", "paintless dent", "dent repair", "pdr", "bumper repair", "spray painting car", "respray", "alloy wheel"]
    },
    {
      canonical: "Towing & Roadside Assistance",
      category: "Auto and mobile",
      keywords: ["towing", "tow truck", "roadside assistance", "breakdown recovery", "vehicle recovery", "flatbed"]
    },
    {
      canonical: "Auto Repair & Mechanics",
      category: "Auto and mobile",
      keywords: ["auto repair", "car repair", "mechanic", "garage", "mot", "vehicle repair", "brake repair", "transmission repair", "oil change"]
    },
    {
      canonical: "Moving & Storage",
      category: "Other local service businesses",
      keywords: ["moving", "removals", "movers", "man and van", "relocation", "storage", "haulage"]
    },
    {
      canonical: "Dental & Healthcare",
      category: "Other local service businesses",
      keywords: ["dentist", "dental", "orthodont", "chiropractor", "physio", "veterinary", "vet clinic", "med spa", "clinic"]
    }
  ],

  /**
   * Determine if a string is a rating mark, review count, operational hours, or invalid category
   */
  isInvalidOrRating(str) {
    if (!str || typeof str !== 'string') return true;
    const s = str.trim();
    if (!s || s === 'N/A' || s === 'Local Business' || s === 'Local Service' || s === 'Service establishment' || s === 'Corporate office') {
      return true;
    }

    // Matches rating patterns like: "2.8", "2.8(33)", "4.9 (45)", "(33)", "4.8★", "★4.8", "5.0 (120 reviews)"
    if (/^[\d.,\s()★☆]+$/.test(s)) return true;
    if (/^\d\.\d(?:\s*\(\d+[\d,]*\))?$/.test(s)) return true;
    if (/^\(\d+[\d,]*\)$/.test(s)) return true;
    if (/\b\d\.\d\s*stars?\b/i.test(s)) return true;
    if (/\b\d+\s*reviews?\b/i.test(s)) return true;

    // Operational hours / open status patterns
    if (/^(?:closed|open|opens|closes|24\s*hours|temporarily\s*closed|permanently\s*closed)\b/i.test(s)) {
      return true;
    }

    // Amenities / badges
    if (/^(?:in-store shopping|curbside pickup|on-site services|online appointments)\b/i.test(s)) {
      return true;
    }

    // Pricing marks like "$$$" or "££"
    if (/^[$£€]+$/.test(s)) return true;

    return false;
  },

  /**
   * Universal Classifier:
   * Classifies a lead into a clean canonical niche using:
   * 1. lead.category (if clean and valid)
   * 2. lead.businessName
   * 3. searchTerm (the query used to scrape the leads)
   * 4. audit notes / other issues text
   */
  classify(category, businessName = '', searchTerm = '', notes = '') {
    const rawCat = (category || '').trim();
    const name = (businessName || '').toLowerCase().trim();
    const query = (searchTerm || '').toLowerCase().trim();
    const notesText = (notes || '').toLowerCase().trim();

    // 1. If category is an invalid rating mark (e.g. "2.8(33)"), we MUST reject it
    const catIsInvalid = this.isInvalidOrRating(rawCat);
    const catLower = (!catIsInvalid) ? rawCat.toLowerCase() : '';

    // 2. Check for exact rule match in priority order:
    // First Priority: Business Name (e.g. "Bailey Roofing and Bailey MK" -> "Roofing")
    for (const rule of this.NICHE_RULES) {
      if (rule.keywords.some(kw => name.includes(kw))) {
        return rule.canonical;
      }
    }

    // Second Priority: Valid raw category from Google Maps (if not invalid)
    if (catLower) {
      for (const rule of this.NICHE_RULES) {
        if (rule.keywords.some(kw => catLower.includes(kw))) {
          return rule.canonical;
        }
      }
    }

    // Third Priority: Search Term used to scrape leads (e.g. "Milton Keynes tree cutter" -> "Tree Cutter / Arborist")
    if (query) {
      for (const rule of this.NICHE_RULES) {
        if (rule.keywords.some(kw => query.includes(kw))) {
          return rule.canonical;
        }
      }
    }

    // Fourth Priority: Notes / snippets
    if (notesText) {
      for (const rule of this.NICHE_RULES) {
        if (rule.keywords.some(kw => notesText.includes(kw))) {
          return rule.canonical;
        }
      }
    }

    // 5. If category is not invalid and has real words, clean it up and title case it
    if (!catIsInvalid && rawCat.length > 2 && !/\d/.test(rawCat)) {
      return this.toTitleCase(rawCat.replace(/[·•]/g, '').trim());
    }

    // 6. If search query has a trade keyword, extract it
    if (query) {
      const cleanQ = query.replace(/\b(?:in|near|at|top|best|local|services|contractor|company|ltd)\b/gi, '').trim();
      const words = cleanQ.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) {
        return this.toTitleCase(words[words.length - 1]);
      }
    }

    return "General Local Service";
  },

  /**
   * Title case helper
   */
  toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  /**
   * Checks if a lead matches a selected niche filter
   */
  matches(lead, targetNiche, sessionSearchTerm = '') {
    if (!targetNiche || targetNiche === 'all') return true;
    const classified = this.classify(lead.category, lead.businessName, sessionSearchTerm, (lead.auditNotes || []).join(' '));
    if (classified.toLowerCase() === targetNiche.toLowerCase()) return true;

    // Sub-keyword matching
    const targetLower = targetNiche.toLowerCase();
    const rule = this.NICHE_RULES.find(r => r.canonical.toLowerCase() === targetLower);
    const keywords = rule ? rule.keywords : [targetLower];

    const leadText = `${lead.category || ''} ${lead.businessName || ''} ${(lead.auditNotes || []).join(' ')} ${lead.pitchAngle || ''}`.toLowerCase();
    return keywords.some(kw => leadText.includes(kw));
  },

  /**
   * Returns list of canonical niches
   */
  getCanonicalNiches() {
    return this.NICHE_RULES.map(r => r.canonical);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NicheClassifier;
}
if (typeof globalThis !== 'undefined') {
  globalThis.NicheClassifier = NicheClassifier;
}
if (typeof window !== 'undefined') {
  window.NicheClassifier = NicheClassifier;
}
