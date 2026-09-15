import { firestore } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export type ReferenceDataResult<T> = {
  data: T[];
  source: "firestore" | "fallback";
  error: string | null;
};

export async function loadReferenceCollection<T>(
  collectionName: string,
  fallback: T[],
): Promise<ReferenceDataResult<T>> {
  if (!firestore) {
    return {
      data: fallback,
      source: "fallback",
      error: "Firebase is not configured; using offline reference data.",
    };
  }

  try {
    const snapshot = await getDocs(
      query(collection(firestore, collectionName), orderBy("sortOrder", "asc")),
    );
    if (snapshot.empty) {
      return {
        data: fallback,
        source: "fallback",
        error:
          "Reference data is not seeded yet; using the bundled offline dataset.",
      };
    }
    return {
      data: snapshot.docs.map(
        (entry) => ({ id: entry.id, ...entry.data() }) as T,
      ),
      source: "firestore",
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      source: "fallback",
      error:
        error instanceof Error
          ? `Using offline reference data: ${error.message}`
          : "Using offline reference data.",
    };
  }
}
