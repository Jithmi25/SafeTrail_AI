// Fare calculator and route-deviation / fall-detection helpers.

import { TUKTUK_FARE } from "@/data/sriLankaData";

export type FareEstimate = {
  low: number;
  high: number;
  fair: number;
  breakdown: string[];
  isNight: boolean;
  currency: string;
};

export function calculateFare(
  km: number,
  minutes: number,
  isNight = false,
): FareEstimate {
  const base =
    TUKTUK_FARE.flagFall +
    km * TUKTUK_FARE.perKm +
    minutes * TUKTUK_FARE.perMin;
  const surcharge = isNight ? TUKTUK_FARE.nightSurcharge : 1;
  const fair = Math.round((base * surcharge) / 10) * 10;
  // Tourist overcharge common: high end ~ fair + 40%
  const low = Math.round((fair * 0.9) / 10) * 10;
  const high = Math.round((fair * 1.4) / 10) * 10;

  const breakdown = [
    `Flag fall: LKR ${TUKTUK_FARE.flagFall}`,
    `${km} km × LKR ${TUKTUK_FARE.perKm}/km = LKR ${Math.round(km * TUKTUK_FARE.perKm)}`,
    `${minutes} min × LKR ${TUKTUK_FARE.perMin}/min = LKR ${Math.round(minutes * TUKTUK_FARE.perMin)}`,
    isNight ? `Night surcharge ×${TUKTUK_FARE.nightSurcharge}` : null,
  ].filter(Boolean) as string[];

  return { low, high, fair, breakdown, isNight, currency: "LKR" };
}

// Estimate haversine distance between two normalized map points (0..100 grid
// mapped loosely to Sri Lanka ~432km x 232km).
export function estimateKm(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const kmPerUnitX = 4.32;
  const kmPerUnitY = 2.32;
  const dx = (x2 - x1) * kmPerUnitX;
  const dy = (y2 - y1) * kmPerUnitY;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}

// Route deviation detection — returns deviation score 0..1.
export function routeDeviation(
  routeX: number[],
  routeY: number[],
  currentX: number,
  currentY: number,
): number {
  let minDist = Infinity;
  for (let i = 0; i < routeX.length; i++) {
    const d = Math.hypot(routeX[i] - currentX, routeY[i] - currentY);
    if (d < minDist) minDist = d;
  }
  // 0 deviation if on route; 1 if > 18 units away.
  return Math.min(1, minDist / 18);
}

// Simulated fall / sudden-stop detection from an accelerometer sample stream.
export type MotionSample = { x: number; y: number; z: number; t: number };

export function detectFallOrSuddenStop(samples: MotionSample[]): {
  event: "none" | "fall" | "sudden_stop" | "rapid_acceleration";
  magnitude: number;
} {
  if (samples.length < 3) return { event: "none", magnitude: 0 };
  const mags = samples.map((s) => Math.sqrt(s.x ** 2 + s.y ** 2 + s.z ** 2));
  let maxDelta = 0;
  for (let i = 2; i < mags.length; i++) {
    const delta = Math.abs(mags[i] - mags[i - 2]);
    if (delta > maxDelta) maxDelta = delta;
  }
  if (maxDelta > 18) return { event: "fall", magnitude: maxDelta };
  if (maxDelta > 10) return { event: "sudden_stop", magnitude: maxDelta };
  if (maxDelta > 6) return { event: "rapid_acceleration", magnitude: maxDelta };
  return { event: "none", magnitude: maxDelta };
}

// Generate a simulated motion stream for demo purposes.
export function simulateMotionStream(
  durationMs = 8000,
  inject = false,
): MotionSample[] {
  const samples: MotionSample[] = [];
  const start = Date.now() - durationMs;
  const count = Math.floor(durationMs / 250);
  for (let i = 0; i < count; i++) {
    let x = (Math.random() - 0.5) * 2;
    let y = (Math.random() - 0.5) * 2;
    let z = 9.8 + (Math.random() - 0.5) * 1.5;
    if (inject && i === Math.floor(count / 2)) {
      // Inject a fall-like spike
      x = 14;
      y = -10;
      z = -2;
    }
    samples.push({ x, y, z, t: start + i * 250 });
  }
  return samples;
}
