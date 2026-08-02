// Sri Lanka tourism safety data — mock dataset simulating a backend API response.
// Coordinates use a normalized 0-100 SVG-space grid mapped to Sri Lanka's geography.

export type ScamEntry = {
  id: string;
  title: string;
  category:
    | "gems"
    | "spice_garden"
    | "temple_closed"
    | "transport"
    | "fake_ticket"
    | "gem_shop"
    | "street_scam";
  description: string;
  howToAvoid: string;
  warningLevel: "caution" | "high" | "critical";
  commonLocations: string[];
};

export const SCAM_DATABASE: ScamEntry[] = [
  {
    id: "scam-1",
    title: "Gem & Jewelry Overpricing",
    category: "gems",
    description:
      'A "guide" or tuk-tuk driver offers a free ride to a gem shop where staff use high-pressure tactics to sell low-quality stones at inflated prices, claiming huge resale value back home.',
    howToAvoid:
      "Only buy gems from government-registered dealers with a National Gem & Jewellery Authority certificate. Never accept free transport to a shop.",
    warningLevel: "critical",
    commonLocations: ["Colombo", "Kandy", "Galle"],
  },
  {
    id: "scam-2",
    title: 'Spice Garden "Free Tour"',
    category: "spice_garden",
    description:
      "Drivers detour to a private spice garden offering a free tour and herbal consultation, ending with aggressive sales of overpriced herbal products and oils.",
    howToAvoid:
      "Stick to the official Spice Garden in Kandy. Decline unscheduled stops. If taken to one unexpectedly, leave without buying.",
    warningLevel: "high",
    commonLocations: ["Kandy", "Matale", "En route to Sigiriya"],
  },
  {
    id: "scam-3",
    title: '"Temple Closed" Trick',
    category: "temple_closed",
    description:
      "Someone near a temple tells you it is closed for a local holiday, then offers to take you to an alternative viewpoint or shop instead. The temple is actually open.",
    howToAvoid:
      "Ignore the claim and walk to the entrance to verify. Official temples have posted hours and ticket counters.",
    warningLevel: "high",
    commonLocations: ["Temple of the Tooth (Kandy)", "Gangaramaya (Colombo)"],
  },
  {
    id: "scam-4",
    title: "Tuk-Tuk Meter Refusal & Overcharging",
    category: "transport",
    description:
      "Drivers refuse to use the meter and quote 3-5x the fair price, especially near tourist sites, airports, and hotels.",
    howToAvoid:
      "Insist on the meter, or agree the fare before getting in. Use the SafeTrail fare calculator to know the fair range. Pick a verified driver from the directory.",
    warningLevel: "high",
    commonLocations: [
      "Colombo Fort",
      "Airport (Katunayake)",
      "Galle Fort",
      "Kandy Lake",
    ],
  },
  {
    id: "scam-5",
    title: "Fake Train & Bus Tickets",
    category: "fake_ticket",
    description:
      'Unofficial sellers near stations offer "express" or "reserved" tickets that are photocopies or already used. Victims are turned away at the gate.',
    howToAvoid:
      "Buy tickets only at official station counters or the Sri Lanka Railways website. Scan any ticket with the SafeTrail ticket verifier before trusting it.",
    warningLevel: "critical",
    commonLocations: ["Colombo Fort Station", "Kandy Station", "Ella Station"],
  },
  {
    id: "scam-6",
    title: "Beach Vendor Switcheroo",
    category: "street_scam",
    description:
      "A beach vendor hands you an item to hold or try, then demands payment claiming you agreed to buy it. Companions may block your exit.",
    howToAvoid:
      "Do not accept items into your hands unless you intend to buy. Walk firmly away; do not engage in extended haggling under pressure.",
    warningLevel: "caution",
    commonLocations: ["Mirissa", "Unawatuna", "Hikkaduwa"],
  },
  {
    id: "scam-7",
    title: '"Free" Friendship Bracelet',
    category: "street_scam",
    description:
      'A friendly stranger ties a bracelet on your wrist as a "gift from Sri Lanka," then demands a donation and makes a scene if you refuse.',
    howToAvoid:
      "Keep your hands close and decline politely but firmly before they can tie anything. Do not stop walking.",
    warningLevel: "caution",
    commonLocations: ["Galle Fort", "Colombo waterfront", "Kandy"],
  },
  {
    id: "scam-8",
    title: "Tour Guide Impersonation",
    category: "gem_shop",
    description:
      "A well-dressed person at a historical site claims to be an official guide, gives a brief talk, then demands a large fee or steers you to a shop.",
    howToAvoid:
      "Only hire guides with official tourism board ID badges. Confirm the price before accepting any tour.",
    warningLevel: "high",
    commonLocations: ["Sigiriya", "Anuradhapura", "Polonnaruwa"],
  },
];

