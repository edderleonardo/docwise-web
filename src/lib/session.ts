// Persists the active session id across reloads so a new upload can tell
// the backend which session it replaces (backend deletes it instead of
// letting it linger until the TTL).
const STORAGE_KEY = "docwise_session_id";

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function storeSessionId(sessionId: string) {
  window.localStorage.setItem(STORAGE_KEY, sessionId);
}

export function clearStoredSessionId() {
  window.localStorage.removeItem(STORAGE_KEY);
}
