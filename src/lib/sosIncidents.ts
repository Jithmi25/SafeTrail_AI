import { firestore } from "@/lib/firebase";
import type { SosIncident } from "@/lib/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const INCIDENT_STATUSES = [
  "triggered",
  "acknowledged",
  "resolved",
  "cancelled",
] as const;

function mapIncident(id: string, data: Record<string, unknown>): SosIncident {
  const toIso = (value: unknown) =>
    value instanceof Timestamp
      ? value.toDate().toISOString()
      : typeof value === "string"
        ? value
        : new Date().toISOString();

  return {
    id,
    userId: String(data.userId ?? ""),
    status: data.status as SosIncident["status"],
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
    locationLabel: (data.locationLabel as string | null) ?? null,
    contactsNotified: Number(data.contactsNotified ?? 0),
    notes: (data.notes as string | null) ?? null,
    createdAt: toIso(data.createdAt),
    resolvedAt: data.resolvedAt ? toIso(data.resolvedAt) : null,
  };
}

function validateCoordinates(
  latitude: number | null,
  longitude: number | null,
) {
  if (
    latitude !== null &&
    (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
  ) {
    throw new Error("Latitude must be between -90 and 90");
  }
  if (
    longitude !== null &&
    (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
  ) {
    throw new Error("Longitude must be between -180 and 180");
  }
}

export async function createSosIncident(input: {
  userId: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  contactsNotified: number;
  notes?: string | null;
}) {
  if (!firestore) throw new Error("Firebase is not configured");
  if (!input.userId) throw new Error("You must be signed in to trigger SOS");
  validateCoordinates(input.latitude, input.longitude);

  const incident = await addDoc(collection(firestore, "sosIncidents"), {
    userId: input.userId,
    status: "triggered",
    latitude: input.latitude,
    longitude: input.longitude,
    locationLabel: input.locationLabel,
    contactsNotified: input.contactsNotified,
    notes: input.notes ?? null,
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });
  return incident.id;
}

export async function updateSosIncidentStatus(
  incidentId: string,
  userId: string,
  status: SosIncident["status"],
) {
  if (!firestore) throw new Error("Firebase is not configured");
  if (!INCIDENT_STATUSES.includes(status))
    throw new Error("Invalid SOS status");

  await updateDoc(doc(firestore, "sosIncidents", incidentId), {
    status,
    ...(status === "resolved" ? { resolvedAt: serverTimestamp() } : {}),
  });
  return userId;
}

export async function loadSosHistory(userId: string): Promise<SosIncident[]> {
  if (!firestore || !userId) return [];
  const incidentsQuery = query(
    collection(firestore, "sosIncidents"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50),
  );
  const snapshot = await getDocs(incidentsQuery);
  return snapshot.docs.map((incident) =>
    mapIncident(incident.id, incident.data()),
  );
}