export type ServiceProvider = {
  id: string;
  name: string;
  type: "tuk_tuk" | "taxi" | "guide" | "tour";
  rating: number;
  reviews: number;
  phone: string;
  area: string;
  verified: boolean;
  notes: string;
};

export const VERIFIED_PROVIDERS: ServiceProvider[] = [
  {
    id: "p1",
    name: "Saman Tuk-Tuk Tours",
    type: "tuk_tuk",
    rating: 4.9,
    reviews: 214,
    phone: "+94 77 123 4567",
    area: "Colombo",
    verified: true,
    notes: "Meter always on. English speaking.",
  },
  {
    id: "p2",
    name: "Nuwan City Rides",
    type: "tuk_tuk",
    rating: 4.8,
    reviews: 176,
    phone: "+94 71 234 5678",
    area: "Kandy",
    verified: true,
    notes: "Female-friendly, night rides OK.",
  },
  {
    id: "p3",
    name: "Galle Heritage Taxi",
    type: "taxi",
    rating: 4.7,
    reviews: 98,
    phone: "+94 76 345 6789",
    area: "Galle",
    verified: true,
    notes: "AC sedan, airport transfers.",
  },
  {
    id: "p4",
    name: "Priya Lanka Tours",
    type: "tour",
    rating: 5.0,
    reviews: 341,
    phone: "+94 70 456 7890",
    area: "Island-wide",
    verified: true,
    notes: "Licensed guide. Cultural Triangle expert.",
  },
  {
    id: "p5",
    name: "Ella Mountain Drivers",
    type: "tuk_tuk",
    rating: 4.6,
    reviews: 87,
    phone: "+94 78 567 8901",
    area: "Ella",
    verified: true,
    notes: "Hill country routes, sunrise trips.",
  },
  {
    id: "p6",
    name: "Mihir Lanka Guides",
    type: "guide",
    rating: 4.9,
    reviews: 122,
    phone: "+94 77 678 9012",
    area: "Sigiriya",
    verified: true,
    notes: "Official tourism-board badge.",
  },
];

// Map data — normalized 0..100 SVG coordinates loosely mapping Sri Lanka.
export type SafetyZone = {
  id: string;
  x: number;
  y: number;
  r: number;
  level: "safe" | "moderate" | "high";
  label: string;
};

export const SAFETY_ZONES: SafetyZone[] = [
  { id: "z1", x: 22, y: 40, r: 16, level: "moderate", label: "Colombo Fort" },
  {
    id: "z2",
    x: 20,
    y: 55,
    r: 14,
    level: "safe",
    label: "Galle Face & Cinnamon Gardens",
  },
  { id: "z3", x: 48, y: 52, r: 18, level: "moderate", label: "Kandy City" },
  {
    id: "z4",
    x: 58,
    y: 60,
    r: 12,
    level: "high",
    label: "Matale Road Corridor",
  },
  {
    id: "z5",
    x: 70,
    y: 75,
    r: 14,
    level: "safe",
    label: "Ella & Hill Country",
  },
  { id: "z6", x: 32, y: 78, r: 16, level: "safe", label: "Galle & Unawatuna" },
  { id: "z7", x: 40, y: 88, r: 12, level: "moderate", label: "Mirissa Coast" },
  {
    id: "z8",
    x: 62,
    y: 35,
    r: 12,
    level: "high",
    label: "Anuradhapura Outskirts",
  },
  {
    id: "z9",
    x: 55,
    y: 45,
    r: 14,
    level: "safe",
    label: "Sigiriya Cultural Triangle",
  },
  { id: "z10", x: 80, y: 88, r: 13, level: "moderate", label: "Arugam Bay" },
  { id: "z11", x: 25, y: 70, r: 10, level: "safe", label: "Hikkaduwa" },
  {
    id: "z12",
    x: 50,
    y: 18,
    r: 11,
    level: "moderate",
    label: "Jaffna Peninsula",
  },
];

