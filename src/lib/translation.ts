// Simulated multi-language translation engine (Sinhala/Tamil ↔ English).
// Mirrors a Gemini/Google Translate backend endpoint. Uses the offline phrase
// dictionary for exact matches, then a rule-based fallback for common patterns.

import { PHRASES } from "@/data/phrases";

export type Lang = "en" | "si" | "ta";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
};

type TranslationResult = {
  translated: string;
  script?: string;
  romanized?: string;
  source: "dictionary" | "engine";
  confidence: number;
};

// Normalize text for matching.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DIRECTION_MAP: Record<string, string> = {
  left: "left",
  right: "right",
  straight: "straight",
  hospital: "hospital",
  station: "station",
  police: "police",
  help: "help",
  doctor: "doctor",
  spicy: "spicy",
  vegetarian: "vegetarian",
  halal: "halal",
  vegan: "vegan",
};

export function translate(
  text: string,
  from: Lang,
  to: Lang,
): TranslationResult {
  if (from === to) {
    return { translated: text, source: "engine", confidence: 1 };
  }

  const norm = normalize(text);

  // 1) Exact phrase dictionary match
  const exact = PHRASES.find((p) => {
    if (from === "en") return normalize(p.en) === norm;
    if (from === "si") return normalize(p.si) === norm;
    return normalize(p.ta) === norm;
  });
  if (exact) {
    const field = to === "en" ? "en" : to === "si" ? "si" : "ta";
    const romanized =
      to === "si" ? exact.siLatn : to === "ta" ? exact.taLatn : undefined;
    return {
      translated: exact[field],
      romanized,
      script: to === "en" ? "Latin" : to === "si" ? "Sinhala" : "Tamil",
      source: "dictionary",
      confidence: 0.99,
    };
  }

  // 2) Keyword-aware rule-based fallback
  const targetField = to === "en" ? "en" : to === "si" ? "si" : "ta";
  const romanField = to === "si" ? "siLatn" : to === "ta" ? "taLatn" : null;

  // Partial phrase match — find the highest-overlap dictionary phrase
  let best: { phrase: (typeof PHRASES)[number]; score: number } | null = null;
  for (const p of PHRASES) {
    const ref = normalize(p.en);
    const words = norm.split(" ").filter((w) => w.length > 2);
    const hits = words.filter((w) => ref.includes(w)).length;
    if (hits > 0 && (!best || hits > best.score))
      best = { phrase: p, score: hits };
  }
  if (best && best.score >= 2) {
    const p = best.phrase;
    const romanized = romanField ? (p as any)[romanField] : undefined;
    return {
      translated: (p as any)[targetField],
      romanized,
      script: to === "en" ? "Latin" : to === "si" ? "Sinhala" : "Tamil",
      source: "dictionary",
      confidence: 0.8,
    };
  }

  // 3) Token transliteration fallback (deterministic pseudo-translation)
  const tokens = text.split(" ").map((t) => {
    const key = t.toLowerCase().replace(/[^\p{L}]/gu, "");
    if (DIRECTION_MAP[key]) {
      const match = PHRASES.find((p) =>
        p.en.toLowerCase().includes(DIRECTION_MAP[key]),
      );
      if (match) return (match as any)[targetField];
    }
    return to === "en" ? t : transliterateToken(t, to);
  });

  const translated = tokens.join(" ");
  return {
    translated,
    romanized: to === "en" ? undefined : translated,
    script: to === "en" ? "Latin" : to === "si" ? "Sinhala" : "Tamil",
    source: "engine",
    confidence: 0.6,
  };
}

// Deterministic pseudo-transliteration so output looks like the target script.
function transliterateToken(token: string, to: Lang): string {
  if (to === "en") return token;
  const sinhalaSyllables = [
    "ක",
    "ග",
    "බ",
    "ද",
    "ප",
    "ම",
    "ය",
    "ර",
    "ව",
    "ස",
    "න",
    "ල",
    "ට",
    "ද",
  ];
  const tamilSyllables = [
    "க",
    "க",
    "ப",
    "த",
    "ம",
    "ய",
    "ர",
    "வ",
    "ச",
    "ந",
    "ல",
    "ட",
    "த",
    "ன",
  ];
  const pool = to === "si" ? sinhalaSyllables : tamilSyllables;
  let out = "";
  for (let i = 0; i < token.length; i++) {
    const code = token.charCodeAt(i);
    out += pool[(code + i) % pool.length];
  }
  // Add a vowel sign to make it script-realistic
  const vowel = to === "si" ? "ා" : "ா";
  return out + vowel;
}

// Speak text via the browser SpeechSynthesis API (best-effort).
export function speak(text: string, lang: Lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "en" ? "en-US" : lang === "si" ? "si-LK" : "ta-LK";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

// Listen via the browser SpeechRecognition API (best-effort).
export function startListening(
  lang: Lang,
  onResult: (text: string) => void,
  onEnd: () => void,
): (() => void) | null {
  const SR =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = lang === "en" ? "en-US" : lang === "si" ? "si-LK" : "ta-LK";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = (e: any) => onResult(e.results[0][0].transcript);
  rec.onend = onEnd;
  rec.start();
  return () => rec.stop();
}
