// Simulated OCR + allergen/dietary analysis engine.
// In production this calls Gemini Vision / Google ML Kit Text Recognition through
// the Node backend. Here we provide a deterministic sample-menu recognizer and
// an allergen/dietary flagging engine that runs entirely client-side.

export type MenuDish = {
  name: string;
  nameLocal?: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  dietTags: (
    | "vegetarian"
    | "vegan"
    | "halal"
    | "contains_pork"
    | "contains_alcohol"
    | "contains_beef"
  )[];
  spiceLevel: 0 | 1 | 2 | 3 | 4; // 0 none .. 4 fiery
  priceLKR: number;
  verdict: "safe" | "caution" | "avoid";
};

export const SAMPLE_MENUS: Record<string, MenuDish[]> = {
  "kandy-restaurant": [
    {
      name: "Rice & Curry (Vegetarian)",
      nameLocal: "එළවුළු බත් කරි",
      description:
        "Steamed rice with five curries: dhal, pumpkin, beetroot, spinach, and coconut sambol.",
      ingredients: [
        "rice",
        "lentils",
        "pumpkin",
        "beetroot",
        "spinach",
        "coconut",
        "chili",
        "curry leaves",
        "turmeric",
        "mustard",
      ],
      allergens: [],
      dietTags: ["vegetarian", "vegan", "halal"],
      spiceLevel: 3,
      priceLKR: 650,
      verdict: "safe",
    },
    {
      name: "Chicken Kottu",
      nameLocal: "චිකන් කොත්තු",
      description:
        "Chopped godamba roti stir-fried with chicken, eggs, vegetables and spices.",
      ingredients: [
        "godamba roti",
        "chicken",
        "egg",
        "carrot",
        "leek",
        "onion",
        "chili",
        "soy sauce",
        "ginger",
        "garlic",
      ],
      allergens: ["gluten", "egg", "soy"],
      dietTags: ["halal"],
      spiceLevel: 3,
      priceLKR: 900,
      verdict: "safe",
    },
    {
      name: "Devil Chicken",
      nameLocal: "ඩෙවිල් චිකන්",
      description:
        "Extra-spicy dry chicken curry with red chili, onions and curry leaves.",
      ingredients: [
        "chicken",
        "red chili",
        "onion",
        "curry leaves",
        "garlic",
        "vinegar",
      ],
      allergens: [],
      dietTags: ["halal"],
      spiceLevel: 4,
      priceLKR: 1100,
      verdict: "caution",
    },
    {
      name: "Pork Curry",
      nameLocal: "පාක් කරි",
      description: "Traditional pork curry with goraka and roasted spices.",
      ingredients: [
        "pork",
        "goraka",
        "chili",
        "curry powder",
        "garlic",
        "coconut milk",
      ],
      allergens: [],
      dietTags: ["contains_pork"],
      spiceLevel: 3,
      priceLKR: 1200,
      verdict: "avoid",
    },
    {
      name: "Wood Apple Juice",
      nameLocal: "දිවුල් ජූස්",
      description:
        "Refreshing juice from wood apple fruit with sugar and lime.",
      ingredients: ["wood apple", "sugar", "lime", "water"],
      allergens: [],
      dietTags: ["vegetarian", "vegan", "halal"],
      spiceLevel: 0,
      priceLKR: 250,
      verdict: "safe",
    },
  ],
  "colombo-restaurant": [
    {
      name: "Vegetable Roti",
      nameLocal: "එළවුළු රොටි",
      description:
        "Flatbread filled with spiced vegetables, folded and grilled.",
      ingredients: [
        "flour",
        "potato",
        "carrot",
        "onion",
        "chili",
        "curry leaves",
        "oil",
      ],
      allergens: ["gluten"],
      dietTags: ["vegetarian", "halal"],
      spiceLevel: 2,
      priceLKR: 180,
      verdict: "safe",
    },
    {
      name: "Fish Ambul Thiyal",
      nameLocal: "මාළු අම්බුල් තියල්",
      description: "Sour dry fish curry with goraka, black pepper and coconut.",
      ingredients: [
        "fish",
        "goraka",
        "black pepper",
        "garlic",
        "ginger",
        "curry leaves",
      ],
      allergens: ["fish", "seafood"],
      dietTags: ["halal"],
      spiceLevel: 3,
      priceLKR: 980,
      verdict: "caution",
    },
    {
      name: "Arrack Punch (alcohol)",
      description: "Coconut arrack-based cocktail with lime and soda.",
      ingredients: ["coconut arrack", "lime", "soda", "sugar"],
      allergens: [],
      dietTags: ["contains_alcohol"],
      spiceLevel: 0,
      priceLKR: 850,
      verdict: "avoid",
    },
    {
      name: "Prawn Curry",
      nameLocal: "ඉස්සෝ කරි",
      description: "Prawns in rich coconut milk curry with Sri Lankan spices.",
      ingredients: [
        "prawns",
        "coconut milk",
        "chili",
        "onion",
        "curry powder",
        "rampe",
      ],
      allergens: ["shellfish", "seafood"],
      dietTags: ["halal"],
      spiceLevel: 3,
      priceLKR: 1300,
      verdict: "caution",
    },
  ],
};

