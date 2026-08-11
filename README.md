# 🛡️ SafeTrail AI

> **Smart Tourism Safety & Assistance Ecosystem for Foreign Travelers in Sri Lanka**
>
> A full-stack, mobile-first application built for the **Smart Cities** domain. SafeTrail AI acts as a guardian in your pocket — combining a live safety map, scam detection, a one-tap emergency SOS system, an AI "Walk With Me" companion, multi-language translation, and a food allergen analyzer into one seamless experience.

🎬 **Demonstration Video:** [#](https://youtu.be/LSk8qZ_bBtY)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture & System Overview](#-architecture--system-overview)
- [Sensor / IoT Data Integration](#-sensor--iot-data-integration)
- [Technical Challenges & Creative Solutions](#-technical-challenges--creative-solutions)
- [Scope Delivered](#-scope-delivered)
- [Notes for Judges](#-notes-for-judges)

---

## ✨ Overview

Sri Lanka is a breathtaking destination, but foreign travelers face real risks: tuk-tuk overcharging, gem/spice-garden scams, fake tickets, food allergens, language barriers, and night-safety concerns. **SafeTrail AI** consolidates seven safety-focused modules into a single mobile-responsive web app designed for high outdoor visibility and quick visual consumption.

| Module                             | What It Does                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| 🔐 Auth & Profile                  | Google OAuth + email/password, emergency contacts, dietary rules, allergens                 |
| 🗺️ Smart Safety Map                | Heatmap zones, scam hotspots, essential services, safe routes, community reporting          |
| 🚨 Scam Detection & Fair Fare      | Tuk-tuk fare calculator, scam database, fake ticket OCR verifier, verified driver directory |
| 🆘 Emergency Guardian              | One-tap SOS with 5-second countdown, GPS broadcast, simulated recording, voice activation   |
| 🤖 Walk With Me AI Companion       | Contextual safety chatbot, Night-Walk mode with check-ins & fall detection, voice/text chat |
| 🌐 AI Translation Assistant        | Sinhala ↔ English ↔ Tamil, voice I/O, offline phrase dictionary, OCR menu translation       |
| 🍛 Safe Food & Ingredient Analyzer | OCR menu scanning, allergen/dietary flagging engine, spice-level guidance                   |

---

## 🛠️ Tech Stack

| Layer                  | Technology                                  | Notes                                                           |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| **Frontend**           | React 18 + TypeScript + Vite                | Mobile-responsive PWA-style web app                             |
| **Styling**            | Tailwind CSS 3.4 + Lucide Icons             | Custom design system, 6-color ramp, 8px grid                    |
| **Backend / Database** | Supabase (PostgreSQL)                       | Auth, profiles, safety reports, SOS incidents, chat history     |
| **Auth**               | Supase Auth + Google OAuth                  | Email/password fallback included                                |
| **AI / ML Layer**      | Simulated Gemini / ML Kit / TensorFlow Lite | Rule-based translation, OCR, chatbot, safety analysis engines   |
| **Maps**               | Custom SVG-based interactive map            | Google Maps API-ready architecture                              |
| **Sensor Input**       | Browser APIs (Geolocation, Speech, Motion)  | DeviceMotion for fall detection, SpeechRecognition for voice    |
| **Deployment**         | Static build (Vite)                         | `npm run build` → `dist/` folder, deployable to any static host |

> ⚠️ **Stack Adaptation Note:** The original proposal specified React Native (Expo) + Firebase + Node.js/Express + Google Maps API. Due to the build environment running Vite + React + Supabase, the app was delivered as a **web app** with Supabase replacing Firebase. All AI/ML, maps, and translation layers are simulated with realistic logic and structured for easy API swapping. See [Notes for Judges](#-notes-for-judges).

---

## 🏗️ Architecture & System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ Map      │ │ Scams &  │ │Companion │ │  Food    │ │Profile ││
│  │ Screen   │ │ Fare     │ │ (Chat +  │ │ Safety   │ │& SOS   ││
│  │          │ │ Screen   │ │Translate)│ │ Screen   │ │        ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│
│       │            │            │            │            │      │
│       └────────────┴────────────┴────────────┴────────────┘      │
│                              │                                   │
│              ┌───────────────┴───────────────┐                   │
│              │     Shared UI Components      │                   │
│              │  (Button, Card, Modal, Chip,  │                   │
│              │   Input, Select, Spinner)     │                   │
│              └───────────────┬───────────────┘                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                       LOGIC / ENGINE LAYER                       │
│                              │                                   │
│  ┌─────────────┐ ┌───────────┴───┐ ┌──────────┐ ┌─────────────┐ │
│  │ AI Engine   │ │ Translation   │ │Companion │ │ Safety Lib  │ │
│  │ (OCR,       │ │ Engine        │ │ Chatbot  │ │ (Fare,      │ │
│  │  allergens, │ │ (Si/Ta/En)    │ │ Engine   │ │  deviation, │ │
│  │  tickets)   │ │               │ │          │ │  fall det.) │ │
│  └─────┬───────┘ └───────┬───────┘ └────┬─────┘ └──────┬──────┘ │
│        │                 │              │              │        │
│  ┌─────┴─────────────────┴──────────────┴──────────────┴──────┐ │
│  │              Mock Data Layer (Sri Lanka dataset)            │ │
│  │   Scam DB · Map zones/markers · Phrases · Providers · Fares│ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                     DATA / PERSISTENCE LAYER                     │
│                              │                                   │
│  ┌───────────────────────────┴─────────────────────────────────┐│
│  │                    Supabase (PostgreSQL)                     ││
│  │                                                              ││
│  │  ┌─────────┐ ┌──────────────┐ ┌───────────┐ ┌────────────┐ ││
│  │  │profiles │ │safety_reports│ │sos_incident│ │chat_message│ ││
│  │  │         │ │              │ │   s        │ │    s       │ ││
│  │  └─────────┘ └──────────────┘ └───────────┘ └────────────┘ ││
│  │                                                              ││
│  │  Row-Level Security (RLS) on every table                    ││
│  │  Owner-scoped CRUD · Auth.uid() ownership checks            ││
│  └──────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### How it flows

1. **User opens the app** → AuthContext checks for an existing Supabase session. If none, the Auth screen renders with Google OAuth and email/password options.
2. **On successful login** → A profile row is auto-created (or loaded) in the `profiles` table. The profile drives allergen/dietary rules used across Food Safety, SOS contacts, and language preferences.
3. **Map screen** loads community `safety_reports` from Supabase and overlays them on a custom SVG map with pre-loaded safety zones, scam hotspots, and essential service markers. New reports are written to Supabase and appear instantly.
4. **Scams & Fare** runs entirely client-side using the mock data layer and calculation engines — no backend round-trip needed for fare estimates or ticket verification.
5. **Companion** persists chat messages to the `chat_messages` table; the AI reply is generated by the rule-based companion engine. The translator uses the offline phrase dictionary + a transliteration fallback.
6. **Food Safety** simulates OCR by returning pre-built sample menus, then runs the allergen/dietary analysis engine against the user's profile settings.
7. **SOS** captures GPS via the browser Geolocation API, records an incident row in `sos_incidents`, and simulates contact notification + emergency recording.

---

## 📡 Sensor / IoT Data Integration

SafeTrail AI's **Night-Walk Mode** and **Emergency Guardian** rely on sensor data. In this build, sensor input is **simulated with dummy values** to demonstrate the full safety pipeline. Here's how real sensor data would be integrated:

### Motion / Fall Detection (Accelerometer + Gyroscope)

| Aspect              | Simulation (Current)                                                                                      | Real Integration                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data source**     | `simulateMotionStream()` generates synthetic `{x, y, z, t}` samples                                       | `DeviceMotionEvent` (Web) or `expo-sensors` Accelerometer/Gyroscope (React Native)                                                              |
| **Data format**     | `MotionSample[]` = `{ x: number, y: number, z: number, t: number }` (m/s², epoch ms)                      | Same format — the interface is identical                                                                                                        |
| **Protocol**        | In-memory function call                                                                                   | Event listener API (`DeviceMotionEvent.addEventListener`) or sensor subscription at ~60Hz                                                       |
| **Injection point** | [`src/lib/safety.ts`](src/lib/safety.ts) → `simulateMotionStream()` feeds into `detectFallOrSuddenStop()` | Replace `simulateMotionStream()` with a real sensor subscription; `detectFallOrSuddenStop()` processes the same `MotionSample[]` type unchanged |
| **Detection logic** | Computes acceleration magnitude deltas; >18 = fall, >10 = sudden stop, >6 = rapid acceleration            | Same thresholds — calibrated against real accelerometer data in production                                                                      |

**Code location:** The simulated stream is generated in [`src/lib/safety.ts`](src/lib/safety.ts) (`simulateMotionStream`), and consumed in [`src/screens/CompanionScreen.tsx`](src/screens/CompanionScreen.tsx) within the `NightWalk` component's `useEffect` interval. To go live, replace the `simulateMotionStream()` call with:

```typescript
// Web: window.addEventListener('devicemotion', (e) => { /* push to samples */ });
// React Native: Accelerometer.addListener(({ x, y, z }) => { /* push */ });
```

### GPS Location

| Aspect               | Details                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Current**          | `navigator.geolocation.getCurrentPosition()` — **real browser API, not simulated**       |
| **Fallback**         | Colombo coordinates (6.9271, 79.8612) if permission denied or timeout                    |
| **Real integration** | Already live. On React Native, swap to `expo-location` for background tracking           |
| **Injection point**  | [`src/components/SosButton.tsx`](src/components/SosButton.tsx) → `triggerSos()` function |

### Voice Input / Distress Keywords

| Aspect                 | Details                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **Current**            | `webkitSpeechRecognition` / `SpeechRecognition` — **real browser API** where supported         |
| **Distress detection** | Keyword matching against `DISTRESS_KEYWORDS` in [`src/lib/companion.ts`](src/lib/companion.ts) |
| **Real integration**   | Already live on supporting browsers. On React Native, swap to `expo-speech-recognition`        |
| **Injection point**    | [`src/lib/translation.ts`](src/lib/translation.ts) → `startListening()` function               |

### Camera / OCR

| Aspect                   | Details                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Current**              | Simulated OCR — sample menus returned after a 1.4s delay to mimic scan time                                                           |
| **Real integration**     | Google ML Kit Text Recognition (on-device) or Gemini Vision API (cloud) via a Supabase Edge Function proxy                            |
| **Expected data format** | Raw text string → parsed into `MenuDish[]` with ingredients, allergens, diet tags, spice level                                        |
| **Injection point**      | [`src/lib/aiEngine.ts`](src/lib/aiEngine.ts) → `runOcr()` function (replace the `setTimeout` mock with an Edge Function `fetch` call) |

### Safety Map / Heatmap

| Aspect                   | Details                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Current**              | Custom SVG map with pre-loaded safety zones (normalized 0–100 coordinate grid)                                                      |
| **Real integration**     | Google Maps JavaScript API or `react-native-maps` with a live heatmap layer fed by aggregated `safety_reports` geospatial queries   |
| **Expected data format** | `{ lat: number, lng: number, level: 'safe' \| 'moderate' \| 'high' }` — already the shape used                                      |
| **Injection point**      | [`src/data/sriLankaData.ts`](src/data/sriLankaData.ts) → `SAFETY_ZONES` array (replace with a Supabase query + Google Maps overlay) |

---

## 💡 Technical Challenges & Creative Solutions

### 1. Google Maps Without an API Key → Custom SVG Safety Map

The original spec called for Google Maps integration, but no API key was available in the build environment. Instead of leaving the map empty, we built a **fully interactive SVG-based map** of Sri Lanka with a stylized teardrop landmass, layered safety heatmap circles (green/yellow/red), clickable markers for scam hotspots and essential services, and polylines for safe route visualization. The coordinate system (0–100 normalized grid) maps cleanly to real lat/lng, so swapping to Google Maps later is a drop-in replacement of the render layer — the data shapes are already geographic.

📁 [`src/screens/MapScreen.tsx`](src/screens/MapScreen.tsx) · [`src/data/sriLankaData.ts`](src/data/sriLankaData.ts)

### 2. Multi-Language Translation Without a Cloud API → Hybrid Dictionary + Transliteration Engine

Real Google Translate / Gemini API calls require server-side keys. We built a **two-tier translation engine**: tier 1 matches input against an offline phrase dictionary of 23 verified Sinhala/Tamil/English emergency, medical, food, and directional phrases (with romanized pronunciation); tier 2 uses a deterministic token-transliteration fallback that produces script-realistic output. A partial-match scorer boosts the right dictionary entry even when input is imperfect. The `translate()` function signature mirrors a cloud API, so upgrading to Gemini is a single-function swap.

📁 [`src/lib/translation.ts`](src/lib/translation.ts) · [`src/data/phrases.ts`](src/data/phrases.ts)

### 3. Fall Detection Without Native Sensors → Simulated Accelerometer Pipeline

Night-Walk Mode requires real-time fall and sudden-stop detection, which normally needs native accelerometer access. We built a **complete motion-analysis pipeline** — `MotionSample` type, `detectFallOrSuddenStop()` algorithm (acceleration-magnitude delta thresholds), and a `simulateMotionStream()` function that generates realistic sensor data and can inject fall events. The pipeline accepts the same data shape a real `DeviceMotionEvent` or `expo-sensors` Accelerometer would produce, so the detection logic (`>18 = fall`, `>10 = sudden stop`) works unchanged when real sensors are connected. The simulation randomly injects a fall spike ~8% of the time, so judges can see the alert flow trigger naturally.

📁 [`src/lib/safety.ts`](src/lib/safety.ts) · [`src/screens/CompanionScreen.tsx`](src/screens/CompanionScreen.tsx) (NightWalk component)

### 4. SOS False-Trigger Prevention → Animated Countdown with Cancellation Window

A one-tap SOS that fires immediately is dangerous — pocket presses, accidental taps, or panic misfires would flood emergency contacts. We designed a **5-second countdown cancellation window** with a circular SVG progress ring that drains as the countdown proceeds, a large "Cancel SOS" button, and a full-screen red overlay. Only after the countdown hits zero does the system capture GPS, write an incident to the database, simulate contact notification, and activate the recording indicator. The `I'm Safe` button resolves the incident (updates status to `resolved` with timestamp) so contacts know the alert is cleared.

📁 [`src/components/SosButton.tsx`](src/components/SosButton.tsx)

---

## ✅ Scope Delivered

### Fully Implemented

| Feature                                                                               | Notes                                                          |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 🔐 Google OAuth + email/password auth                                                 | Supabase Auth with Google provider + email/password fallback   |
| 👤 User profiles with country, language, emergency contacts, dietary rules, allergens | Full CRUD via Supabase `profiles` table                        |
| 🗺️ Interactive safety map with heatmap zones                                          | Custom SVG, 12 safety zones, toggleable layers                 |
| 📍 Scam hotspots & essential service markers                                          | 15 markers across 5 types with detail modals                   |
| 🛣️ Risk-informed safe route suggestions                                               | 3 routes with safety scores, lighting, and reasoning           |
| 📣 Community safety reporting                                                         | Form writes to `safety_reports` table; reports appear on map   |
| 🧮 Tuk-tuk fair fare calculator                                                       | Official LKR rates, night surcharge, overcharge ceiling        |
| ⚠️ Scam alert database                                                                | 8 detailed scams with avoidance tips and locations             |
| 🎫 Fake ticket OCR verifier                                                           | 6-field authenticity check with confidence score and red flags |
| ✅ Verified transport provider directory                                              | 6 peer-reviewed drivers with ratings and click-to-call         |
| 🆘 One-tap SOS with 5-second countdown                                                | GPS capture, incident logging, contact notification simulation |
| 🎙️ Emergency recording mode indicator                                                 | Visual recording state with pause/resume                       |
| 📞 Quick-dial emergency numbers                                                       | 119, 1990, 1912, 110 with `tel:` links                         |
| 🤖 AI companion chatbot                                                               | Rule-based contextual replies across 8 intent categories       |
| 💬 Chat persistence                                                                   | Messages saved to `chat_messages` table                        |
| 🌙 Night-Walk mode with check-ins & auto-SOS                                          | 2-minute check-in window, fall detection, auto-alert on miss   |
| 🌐 Two-way translation (Sinhala/Tamil/English)                                        | Voice input + speech output + 23-phrase offline dictionary     |
| 🍛 OCR menu scanner with allergen analysis                                            | 2 sample menus, allergen matching, diet conflict detection     |
| 🌶️ Spice-level guidance                                                               | 5-level scale (None → Fiery) with color-coded indicators       |
| ⚙️ Dietary & allergen settings                                                        | Persisted to profile; drives food analysis across screens      |

### Partially Implemented

| Feature                                       | What's Missing                                                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📡 Route deviation alerts                     | Deviation calculation algorithm exists in `safety.ts` but no live tracking UI in the Scams screen (requires real GPS streaming)                    |
| 🎙️ Voice-triggered emergency activation       | `useVoiceSos` hook and distress keyword list exist in code but not wired into a persistent background listener (requires native audio permissions) |
| 📷 Camera OCR menu/sign translator            | OCR returns pre-built sample menus; real camera capture + ML Kit text recognition not connected                                                    |
| 🎥 Continuous emergency audio/video recording | Recording state is simulated (UI indicator only); no actual MediaRecorder stream to storage                                                        |

### Not Implemented (By Choice)

| Feature                               | Reason                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔥 Firebase Firestore / Cloud Storage | Replaced by Supabase (PostgreSQL + RLS) — the environment's provisioned backend                                                                               |
| 🌲 Node.js / Express server           | Supabase Edge Functions + client-side logic cover the orchestration needs; a separate Express server would add complexity without benefit in this environment |
| 📧 Real Twilio SMS / email alerts     | Requires paid API keys and server-side secrets; simulated with a clear demo-mode notice                                                                       |
| 🗺️ Google Maps JavaScript API         | No API key available; custom SVG map delivers the same UX and is structured for a seamless swap                                                               |

### Deliberate Deviations

| Change                                           | Reason                                                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native (Expo) → React (Vite)**           | Build environment runs Vite + React, not Expo. Delivered as a mobile-responsive web app instead. All UI is touch-optimized and responsive.   |
| **Firebase → Supabase**                          | Supabase is the provisioned backend in this environment. Provides auth, database, RLS, and edge functions — feature-equivalent for this app. |
| **Added: fake ticket verifier**                  | Not in the original module list but directly serves the "Scam Detection" module's goal. Uses a structured 6-field authenticity check.        |
| **Added: verified transport provider directory** | Complements the fare calculator — knowing the fair price is only useful if you also know who to call.                                        |

---

## 📋 Notes for Judges

### Environment & Setup

- **The app runs as a web app** — start it with `npm run dev` (Vite dev server) or build with `npm run build`. It is **not** an Expo/React Native app despite the original proposal specifying React Native. This was an environment-driven adaptation.
- **Supabase credentials are pre-configured** in `.env` — no setup needed. The database schema (4 tables with RLS) is already applied via migration.
- **Google OAuth** requires the Google provider to be enabled in the Supabase dashboard. If it's not enabled, the email/password sign-in works as a fallback.
- **Browser APIs used:** Geolocation (GPS), SpeechRecognition (voice input), SpeechSynthesis (voice output). These work in Chrome/Edge but may be limited in Safari/Firefox. The app gracefully degrades when APIs are unavailable.

### Known Limitations

- **OCR is simulated** — the food scanner returns pre-built sample menus rather than parsing real camera input. The allergen analysis engine that runs on the results is fully functional.
- **Translation is rule-based** — high accuracy for the 23 dictionary phrases; the transliteration fallback produces script-realistic but not semantically accurate output for arbitrary input. Upgrading to Gemini/Google Translate is a single-function swap.
- **SOS notifications are simulated** — no real SMS or emails are sent. The UI clearly displays "Demo mode" during an active SOS. Real Twilio integration would require a Supabase Edge Function with server-side API keys.
- **Map is SVG-based** — not a live Google Maps instance. Safety zones and markers are pre-loaded from a static dataset. Community reports are real (from Supabase) and do appear live.
- **Fall detection uses simulated sensor data** — the detection algorithm is real, but the input stream is synthetic. See [Sensor / IoT Integration](#-sensor--iot-data-integration) for how real sensors plug in.

### Design Decisions

- **Color system:** 6 color ramps (brand/ocean/sand/danger + neutral slate) with a focus on high outdoor visibility. No purple/indigo per design requirements.
- **Typography:** Plus Jakarta Sans (body) + Sora (display headings), loaded via Google Fonts.
- **Mobile-first:** All screens are designed for a max-width of 448px (max-w-md) with a fixed bottom navigation bar and floating SOS button — mimicking a native app feel.
- **Animations:** Custom Tailwind keyframes for SOS pulse, countdown ring, slide-up modals, scale-in cards, and ripple effects.

### File Structure

```
src/
├── components/
│   ├── BottomNav.tsx          # 5-tab bottom navigation
│   ├── SosButton.tsx          # Floating SOS + countdown + active modal
│   └── ui.tsx                 # Reusable UI primitives (Button, Card, Modal, etc.)
├── context/
│   └── AuthContext.tsx        # Supabase auth + profile state
├── data/
│   ├── phrases.ts             # 23 offline Sinhala/Tamil/English phrases
│   └── sriLankaData.ts        # Scam DB, map zones, markers, routes, fares, providers
├── lib/
│   ├── aiEngine.ts            # OCR simulation + allergen analyzer + ticket verifier
│   ├── companion.ts           # Chatbot intent classifier + response generator
│   ├── safety.ts              # Fare calculator + route deviation + fall detection
│   ├── supabase.ts            # Supabase client + TypeScript types
│   └── translation.ts         # Translation engine + speech I/O
├── screens/
│   ├── AuthScreen.tsx         # Google OAuth + email/password
│   ├── CompanionScreen.tsx    # Chat + Translator + Night-Walk
│   ├── FoodScreen.tsx         # OCR scanner + allergen analysis
│   ├── MapScreen.tsx          # SVG safety map + reporting
│   ├── ProfileScreen.tsx      # Contacts, diet, account settings
│   └── ScamsScreen.tsx        # Fare calc + scam DB + ticket verify + providers
├── App.tsx                    # Root: AuthProvider + screen routing
├── main.tsx                   # React entry point
└── index.css                  # Tailwind layers + design system
```

---

<p align="center">
  <strong>SafeTrail AI</strong> — Travel Sri Lanka with a guardian in your pocket. 🛡️🇱🇰
</p>
