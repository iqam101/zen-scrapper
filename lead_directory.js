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
      id: "car-wash-detailing",
      name: "Car wash and auto detailing",
      icon: "🧽",
      description: "Hand car wash, mobile detailing, ceramic coating, paint correction, valeting, and fleet wash.",
      niches: [
        { name: "Hand car wash and valeting", note: "High-volume drive-in hand wash & full valet", keyword: "hand car wash valeting" },
        { name: "Mobile car wash and detailing", note: "Driveway & workplace on-demand mobile detailing van", keyword: "mobile car wash detailing van" },
        { name: "Auto detailing and paint correction", note: "Multi-stage machine polish & swirl removal", keyword: "auto detailing paint correction" },
        { name: "Ceramic coating and PPF", note: "Long-term protective coatings & paint protection film", keyword: "ceramic coating PPF paint protection film" },
        { name: "Automatic and drive-thru car wash", note: "Express conveyor & touchless car wash facilities", keyword: "automatic drive through car wash" },
        { name: "Touchless car wash", note: "High-pressure chemical wash without brushes", keyword: "touchless car wash" },
        { name: "Commercial fleet and truck wash", note: "B2B fleet washing for delivery vans and lorries", keyword: "commercial fleet truck wash" },
        { name: "Self-service jet wash", note: "24/7 coin-operated pressure wash bays", keyword: "self service jet wash car wash" },
        { name: "Car interior deep clean and steam detailing", note: "Stain removal, leather conditioning, ozone odor elimination", keyword: "car interior detailing deep clean" },
        { name: "Window tinting and vehicle wraps", note: "Ceramic window tint, chrome delete & vinyl wrap", keyword: "car window tinting vehicle wraps" },
        { name: "Paintless dent repair (PDR)", note: "Hail damage & door dings fixed without repainting", keyword: "paintless dent repair PDR" },
        { name: "Alloy wheel refurbishment", note: "Powder coating, curb rash fix & diamond cut repair", keyword: "alloy wheel refurbishment repair" },
        { name: "Engine bay and undercarriage wash", note: "Dry ice detailing & underbody rust prevention", keyword: "engine bay detailing undercarriage wash" }
      ]
    },
    {
      id: "auto-mobile",
      name: "Auto repair and mechanics",
      icon: "🚗",
      description: "Automotive mechanical diagnostics, body shop collision repair, and roadside assistance.",
      niches: [
        { name: "Auto repair shops", note: "Mechanical diagnostic and engine repairs", keyword: "auto repair mechanic shop" },
        { name: "Mobile mechanics", note: "On-site roadside and driveway repairs", keyword: "mobile mechanic service" },
        { name: "Auto body and collision repair", note: "Insurance collision restorations", keyword: "auto body collision repair shop" },
        { name: "Towing companies", note: "24-hour towing and flatbed transport", keyword: "towing company 24 hour" },
        { name: "Windshield replacement", note: "Mobile auto glass repair", keyword: "windshield replacement mobile auto glass" },
        { name: "Transmission repair specialists", note: "Gearbox rebuilds & clutch replacement", keyword: "transmission gearbox repair" },
        { name: "Brake and tire service", note: "Mobile tire fitting & brake pads", keyword: "brake repair mobile tire fitting" }
      ]
    },
    {
      id: "other-local-services",
      name: "Commercial, healthcare and local services",
      icon: "🏢",
      description: "High-ticket commercial operations, clinical practices, and property services.",
      niches: [
        { name: "Moving companies", note: "Long distance and local moves", keyword: "moving company local movers" },
        { name: "Commercial cleaning & janitorial", note: "Office, medical, and industrial cleaning", keyword: "commercial cleaning janitorial services" },
        { name: "Security systems & CCTV installation", note: "Smart surveillance, access control, and alarms", keyword: "cctv security camera installation" },
        { name: "Dumpster rental & skip hire", note: "Waste disposal, roll-off containers & skips", keyword: "dumpster rental skip hire waste management" },
        { name: "Home inspectors", note: "Pre-purchase home and roof inspections", keyword: "certified home inspector" },
        { name: "Property management", note: "Commercial and residential rental management", keyword: "property management company" },
        { name: "Cosmetic dentistry & dental implants", note: "High-ticket smile makeovers & implants", keyword: "cosmetic dentistry dental implants" },
        { name: "Veterinary hospital & clinic", note: "Emergency animal care & surgery", keyword: "veterinary hospital pet clinic" },
        { name: "Chiropractic & physiotherapy clinics", note: "Spinal decompression & sports rehab", keyword: "chiropractic physiotherapy clinic" },
        { name: "Med spas and aesthetic clinics", note: "Laser, skincare, and aesthetics", keyword: "med spa aesthetic skin clinic" }
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
    },
    {
      country: "Germany",
      code: "DE",
      flag: "🇩🇪",
      states: [
        {
          name: "Bavaria (Bayern)",
          areas: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Erlangen", "Bamberg"]
        },
        {
          name: "North Rhine-Westphalia (NRW)",
          areas: ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bonn", "Münster", "Aachen", "Bielefeld"]
        },
        {
          name: "Baden-Württemberg",
          areas: ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg", "Ulm", "Heilbronn", "Pforzheim"]
        },
        {
          name: "Berlin",
          areas: ["Berlin Mitte", "Charlottenburg", "Spandau", "Neukölln", "Pankow", "Tempelhof"]
        },
        {
          name: "Hesse (Hessen)",
          areas: ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach", "Hanau"]
        },
        {
          name: "Hamburg",
          areas: ["Hamburg City", "Altona", "Harburg", "Bergedorf", "Eimsbüttel"]
        },
        {
          name: "Lower Saxony (Niedersachsen)",
          areas: ["Hanover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen"]
        }
      ]
    },
    {
      country: "France",
      code: "FR",
      flag: "🇫🇷",
      states: [
        {
          name: "Île-de-France (Paris)",
          areas: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Montreuil", "Nanterre", "Créteil", "Versailles", "Argenteuil"]
        },
        {
          name: "Auvergne-Rhône-Alpes",
          areas: ["Lyon", "Saint-Étienne", "Grenoble", "Villeurbanne", "Clermont-Ferrand", "Annecy", "Chambéry"]
        },
        {
          name: "Provence-Alpes-Côte d'Azur",
          areas: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes", "Antibes"]
        },
        {
          name: "Occitanie",
          areas: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban"]
        },
        {
          name: "Nouvelle-Aquitaine",
          areas: ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle", "Bayonne"]
        },
        {
          name: "Grand Est",
          areas: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy", "Colmar"]
        }
      ]
    },
    {
      country: "Spain",
      code: "ES",
      flag: "🇪🇸",
      states: [
        {
          name: "Community of Madrid",
          areas: ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón"]
        },
        {
          name: "Catalonia",
          areas: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Mataró", "Tarragona", "Girona"]
        },
        {
          name: "Andalusia",
          areas: ["Seville", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera", "Almería", "Marbella", "Cádiz"]
        },
        {
          name: "Valencian Community",
          areas: ["Valencia", "Alicante", "Elche", "Castellón de la Plana", "Torrevieja", "Gandia"]
        },
        {
          name: "Basque Country",
          areas: ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo", "Getxo"]
        },
        {
          name: "Balearic Islands",
          areas: ["Palma de Mallorca", "Ibiza", "Calvià", "Manacor"]
        }
      ]
    },
    {
      country: "Italy",
      code: "IT",
      flag: "🇮🇹",
      states: [
        {
          name: "Lombardy",
          areas: ["Milan", "Brescia", "Monza", "Bergamo", "Como", "Varese", "Pavia", "Cremona"]
        },
        {
          name: "Lazio",
          areas: ["Rome", "Latina", "Guidonia Montecelio", "Fiumicino", "Tivoli", "Viterbo"]
        },
        {
          name: "Campania",
          areas: ["Naples", "Salerno", "Giugliano in Campania", "Caserta", "Torre del Greco", "Pozzuoli"]
        },
        {
          name: "Piedmont",
          areas: ["Turin", "Novara", "Alessandria", "Asti", "Moncalieri"]
        },
        {
          name: "Veneto",
          areas: ["Venice", "Verona", "Padua", "Vicenza", "Treviso", "Rovigo"]
        },
        {
          name: "Emilia-Romagna",
          areas: ["Bologna", "Parma", "Modena", "Reggio Emilia", "Ravenna", "Rimini", "Ferrara"]
        },
        {
          name: "Tuscany",
          areas: ["Florence", "Prato", "Livorno", "Arezzo", "Pistoia", "Pisa", "Lucca"]
        }
      ]
    },
    {
      country: "Netherlands",
      code: "NL",
      flag: "🇳🇱",
      states: [
        {
          name: "North Holland",
          areas: ["Amsterdam", "Haarlem", "Zaanstad", "Haarlemmermeer", "Alkmaar", "Hilversum", "Amstelveen"]
        },
        {
          name: "South Holland",
          areas: ["Rotterdam", "The Hague", "Leiden", "Dordrecht", "Zoetermeer", "Delft", "Gouda"]
        },
        {
          name: "Utrecht",
          areas: ["Utrecht City", "Amersfoort", "Veenendaal", "Zeist", "Nieuwegein"]
        },
        {
          name: "North Brabant",
          areas: ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Helmond", "Oss"]
        },
        {
          name: "Gelderland",
          areas: ["Nijmegen", "Arnhem", "Apeldoorn", "Ede", "Barneveld"]
        }
      ]
    },
    {
      country: "Ireland",
      code: "IE",
      flag: "🇮🇪",
      states: [
        {
          name: "Leinster",
          areas: ["Dublin", "Swords", "Dundalk", "Bray", "Navan", "Kilkenny", "Drogheda", "Naas"]
        },
        {
          name: "Munster",
          areas: ["Cork", "Limerick", "Waterford", "Ennis", "Tralee", "Killarney", "Clonmel"]
        },
        {
          name: "Connacht",
          areas: ["Galway", "Sligo", "Castlebar", "Ballina", "Athlone"]
        }
      ]
    },
    {
      country: "Switzerland",
      code: "CH",
      flag: "🇨🇭",
      states: [
        {
          name: "Zurich",
          areas: ["Zürich", "Winterthur", "Uster", "Dübendorf", "Dietikon"]
        },
        {
          name: "Geneva",
          areas: ["Geneva City", "Vernier", "Lancy", "Meyrin", "Carouge"]
        },
        {
          name: "Vaud",
          areas: ["Lausanne", "Yverdon-les-Bains", "Montreux", "Renens", "Nyon"]
        },
        {
          name: "Basel",
          areas: ["Basel City", "Riehen", "Allschwil", "Reinach"]
        },
        {
          name: "Bern",
          areas: ["Bern City", "Biel/Bienne", "Thun", "Köniz"]
        }
      ]
    },
    {
      country: "Belgium",
      code: "BE",
      flag: "🇧🇪",
      states: [
        {
          name: "Brussels-Capital",
          areas: ["Brussels City", "Schaerbeek", "Anderlecht", "Ixelles", "Uccle"]
        },
        {
          name: "Flanders",
          areas: ["Antwerp", "Ghent", "Bruges", "Leuven", "Mechelen", "Aalst", "Kortrijk", "Hasselt"]
        },
        {
          name: "Wallonia",
          areas: ["Charleroi", "Liège", "Namur", "Mons", "Tournai", "La Louvière"]
        }
      ]
    },
    {
      country: "Sweden",
      code: "SE",
      flag: "🇸🇪",
      states: [
        {
          name: "Stockholm County",
          areas: ["Stockholm", "Huddinge", "Nacka", "Södertälje", "Solna", "Täby", "Sollentuna"]
        },
        {
          name: "Västra Götaland",
          areas: ["Gothenburg", "Borås", "Mölndal", "Trollhättan", "Skövde"]
        },
        {
          name: "Skåne",
          areas: ["Malmö", "Helsingborg", "Lund", "Kristianstad", "Landskrona"]
        },
        {
          name: "Uppsala",
          areas: ["Uppsala City", "Enköping", "Bålsta"]
        }
      ]
    },
    {
      country: "Norway",
      code: "NO",
      flag: "🇳🇴",
      states: [
        {
          name: "Østlandet",
          areas: ["Oslo", "Drammen", "Fredrikstad", "Tønsberg", "Lillestrøm", "Sarpsborg", "Moss"]
        },
        {
          name: "Vestlandet",
          areas: ["Bergen", "Stavanger", "Sandnes", "Ålesund", "Haugesund"]
        },
        {
          name: "Trøndelag",
          areas: ["Trondheim", "Stjørdal", "Steinkjer"]
        }
      ]
    },
    {
      country: "Denmark",
      code: "DK",
      flag: "🇩🇰",
      states: [
        {
          name: "Capital Region",
          areas: ["Copenhagen", "Frederiksberg", "Gentofte", "Gladsaxe", "Helsingør", "Lyngby"]
        },
        {
          name: "Central Denmark",
          areas: ["Aarhus", "Randers", "Horsens", "Silkeborg", "Herning", "Viborg"]
        },
        {
          name: "Southern Denmark",
          areas: ["Odense", "Esbjerg", "Kolding", "Vejle", "Fredericia"]
        }
      ]
    },
    {
      country: "Poland",
      code: "PL",
      flag: "🇵🇱",
      states: [
        {
          name: "Masovian (Mazowieckie)",
          areas: ["Warsaw", "Radom", "Płock", "Siedlce", "Pruszków"]
        },
        {
          name: "Lesser Poland (Małopolskie)",
          areas: ["Kraków", "Tarnów", "Nowy Sącz", "Oświęcim"]
        },
        {
          name: "Lower Silesia (Dolnośląskie)",
          areas: ["Wrocław", "Wałbrzych", "Legnica", "Jelenia Góra"]
        },
        {
          name: "Silesian (Śląskie)",
          areas: ["Katowice", "Częstochowa", "Sosnowiec", "Gliwice", "Bielsko-Biała", "Zabrze"]
        },
        {
          name: "Greater Poland (Wielkopolskie)",
          areas: ["Poznań", "Kalisz", "Konin", "Piła", "Ostrów Wielkopolski"]
        }
      ]
    },
    {
      country: "Austria",
      code: "AT",
      flag: "🇦🇹",
      states: [
        {
          name: "Vienna",
          areas: ["Vienna City", "Favoriten", "Donaustadt", "Floridsdorf", "Ottakring"]
        },
        {
          name: "Styria",
          areas: ["Graz", "Leoben", "Kapfenberg", "Bruck an der Mur"]
        },
        {
          name: "Upper Austria",
          areas: ["Linz", "Wels", "Steyr", "Vöcklabruck"]
        },
        {
          name: "Salzburg",
          areas: ["Salzburg City", "Hallein", "Saalfelden"]
        },
        {
          name: "Tyrol",
          areas: ["Innsbruck", "Kufstein", "Telfs", "Schwaz"]
        }
      ]
    },
    {
      country: "Portugal",
      code: "PT",
      flag: "🇵🇹",
      states: [
        {
          name: "Lisbon District",
          areas: ["Lisbon", "Sintra", "Cascais", "Loures", "Amadora", "Oeiras", "Almada", "Setúbal"]
        },
        {
          name: "Porto District",
          areas: ["Porto", "Vila Nova de Gaia", "Matosinhos", "Maia", "Gondomar", "Póvoa de Varzim"]
        },
        {
          name: "Braga District",
          areas: ["Braga", "Guimarães", "Famalicão", "Barcelos"]
        },
        {
          name: "Faro (Algarve)",
          areas: ["Faro", "Portimão", "Loulé", "Albufeira", "Lagos", "Olhão"]
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