export type MapMarker = {
  id: string;
  x: number;
  y: number;
  type: "scam_hotspot" | "hospital" | "police" | "embassy" | "tourist_center";
  label: string;
  detail?: string;
};

export const MAP_MARKERS: MapMarker[] = [
  {
    id: "m1",
    x: 23,
    y: 42,
    type: "scam_hotspot",
    label: "Pettah Market",
    detail: "Pickpocket & overcharging reports",
  },
  {
    id: "m2",
    x: 48,
    y: 53,
    type: "scam_hotspot",
    label: "Temple of the Tooth",
    detail: "Temple-closed trick & fake guides",
  },
  {
    id: "m3",
    x: 32,
    y: 79,
    type: "scam_hotspot",
    label: "Galle Fort",
    detail: "Bracelet & vendor pressure scams",
  },
  {
    id: "m4",
    x: 40,
    y: 89,
    type: "scam_hotspot",
    label: "Mirissa Beach",
    detail: "Vendor switcheroo reports",
  },
  {
    id: "m5",
    x: 21,
    y: 52,
    type: "hospital",
    label: "National Hospital Colombo",
    detail: "24/7 emergency",
  },
  {
    id: "m6",
    x: 49,
    y: 51,
    type: "hospital",
    label: "Kandy General Hospital",
    detail: "24/7 emergency",
  },
  {
    id: "m7",
    x: 33,
    y: 77,
    type: "hospital",
    label: "Karapitiya Hospital Galle",
    detail: "Teaching hospital",
  },
  {
    id: "m8",
    x: 22,
    y: 48,
    type: "police",
    label: "Colombo Fort Police",
    detail: "+94 11 243 3733",
  },
  {
    id: "m9",
    x: 48,
    y: 55,
    type: "police",
    label: "Kandy Police HQ",
    detail: "+94 81 222 3333",
  },
  {
    id: "m10",
    x: 19,
    y: 46,
    type: "embassy",
    label: "US Embassy Colombo",
    detail: "Galle Face Court",
  },
  {
    id: "m11",
    x: 20,
    y: 49,
    type: "embassy",
    label: "British High Commission",
    detail: "Galle Road",
  },
  {
    id: "m12",
    x: 21,
    y: 50,
    type: "embassy",
    label: "Indian High Commission",
    detail: "Galle Road",
  },
  {
    id: "m13",
    x: 23,
    y: 44,
    type: "tourist_center",
    label: "Colombo Tourist Info",
    detail: "SL Tourism Development Authority",
  },
  {
    id: "m14",
    x: 48,
    y: 56,
    type: "tourist_center",
    label: "Kandy Tourist Police",
    detail: "Tourist assistance unit",
  },
  {
    id: "m15",
    x: 55,
    y: 46,
    type: "tourist_center",
    label: "Sigiriya Visitor Center",
    detail: "Official info & tickets",
  },
];

export type SafeRoute = {
  id: string;
  name: string;
  from: string;
  to: string;
  distanceKm: number;
  estMinutes: number;
  safetyScore: number; // 0-100
  lit: boolean;
  rating: number;
  pathX: number[];
  pathY: number[];
  reason: string;
};

export const SAFE_ROUTES: SafeRoute[] = [
  {
    id: "r1",
    name: "Galle Road Coastal Route",
    from: "Colombo Fort",
    to: "Galle Fort",
    distanceKm: 124,
    estMinutes: 150,
    safetyScore: 92,
    lit: true,
    rating: 4.7,
    pathX: [23, 28, 32, 33],
    pathY: [42, 60, 75, 79],
    reason: "Well-lit main highway with frequent services and tourist centers.",
  },
  {
    id: "r2",
    name: "Kandy Hill Route",
    from: "Colombo",
    to: "Kandy",
    distanceKm: 116,
    estMinutes: 180,
    safetyScore: 84,
    lit: true,
    rating: 4.5,
    pathX: [23, 35, 45, 48],
    pathY: [42, 48, 52, 53],
    reason: "Main A1 highway, fuel stations and police posts along the way.",
  },
  {
    id: "r3",
    name: "Ella Scenic Route",
    from: "Kandy",
    to: "Ella",
    distanceKm: 140,
    estMinutes: 240,
    safetyScore: 78,
    lit: false,
    rating: 4.6,
    pathX: [48, 55, 65, 70],
    pathY: [53, 62, 72, 75],
    reason:
      "Beautiful but remote in stretches; travel in daylight recommended.",
  },
];

