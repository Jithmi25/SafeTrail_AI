// "Walk With Me" AI companion chatbot — rule-based contextual safety assistant.
// Simulates a Gemini-powered backend with domain knowledge about Sri Lanka travel safety.

type Intent =
  | "safety_tip"
  | "etiquette"
  | "scam_help"
  | "emergency_advice"
  | "reassurance"
  | "food"
  | "transport"
  | "translation_help"
  | "fallback";

const KEYWORDS: Record<Intent, string[]> = {
  safety_tip: [
    "safe",
    "safety",
    "danger",
    "night",
    "walk",
    "alone",
    "solo",
    "women",
    "female",
  ],
  etiquette: [
    "etiquette",
    "temple",
    "dress",
    "culture",
    "religion",
    "shoes",
    "cover",
    "respect",
    "buddha",
  ],
  scam_help: [
    "scam",
    "tuk tuk",
    "tuk-tuk",
    "tuk",
    "fare",
    "overcharg",
    "cheat",
    "rip",
    "fake",
    "gem",
  ],
  emergency_advice: [
    "help",
    "emergency",
    "sos",
    "rob",
    "stole",
    "attack",
    "lost",
    "police",
    "hospital",
  ],
  reassurance: [
    "scared",
    "afraid",
    "nervous",
    "worried",
    "anxious",
    "panic",
    "alone",
    "unsafe",
  ],
  food: [
    "food",
    "eat",
    "spicy",
    "curry",
    "restaurant",
    "allerg",
    "vegan",
    "vegetarian",
    "halal",
    "sick",
  ],
  transport: [
    "train",
    "bus",
    "taxi",
    "ride",
    "drive",
    "pickme",
    "uber",
    "transport",
    "ticket",
  ],
  translation_help: [
    "translate",
    "say",
    "language",
    "sinhala",
    "tamil",
    "phrase",
    "speak",
  ],
  fallback: [],
};

function classify(text: string): Intent {
  const t = text.toLowerCase();
  for (const intent of Object.keys(KEYWORDS) as Intent[]) {
    if (intent === "fallback") continue;
    if (KEYWORDS[intent].some((k) => t.includes(k))) return intent;
  }
  return "fallback";
}