export const ALLERGENS = [
  "peanuts",
  "seafood",
  "shellfish",
  "fish",
  "gluten",
  "dairy",
  "egg",
  "soy",
  "tree_nuts",
  "sesame",
  "alcohol",
] as const;

export const DIET_OPTIONS = ["vegetarian", "vegan", "halal"] as const;

export const SPICE_LABELS = ["None", "Mild", "Medium", "Hot", "Fiery"] as const;
export const SPICE_COLORS = [
  "#64748b",
  "#1bb277",
  "#e2941b",
  "#ef4444",
  "#7f1d1d",
] as const;

// Analyze a dish against a user's dietary rules and allergens.
export type AnalysisResult = {
  verdict: "safe" | "caution" | "avoid";
  reasons: string[];
  matchedAllergens: string[];
  dietConflicts: string[];
  spiceLabel: string;
  spiceColor: string;
};

export function analyzeDish(
  dish: MenuDish,
  userAllergens: string[],
  userDiet: string[],
): AnalysisResult {
  const reasons: string[] = [];
  const matchedAllergens: string[] = [];
  const dietConflicts: string[] = [];

  // Allergen check
  for (const a of userAllergens) {
    if (
      dish.allergens.some(
        (da) =>
          da.toLowerCase().includes(a.toLowerCase()) ||
          a.toLowerCase().includes(da.toLowerCase()),
      )
    ) {
      matchedAllergens.push(a);
      reasons.push(`Contains your allergen: ${a}`);
    }
    if (
      dish.ingredients.some((ing) =>
        ing.toLowerCase().includes(a.toLowerCase()),
      )
    ) {
      if (!matchedAllergens.includes(a)) {
        matchedAllergens.push(a);
        reasons.push(`Contains ${a} (ingredient match)`);
      }
    }
  }

  // Diet check
  if (userDiet.includes("vegetarian")) {
    if (
      dish.dietTags.includes("contains_pork") ||
      dish.ingredients.some((i) =>
        /chicken|beef|pork|fish|prawn|mutton|lamb|meat/.test(i),
      )
    ) {
      dietConflicts.push("Not vegetarian");
      reasons.push("Contains meat — not vegetarian");
    }
  }
  if (userDiet.includes("vegan")) {
    if (
      dish.ingredients.some((i) =>
        /chicken|beef|pork|fish|prawn|mutton|lamb|meat|egg|milk|curd|cheese|butter|ghee/.test(
          i,
        ),
      )
    ) {
      dietConflicts.push("Not vegan");
      reasons.push("Contains animal products — not vegan");
    }
  }
  if (userDiet.includes("halal")) {
    if (dish.dietTags.includes("contains_pork")) {
      dietConflicts.push("Not halal");
      reasons.push("Contains pork — not halal");
    }
    if (dish.dietTags.includes("contains_alcohol")) {
      dietConflicts.push("Not halal");
      reasons.push("Contains alcohol — not halal");
    }
  }

  // Spice caution for foreign palates
  if (dish.spiceLevel >= 3) {
    reasons.push(`High spice level: ${SPICE_LABELS[dish.spiceLevel]}`);
  }

  let verdict: "safe" | "caution" | "avoid" = "safe";
  if (
    matchedAllergens.length > 0 ||
    dietConflicts.includes("Not halal") ||
    dietConflicts.includes("Not vegetarian") ||
    dietConflicts.includes("Not vegan")
  ) {
    verdict = "avoid";
  } else if (
    dish.verdict === "avoid" ||
    dish.spiceLevel >= 3 ||
    dish.verdict === "caution"
  ) {
    verdict = "caution";
  }

  return {
    verdict,
    reasons,
    matchedAllergens,
    dietConflicts,
    spiceLabel: SPICE_LABELS[dish.spiceLevel],
    spiceColor: SPICE_COLORS[dish.spiceLevel],
  };
}