export type EssentialService = {
  id: string;
  type: "hospital" | "police" | "embassy" | "tourist_center";
  name: string;
  area: string;
  phone: string;
  hours: string;
  distanceKm?: number;
};

export const ESSENTIAL_SERVICES: EssentialService[] = [
  {
    id: "s1",
    type: "hospital",
    name: "National Hospital Colombo",
    area: "Colombo",
    phone: "+94 11 269 1111",
    hours: "24/7",
    distanceKm: 1.2,
  },
  {
    id: "s2",
    type: "hospital",
    name: "Kandy General Hospital",
    area: "Kandy",
    phone: "+94 81 222 2261",
    hours: "24/7",
    distanceKm: 0.8,
  },
  {
    id: "s3",
    type: "hospital",
    name: "Karapitiya Teaching Hospital",
    area: "Galle",
    phone: "+94 91 222 2261",
    hours: "24/7",
    distanceKm: 2.1,
  },
  {
    id: "s4",
    type: "police",
    name: "Colombo Fort Police",
    area: "Colombo",
    phone: "+94 11 243 3733",
    hours: "24/7",
    distanceKm: 0.5,
  },
  {
    id: "s5",
    type: "police",
    name: "Tourist Police Kandy",
    area: "Kandy",
    phone: "+94 81 222 3333",
    hours: "24/7",
    distanceKm: 0.6,
  },
  {
    id: "s6",
    type: "embassy",
    name: "US Embassy",
    area: "Colombo",
    phone: "+94 11 249 8500",
    hours: "8:00-17:00",
    distanceKm: 1.8,
  },
  {
    id: "s7",
    type: "embassy",
    name: "British High Commission",
    area: "Colombo",
    phone: "+94 11 539 0631",
    hours: "8:00-17:00",
    distanceKm: 1.9,
  },
  {
    id: "s8",
    type: "tourist_center",
    name: "SLTDA Tourist Information",
    area: "Colombo",
    phone: "+94 11 243 7061",
    hours: "8:00-20:00",
    distanceKm: 0.4,
  },
  {
    id: "s9",
    type: "tourist_center",
    name: "Sigiriya Visitor Center",
    area: "Sigiriya",
    phone: "+94 66 228 7028",
    hours: "7:00-17:30",
    distanceKm: 0.2,
  },
];

// Official tuk-tuk fare structure (Sri Lanka, 2024 reference rates in LKR).
export const TUKTUK_FARE = {
  flagFall: 80,
  perKm: 92,
  perMin: 2.5,
  nightSurcharge: 1.15, // 10pm-5am
  waitingPerMin: 2.0,
};

// Common Sri Lankan tourist routes for quick fare estimates.
export const FARE_ROUTES = [
  { id: "fr1", from: "Colombo Fort", to: "Galle Face", km: 3 },
  { id: "fr2", from: "Colombo Fort", to: "Kandy", km: 116 },
  { id: "fr3", from: "Kandy Lake", to: "Temple of the Tooth", km: 1.5 },
  { id: "fr4", from: "Galle Fort", to: "Unawatuna Beach", km: 5 },
  { id: "fr5", from: "Ella Station", to: "Little Adam's Peak", km: 3.5 },
  { id: "fr6", from: "Colombo", to: "Airport (Katunayake)", km: 35 },
  { id: "fr7", from: "Nuwara Eliya", to: "Hakgala Gardens", km: 16 },
  { id: "fr8", from: "Sigiriya", to: "Dambulla Cave Temple", km: 19 },
];

// Emergency numbers
export const EMERGENCY_NUMBERS = [
  { label: "Police Emergency", number: "119" },
  { label: "Ambulance / Suwa Sariya", number: "1990" },
  { label: "Tourist Police", number: "1912" },
  { label: "Fire & Rescue", number: "110" },
];
