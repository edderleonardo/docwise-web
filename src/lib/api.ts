// Base URL — reads from env var in production, falls back to local backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types that mirror the backend Pydantic schemas
export interface UploadResponse {
  session_id: string;
  filename: string;
  status: string;
  chunk_count: number;
  message: string;
}

export interface StatusResponse {
  session_id: string;
  filename: string;
  status: string;
  questions_used: number;
  max_questions: number;
  created_at: string;
  last_active: string;
}

export interface DeleteResponse {
  message: string;
  session_id: string;
}

export interface AppConfig {
  max_questions: number;
  max_pdf_size_mb: number;
  session_ttl_hours: number;
}

// Public limits configured in the backend — single source of truth
export async function getConfig(): Promise<AppConfig> {
  const response = await fetch(`${API_URL}/config`);

  if (!response.ok) {
    throw new Error("Failed to load config");
  }

  return response.json();
}

// Upload a PDF and get back a session_id
export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload document");
  }

  return response.json();
}

// Get session status — to check if document is ready
export async function getStatus(sessionId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_URL}/documents/status/${sessionId}`);

  if (!response.ok) {
    throw new Error("Session not found");
  }

  return response.json();
}

// Delete session — when user wants to change document
export async function deleteSession(
  sessionId: string,
): Promise<DeleteResponse> {
  const response = await fetch(`${API_URL}/documents/session/${sessionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete session");
  }

  return response.json();
}

// Chat — returns a ReadableStream for SSE
// This one is different — it doesn't return JSON, it returns a stream
export function streamChat(
  sessionId: string,
  question: string,
): Promise<Response> {
  return fetch(`${API_URL}/chat/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}
