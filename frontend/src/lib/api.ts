export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export type SSEEvent =
  | { type: "metadata"; mood: string; severity: number; is_emergency: boolean }
  | { type: "token"; content: string }
  | { type: "plan"; content: string[] }
  | { type: "done" };

export async function* streamChat(
  message: string,
  sessionId: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const jsonStr = line.slice("data: ".length);
      try {
        yield JSON.parse(jsonStr) as SSEEvent;
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export interface JournalResponse {
  detected_mood: string;
  severity: number;
  is_emergency: boolean;
}

export async function submitJournalEntry(entry: string): Promise<JournalResponse> {
  const res = await fetch(`${API_BASE_URL}/api/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry }),
  });
  if (!res.ok) throw new Error(`Journal request failed: ${res.status}`);
  return res.json();
}

export async function clearChatMemory(sessionId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
}