const RESPONSES: Record<Intent, string[]> = {
  safety_tip: [
    "For night walks in Sri Lanka, stick to well-lit main roads and avoid empty beaches after dark. Keep your phone charged and your SOS button within reach. You're doing great staying aware.",
    "When walking alone, share your live location with a trusted contact. Stay on streets with foot traffic and open shops — avoid shortcuts through alleys, even if they're shorter.",
    "Solo female travelers: dress modestly outside beach resorts, avoid isolated bus stops after 9pm, and use PickMe or a verified SafeTrail driver rather than hailing random tuk-tuks at night.",
  ],
  etiquette: [
    "At Buddhist temples: remove your hat and shoes before entering, cover shoulders and knees, and never pose with your back to a Buddha statue or take selfies that appear disrespectful. It's actually illegal.",
    "A friendly 'ayubowan' (Sinhala) or 'vanakkam' (Tamil) with hands pressed together goes a long way. Use your right hand for giving and receiving — the left is considered unclean.",
    "Don't touch anyone's head, and don't point your feet at people or sacred objects — both are considered very rude in Sri Lankan culture.",
  ],
  scam_help: [
    "If a tuk-tuk driver refuses the meter, walk away and use the SafeTrail fare calculator to know the fair price before negotiating. Verified drivers in the directory always use the meter.",
    "The 'temple is closed' trick is common at the Temple of the Tooth and Gangaramaya. Ignore the claim and check the entrance yourself — they're almost always open during posted hours.",
    "Free rides to gem or spice shops are never free — you'll face high-pressure sales. Politely refuse any unscheduled stop, even if the driver insists it's 'on the way'.",
  ],
  emergency_advice: [
    "If you're in immediate danger, tap the red SOS button now — it starts a 5-second countdown, then alerts your contacts and local services with your GPS location. Call 119 for police.",
    "Lost? Open the Map tab and tap 'Essential Services' to find the nearest tourist police station — dial 1912 for the Tourist Police hotline anywhere in Sri Lanka.",
    "If something was stolen, go to the nearest police station to file a report — you'll need it for travel insurance. The Tourist Police speak English and are used to helping foreigners.",
  ],
  reassurance: [
    "It's completely normal to feel nervous — Sri Lanka is generally very welcoming to tourists. You've got safety tools right here with you, and thousands of solo travelers explore safely every day.",
    "Take a deep breath. You're prepared: you have your SOS button, live safety map, and verified contacts. Trust your instincts — if a place feels off, leave without explaining yourself.",
    "You're not alone in this. The Walk With Me companion is here whenever you need it. Want a quick safety check for your current area, or a friendly distraction?",
  ],
  food: [
    "Sri Lankan food can be fiery! If you're not used to spice, ask for 'nai miris naha' (no chili) or 'tharawalam lesin' (a little mild). Rice and curry is usually adjustable on request.",
    "For allergens, always scan the menu with the Food Safety tab before ordering. Watch for hidden shrimp paste in sambols, and cashew/milk in korma-style curries.",
    "Stick to busy restaurants with high turnover — the food is fresher. Bottled water is a must; avoid tap water and ice in rural areas. 'Thambili' (king coconut) is a safe, hydrating street drink.",
  ],
  transport: [
    "For trains, book reserved seats at a station counter or the Sri Lanka Railways site. The Kandy→Ella route is stunning — book the Observation car 30 days ahead in peak season.",
    "Use PickMe or Uber for reliable, tracked rides in Colombo and Kandy. For tuk-tuks, insist on the meter or agree the fare first — the SafeTrail fare calculator shows the fair range.",
    "Intercity buses are cheap but crowded and fast. Keep valuables in front pockets, and avoid night buses on mountain roads if you're a nervous traveler.",
  ],
  translation_help: [
    "Open the Translator tab for two-way Sinhala/Tamil translation. You can type or speak — tap the mic icon. Common emergency phrases are cached offline too.",
    "Most Sri Lankans in tourist areas speak basic English, but learning 'bohoma sthuthiyi' (thank you very much) and 'ayubowan' (hello) will earn you warm smiles everywhere.",
    "Stuck on a menu in Sinhala or Tamil? Use the Food Safety scanner — it reads the script and flags your allergens automatically.",
  ],
  fallback: [
    "I'm your Walk With Me safety companion. I can help with: staying safe at night, avoiding scams, local etiquette, food and spice advice, transport tips, and emergency steps. What's on your mind?",
    "Good question! I'm tuned for Sri Lanka travel safety. Try asking about tuk-tuk fares, temple etiquette, spicy food, night walks, or what to do in an emergency.",
    "I'm here to keep you safe and confident in Sri Lanka. Ask me about scams, safe routes, food allergens, or local phrases — or just say hi if you want some company on your walk.",
  ],
};

function pick(arr: string[], seed: number): string {
  return arr[seed % arr.length];
}

export function generateReply(userText: string): string {
  const intent = classify(userText);
  const seed = userText.length + userText.charCodeAt(0);
  return pick(RESPONSES[intent], seed);
}

// Periodic night-walk check-in prompts.
export const CHECKIN_PROMPTS = [
  "Check-in: are you okay? Tap to confirm.",
  "Still doing well? Tap 'I'm safe' to confirm.",
  "Safety check-in — tap to confirm you're alright.",
  "You've been walking a while. Tap to confirm you're safe.",
];

// Voice-trigger distress keywords.
export const DISTRESS_KEYWORDS = [
  "help me",
  "help",
  "emergency",
  "i'm in danger",
  "attacked",
  "sos",
  "somebody help",
  "call police",
  "call the police",
  "don't touch me",
  "get away",
];
