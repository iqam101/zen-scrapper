/**
 * Lead Directory - Niches & Target Locations
 * Zen Scrapper | Zenthoz Digital Marketing (www.zenthoz.com)
 * Author: Iqam Ifthikar
 *
 * Pre-built database of high-ticket niches and target geographic areas across countries,
 * states/regions, and cities. Extensible so new countries and locations can be added anytime.
 */

const LeadDirectory = {
  // 1. ALL TARGET NICHES CATEGORIZED
  categories: [
    {
      id: "home-exterior",
      name: "Home exterior",
      icon: "🏡",
      description: "High-ticket residential and commercial exterior renovations.",
      niches: [
        { name: "Roofing", note: "One of the most lucrative niches", keyword: "roofing contractor" },
        { name: "Gutter installation and cleaning", note: "High volume recurring work", keyword: "gutter installation and cleaning" },
        { name: "Siding installation", note: "High job value exterior project", keyword: "siding installation contractor" },
        { name: "Window and door replacement", note: "Energy-efficiency upgrades", keyword: "window and door replacement" },
        { name: "Fencing contractors", note: "Privacy and security perimeter builds", keyword: "fencing contractor" },
        { name: "Decks and patios", note: "Outdoor living additions", keyword: "deck and patio builder" },
        { name: "Concrete and driveway contractors", note: "Driveways, foundations, stamped concrete", keyword: "concrete and driveway contractor" },
        { name: "Paving and asphalt / sealcoating", note: "Commercial and residential asphalt", keyword: "paving and asphalt sealcoating" },
        { name: "Masonry and stonework", note: "Custom brick and stone builds", keyword: "masonry and stonework contractor" },
        { name: "Exterior painting", note: "Curb-appeal full exterior paint", keyword: "exterior painting contractor" },
        { name: "Pressure washing / soft washing", note: "Fast turnaround roof/siding wash", keyword: "pressure washing soft washing" },
        { name: "Solar panel installers", note: "High-ticket clean energy installations", keyword: "solar panel installers" }
      ]
    },
    {
      id: "home-interior",
      name: "Home interior",
      icon: "🛋️",
      description: "High-budget interior remodeling, finishing, and installations.",
      niches: [
        { name: "Kitchen and bathroom remodeling", note: "Top-dollar interior projects", keyword: "kitchen and bathroom remodeling" },
        { name: "Flooring installation (hardwood, tile, epoxy)", note: "Fast quoting residential and commercial", keyword: "flooring installation contractor" },
        { name: "Cabinet makers and refacing", note: "Custom woodwork & kitchen refacing", keyword: "custom cabinet makers refacing" },
        { name: "Countertop fabricators (granite, quartz)", note: "Premium stone surfaces", keyword: "countertop fabricators granite quartz" },
        { name: "Drywall contractors", note: "Hang, tape, mud & texturing", keyword: "drywall contractor" },
        { name: "Interior painting", note: "High-frequency residential repaint", keyword: "interior painting contractor" },
        { name: "Basement finishing", note: "Major square footage expansion", keyword: "basement finishing remodeling" },
        { name: "Insulation contractors", note: "Spray foam and attic insulation", keyword: "insulation contractor spray foam" },
        { name: "Closet and garage organization systems", note: "Custom storage builds", keyword: "custom closet garage organization" }
      ]
    },
    {
      id: "emergency-restoration",
      name: "Emergency and restoration",
      icon: "🚨",
      description: "Urgent jobs where customers pay fast and insurance covers big tickets.",
      niches: [
        { name: "Water damage restoration", note: "Immediate insurance payouts", keyword: "water damage restoration 24/7" },
        { name: "Fire and smoke damage restoration", note: "Heavy insurance restoration jobs", keyword: "fire and smoke damage restoration" },
        { name: "Mold remediation", note: "Certified environmental mitigation", keyword: "mold remediation specialist" },
        { name: "Foundation repair", note: "High-ticket structural engineering", keyword: "foundation repair contractor" },
        { name: "Basement waterproofing", note: "Sump pumps, drainage, barrier coats", keyword: "basement waterproofing" },
        { name: "Locksmiths", note: "Emergency 24-hour lockout service", keyword: "emergency locksmith 24/7" },
        { name: "Garage door repair", note: "Same-day spring and motor repairs", keyword: "garage door repair replacement" },
        { name: "Emergency electricians", note: "24/7 power restoration and hazards", keyword: "emergency electrician 24/7" }
      ]
    },
    {
      id: "trades-systems",
      name: "Trades and systems",
      icon: "⚡",
      description: "Licensed technical trades, utilities, and home machinery.",
      niches: [
        { name: "Electricians", note: "Residential and commercial panels", keyword: "licensed electrician" },
        { name: "Septic tank services", note: "Pumping, repair, and field lines", keyword: "septic tank service pumping" },
        { name: "Well drilling and well pump repair", note: "Private water well infrastructure", keyword: "well drilling and well pump repair" },
        { name: "Water treatment and softener installers", note: "Filtration and water testing", keyword: "water treatment softener installer" },
        { name: "Generator installation", note: "Whole-home backup power systems", keyword: "whole house generator installation" },
        { name: "Appliance repair", note: "Refrigeration, ovens, washers", keyword: "appliance repair service" },
        { name: "Chimney sweeps and repair", note: "Annual inspections and repointing", keyword: "chimney sweep and repair" },
        { name: "Fireplace installers", note: "Gas and wood fireplace builds", keyword: "fireplace installer" }
      ]
    },
    {
      id: "outdoor-property",
      name: "Outdoor and property",
      icon: "🌳",
      description: "Landscaping, grounds maintenance, and outdoor living architecture.",
      niches: [
        { name: "Tree surgeon / tree cutter", note: "High-risk, high-ticket tree removal & pruning", keyword: "tree surgeon tree cutter" },
        { name: "Landscaping and lawn care", note: "Design, maintenance, and mulch", keyword: "landscaping lawn care contractor" },
        { name: "Irrigation and sprinkler systems", note: "Smart watering and seasonal shutoff", keyword: "irrigation and sprinkler system repair" },
        { name: "Pool building and pool cleaning", note: "Inground pool builds & weekly service", keyword: "pool builder pool cleaning service" },
        { name: "Hardscaping", note: "Retaining walls, paver patios, walkways", keyword: "hardscaping contractor" },
        { name: "Outdoor lighting", note: "Architectural and landscape illumination", keyword: "outdoor architectural landscape lighting" },
        { name: "Snow removal", note: "Winter commercial and residential plowing", keyword: "snow removal plowing service" },
        { name: "Land clearing and excavation", note: "Heavy machinery site preparation", keyword: "land clearing excavation contractor" },
        { name: "Stump grinding", note: "Specialized stump removal", keyword: "stump grinding removal" },
        { name: "Artificial turf installers", note: "Low-maintenance synthetic grass", keyword: "artificial turf installer synthetic grass" }
      ]
    },
    {
      id: "pest-cleaning",
      name: "Pest and cleaning",
      icon: "🧹",
      description: "Recurring residential and commercial sanitization and pest extermination.",
      niches: [
        { name: "Pest control", note: "Recurring extermination plans", keyword: "pest control exterminator" },
        { name: "Termite treatment", note: "High-value structural protection", keyword: "termite inspection and treatment" },
        { name: "Wildlife and animal removal", note: "Humane removal of raccoons, bats, rodents", keyword: "wildlife animal removal service" },
        { name: "Junk removal", note: "Haul-away and property cleanouts", keyword: "junk removal hauling service" },
        { name: "House cleaning / maid services", note: "Recurring residential cleaning", keyword: "house cleaning maid service" },
        { name: "Carpet and upholstery cleaning", note: "Deep steam carpet cleaning", keyword: "carpet and upholstery steam cleaning" },
        { name: "Window cleaning", note: "Residential and commercial exterior glass", keyword: "window cleaning service" },
        { name: "Duct cleaning and dryer vent cleaning", note: "HVAC air quality & fire prevention", keyword: "air duct cleaning dryer vent cleaning" },
        { name: "Post-construction cleaning", note: "Turnkey cleaning for new builds", keyword: "post construction cleaning contractor" }
      ]
    },
    {
      id: "auto-mobile",
      name: "Auto and mobile",
      icon: "🚗",
      description: "Automotive repair, custom styling, and on-demand mobile technicians.",
      niches: [
        { name: "Auto repair shops", note: "Mechanical diagnostic and engine repairs", keyword: "auto repair mechanic shop" },
        { name: "Mobile mechanics", note: "On-site roadside and driveway repairs", keyword: "mobile mechanic service" },
        { name: "Auto detailing / ceramic coating", note: "Paint correction and protective coatings", keyword: "auto detailing ceramic coating" },
        { name: "Window tinting", note: "Ceramic tint for cars and commercial glass", keyword: "auto window tinting service" },
        { name: "Towing companies", note: "24-hour towing and flatbed transport", keyword: "towing company 24 hour" },
        { name: "Auto body and collision repair", note: "Insurance collision restorations", keyword: "auto body collision repair shop" },
        { name: "Windshield replacement", note: "Mobile auto glass repair", keyword: "windshield replacement mobile auto glass" }
      ]
    },
    {
      id: "other-local-services",
      name: "Other local service businesses",
      icon: "🏢",
      description: "High-value local services, property operations, and wellness clinics.",
      niches: [
        { name: "Moving companies", note: "Long distance and local moves", keyword: "moving company local movers" },
        { name: "Home inspectors", note: "Pre-purchase home and roof inspections", keyword: "certified home inspector" },
        { name: "Property management", note: "Commercial and residential rental management", keyword: "property management company" },
        { name: "Dumpster rental", note: "Roll-off dumpster drop-offs", keyword: "roll off dumpster rental" },
        { name: "Portable toilet rental", note: "Construction site & event sanitation", keyword: "portable toilet porta potty rental" },
        { name: "Storage units", note: "Self-storage facility rentals", keyword: "self storage units facility" },
        { name: "Handyman services", note: "General repairs and home fixes", keyword: "licensed handyman services" },
        { name: "Home security system installers", note: "Smart cameras, alarms, access control", keyword: "home security system installer" },
        { name: "Med spas, dentists, chiropractors, and veterinarians", note: "Non-trade, high-value local healthcare & beauty", keyword: "med spa cosmetic clinic dentist" }
      ]
    }
  ],

  // 2. TARGET LOCATIONS HIERARCHY (Countries -> States/Regions -> Cities/Areas)
  locations: [
    {
      country: "United States",
      code: "US",
      flag: "🇺🇸",
      states: [
        {
          name: "Texas",
          areas: ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth", "Arlington", "Plano", "Round Rock", "Irving", "Frisco", "McKinney", "Garland"]
        },
        {
          name: "Florida",
          areas: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "St. Petersburg", "Sarasota", "Naples", "Cape Coral", "Tallahassee", "Clearwater", "Pembroke Pines"]
        },
        {
          name: "California",
          areas: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Sacramento", "Fresno", "Irvine", "Riverside", "Long Beach", "Oakland", "Anaheim", "Bakersfield"]
        },
        {
          name: "Wyoming", // Zenthoz Digital Marketing Area Code (+1 307)
          areas: ["Cheyenne", "Casper", "Laramie", "Gillette", "Jackson", "Sheridan", "Rock Springs", "Evanston", "Green River", "Cody"]
        },
        {
          name: "Georgia",
          areas: ["Atlanta", "Savannah", "Augusta", "Marietta", "Alpharetta", "Roswell", "Sandy Springs", "Johns Creek", "Athens", "Macon"]
        },
        {
          name: "North Carolina",
          areas: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Cary", "Wilmington", "Asheville", "Concord", "Gastonia"]
        },
        {
          name: "Ohio",
          areas: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"]
        },
        {
          name: "Arizona",
          areas: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Gilbert", "Glendale", "Tempe", "Peoria", "Surprise"]
        },
        {
          name: "Colorado",
          areas: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo"]
        },
        {
          name: "Illinois",
          areas: ["Chicago", "Naperville", "Rockford", "Joliet", "Aurora", "Schaumburg", "Elgin", "Peoria", "Waukegan", "Cicero"]
        },
        {
          name: "New York",
          areas: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers", "White Plains", "New Rochelle", "Mount Vernon", "Schenectady"]
        },
        {
          name: "Washington",
          areas: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Everett", "Kent", "Renton", "Spokane Valley", "Federal Way"]
        },
        {
          name: "Pennsylvania",
          areas: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg"]
        },
        {
          name: "Tennessee",
          areas: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Johnson City"]
        }
      ]
    },
    {
      country: "United Kingdom",
      code: "UK",
      flag: "🇬🇧",
      states: [
        {
          name: "Buckinghamshire",
          areas: ["Milton Keynes", "Aylesbury", "High Wycombe", "Buckingham", "Amersham", "Chesham", "Marlow", "Beaconsfield"]
        },
        {
          name: "Greater London",
          areas: ["Central London", "Croydon", "Bromley", "Enfield", "Richmond", "Kingston upon Thames", "Harrow", "Barnet", "Ealing", "Hillingdon"]
        },
        {
          name: "West Midlands",
          areas: ["Birmingham", "Coventry", "Wolverhampton", "Solihull", "Sutton Coldfield", "Dudley", "Walsall", "West Bromwich"]
        },
        {
          name: "Greater Manchester",
          areas: ["Manchester", "Salford", "Bolton", "Stockport", "Oldham", "Wigan", "Rochdale", "Bury", "Trafford"]
        },
        {
          name: "West Yorkshire",
          areas: ["Leeds", "Bradford", "Wakefield", "Huddersfield", "Halifax", "Dewsbury", "Keighley"]
        },
        {
          name: "Merseyside",
          areas: ["Liverpool", "Birkenhead", "St Helens", "Southport", "Wallasey", "Bootle"]
        },
        {
          name: "Hampshire",
          areas: ["Southampton", "Portsmouth", "Winchester", "Basingstoke", "Andover", "Farnborough", "Eastleigh"]
        },
        {
          name: "Essex",
          areas: ["Chelmsford", "Colchester", "Southend-on-Sea", "Basildon", "Brentwood", "Harlow", "Braintree"]
        },
        {
          name: "Surrey",
          areas: ["Guildford", "Woking", "Epsom", "Farnham", "Redhill", "Camberley", "Staines-upon-Thames"]
        },
        {
          name: "Kent",
          areas: ["Maidstone", "Canterbury", "Tunbridge Wells", "Dartford", "Sevenoaks", "Gillingham", "Ashford"]
        },
        {
          name: "Scotland",
          areas: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling", "Paisley"]
        }
      ]
    },
    {
      country: "Canada",
      code: "CA",
      flag: "🇨🇦",
      states: [
        {
          name: "Ontario",
          areas: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"]
        },
        {
          name: "British Columbia",
          areas: ["Vancouver", "Surrey", "Burnaby", "Richmond", "Victoria", "Kelowna", "Coquitlam", "Abbotsford", "Langley", "Nanaimo"]
        },
        {
          name: "Alberta",
          areas: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat", "Grande Prairie", "Airdrie"]
        },
        {
          name: "Quebec",
          areas: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Levis", "Trois-Rivieres"]
        }
      ]
    },
    {
      country: "Australia",
      code: "AU",
      flag: "🇦🇺",
      states: [
        {
          name: "New South Wales",
          areas: ["Sydney", "Newcastle", "Central Coast", "Wollongong", "Maitland", "Parramatta", "Blacktown", "Albury", "Coffs Harbour"]
        },
        {
          name: "Victoria",
          areas: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Frankston", "Dandenong", "Shepparton", "Mildura"]
        },
        {
          name: "Queensland",
          areas: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba", "Mackay", "Rockhampton"]
        },
        {
          name: "Western Australia",
          areas: ["Perth", "Mandurah", "Bunbury", "Fremantle", "Rockingham", "Geraldton"]
        }
      ]
    }
  ],

  /**
   * Helper to construct a clean Google Maps search query string
   * e.g. "Austin Texas roofing contractor" or "Milton Keynes gutter installation and cleaning"
   */
  buildSearchQuery(area, state, country, nicheKeyword) {
    const cleanArea = (area || '').trim();
    const cleanState = (state || '').trim();
    const cleanNiche = (nicheKeyword || '').trim();

    // If state is not already in area, include area + state
    let locStr = cleanArea;
    if (cleanState && !cleanArea.toLowerCase().includes(cleanState.toLowerCase())) {
      locStr = `${cleanArea} ${cleanState}`;
    }

    return `${locStr} ${cleanNiche}`.trim();
  },

  /**
   * Get all countries
   */
  getCountries() {
    return this.locations;
  },

  /**
   * Get states for a specific country
   */
  getStates(countryName) {
    const c = this.locations.find(l => l.country.toLowerCase() === (countryName || '').toLowerCase());
    return c ? c.states : [];
  },

  /**
   * Get areas for a specific state in a country
   */
  getAreas(countryName, stateName) {
    const states = this.getStates(countryName);
    const s = states.find(st => st.name.toLowerCase() === (stateName || '').toLowerCase());
    return s ? s.areas : [];
  },

  /**
   * Add a new country or area dynamically (extensibility for the future)
   */
  addCustomLocation(countryName, flag, stateName, areaName) {
    if (!countryName || !stateName || !areaName) return false;
    let countryObj = this.locations.find(l => l.country.toLowerCase() === countryName.toLowerCase());
    if (!countryObj) {
      countryObj = {
        country: countryName.trim(),
        code: countryName.slice(0, 2).toUpperCase(),
        flag: flag || "🌐",
        states: []
      };
      this.locations.push(countryObj);
    }

    let stateObj = countryObj.states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
    if (!stateObj) {
      stateObj = {
        name: stateName.trim(),
        areas: []
      };
      countryObj.states.push(stateObj);
    }

    if (!stateObj.areas.some(a => a.toLowerCase() === areaName.toLowerCase())) {
      stateObj.areas.push(areaName.trim());
    }

    return true;
  }
};

// Export for Node environments and browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeadDirectory;
}
if (typeof globalThis !== 'undefined') {
  globalThis.LeadDirectory = LeadDirectory;
}
if (typeof window !== 'undefined') {
  window.LeadDirectory = LeadDirectory;
}