// Simulated OCR: returns a menu from the "captured" image based on a chosen id.
export function runOcr(menuId: string): Promise<MenuDish[] | null> {
  return new Promise<MenuDish[] | null>((resolve) => {
    setTimeout(() => resolve(SAMPLE_MENUS[menuId] ?? null), 1400);
  });
}

// ---- Fake ticket verification ----
export type TicketField = {
  label: string;
  value: string;
  status: "ok" | "suspicious" | "missing";
  note?: string;
};

export type TicketVerification = {
  authentic: boolean;
  confidence: number;
  fields: TicketField[];
  flags: string[];
};

export function verifyTicket(raw: string): TicketVerification {
  const text = raw.trim().toUpperCase();
  const fields: TicketField[] = [];
  const flags: string[] = [];

  // Recognize common Sri Lanka Railways markers
  const hasRailways = /RAILWAYS|SRI LANKA RAILWAY|SLR/.test(text);
  const hasDate =
    /\d{1,2}[-/.\s](JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{1,2})/i.test(
      raw,
    );
  const hasPnr = /PNR|BOOKING|REF[:#]?\s*\w{4,}/i.test(raw);
  const hasClass = /(1ST|2ND|3RD|CLASS|EXPRESS|OBSERVATION|AC)/i.test(raw);
  const hasAmount = /LKR|RS\.?\s*\d{2,}/i.test(raw);
  const hasQr = /\b(QR|QRID|SHA256|HASH)\b/i.test(text);

  fields.push({
    label: "Operator",
    value: hasRailways ? "Sri Lanka Railways" : "Unknown / missing",
    status: hasRailways ? "ok" : "suspicious",
    note: hasRailways
      ? "Official operator detected"
      : "No official railway header",
  });
  fields.push({
    label: "Date",
    value: hasDate ? "Valid date format" : "Not found",
    status: hasDate ? "ok" : "missing",
  });
  fields.push({
    label: "Booking reference (PNR)",
    value: hasPnr ? "Present" : "Not found",
    status: hasPnr ? "ok" : "suspicious",
    note: hasPnr
      ? "Reference code found"
      : "No booking reference — common in fakes",
  });
  fields.push({
    label: "Class / Service",
    value: hasClass ? "Present" : "Not found",
    status: hasClass ? "ok" : "missing",
  });
  fields.push({
    label: "Fare amount",
    value: hasAmount ? "Present" : "Not found",
    status: hasAmount ? "ok" : "suspicious",
  });
  fields.push({
    label: "Security element",
    value: hasQr ? "Digital security code found" : "None detected",
    status: hasQr ? "ok" : "suspicious",
    note: hasQr ? "QR/hash present" : "No QR or security hash — high fake risk",
  });

  const okCount = fields.filter((f) => f.status === "ok").length;
  const suspicious = fields.filter((f) => f.status === "suspicious").length;

  if (!hasRailways) flags.push("Missing official operator header");
  if (!hasPnr) flags.push("No booking reference number");
  if (!hasQr) flags.push("No QR code or security hash");
  if (/PHOTOCOPY|COPY|SCAN/i.test(text))
    flags.push("Looks like a photocopy/scan");

  const confidence = Math.round((okCount / fields.length) * 100);
  const authentic = confidence >= 70 && suspicious <= 1;

  return { authentic, confidence, fields, flags };
}
