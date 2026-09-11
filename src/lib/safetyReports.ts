import { firestore } from "@/lib/firebase";
import type { SafetyReport } from "@/lib/types";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const REPORT_CATEGORIES = [
  "unsafe_area",
  "scam",
  "bad_lighting",
  "suspicious_activity",
  "safe_area",
] as const;

const REPORT_SEVERITIES = [
  "safe",
  "low",
  "moderate",
  "high",
  "critical",
] as const;

type SafetyReportInput = Pick<
  SafetyReport,
  "category" | "severity" | "description" | "location_label" | "lat" | "lng"
> & { user_id: string };

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function validateReportInput(input: SafetyReportInput) {
  if (!input.user_id)
    throw new Error("You must be signed in to submit a report");
  if (!REPORT_CATEGORIES.includes(input.category)) {
    throw new Error("Choose a valid report category");
  }
  if (!REPORT_SEVERITIES.includes(input.severity)) {
    throw new Error("Choose a valid report severity");
  }
  if (!isValidCoordinate(input.lat, -90, 90)) {
    throw new Error("Latitude must be between -90 and 90");
  }
  if (!isValidCoordinate(input.lng, -180, 180)) {
    throw new Error("Longitude must be between -180 and 180");
  }
}

function toSafetyReport(
  id: string,
  data: Record<string, unknown>,
): SafetyReport {
  const timestamp = data.createdAt;
  const createdAt =
    timestamp instanceof Timestamp
      ? timestamp.toDate().toISOString()
      : typeof timestamp === "string"
        ? timestamp
        : new Date().toISOString();

  return {
    id,
    user_id: String(data.userId ?? ""),
    category: data.category as SafetyReport["category"],
    description: (data.description as string | null) ?? null,
    lat: Number(data.lat),
    lng: Number(data.lng),
    location_label: (data.locationLabel as string | null) ?? null,
    severity: data.severity as SafetyReport["severity"],
    upvotes: Number(data.upvotes ?? 0),
    created_at: createdAt,
  };
}

export async function loadSafetyReports(): Promise<SafetyReport[]> {
  if (!firestore) return [];

  const reportsQuery = query(
    collection(firestore, "safetyReports"),
    orderBy("createdAt", "desc"),
    limit(50),
  );
  const snapshot = await getDocs(reportsQuery);
  return snapshot.docs.map((report) =>
    toSafetyReport(report.id, report.data()),
  );
}

export async function createSafetyReport(input: SafetyReportInput) {
  if (!firestore) throw new Error("Firebase is not configured");
  validateReportInput(input);

  const report = await addDoc(collection(firestore, "safetyReports"), {
    userId: input.user_id,
    category: input.category,
    severity: input.severity,
    description: input.description.trim() || null,
    locationLabel: input.location_label.trim() || null,
    lat: input.lat,
    lng: input.lng,
    upvotes: 0,
    createdAt: serverTimestamp(),
  });

  return report.id;
}
