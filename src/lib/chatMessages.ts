import { firestore } from "@/lib/firebase";
import type { ChatMessage } from "@/lib/types";
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

function mapMessage(id: string, data: Record<string, unknown>): ChatMessage {
  const createdAt = data.createdAt;
  return {
    id,
    userId: String(data.userId ?? ""),
    role: data.role as ChatMessage["role"],
    content: String(data.content ?? ""),
    context: String(data.context ?? "companion"),
    createdAt:
      createdAt instanceof Timestamp
        ? createdAt.toDate().toISOString()
        : typeof createdAt === "string"
          ? createdAt
          : new Date().toISOString(),
  };
}

export async function loadChatMessages(userId: string) {
  if (!firestore || !userId) return [];
  const messagesQuery = query(
    collection(firestore, "profiles", userId, "chatMessages"),
    orderBy("createdAt", "asc"),
    limit(50),
  );
  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map((message) => mapMessage(message.id, message.data()));
}

export async function createChatMessage(input: {
  userId: string;
  role: ChatMessage["role"];
  content: string;
  context?: string;
}) {
  if (!firestore) throw new Error("Firebase is not configured");
  const message = await addDoc(
    collection(firestore, "profiles", input.userId, "chatMessages"),
    {
      userId: input.userId,
      role: input.role,
      content: input.content,
      context: input.context ?? "companion",
      createdAt: serverTimestamp(),
    },
  );
  return message.id;
}
