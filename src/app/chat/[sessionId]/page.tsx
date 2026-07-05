"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStatus, deleteSession } from "@/lib/api";
import {
  clearStoredSessionId,
  getStoredSessionId,
  storeSessionId,
} from "@/lib/session";
import { useChat } from "@/hooks/useChat";
import { ChatWindow } from "@/components/ChatWindow";
import { QuotaBar } from "@/components/QuotaBar";

interface ChatInterfaceProps {
  sessionId: string;
  filename: string;
  maxQuestions: number;
  initialQuestionsUsed: number;
  onDelete: () => void;
}

/**
 * Rendered only after the session data is loaded, so useChat
 * initializes with the real question count instead of 0.
 */
function ChatInterface({
  sessionId,
  filename,
  maxQuestions,
  initialQuestionsUsed,
  onDelete,
}: ChatInterfaceProps) {
  const [question, setQuestion] = useState("");

  const { messages, sendMessage, isLoading, error, questionsUsed, canAsk } =
    useChat(sessionId, initialQuestionsUsed, maxQuestions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !canAsk) return;
    sendMessage(question.trim());
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border px-4 py-3">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">docwise</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground truncate max-w-[320px]">
              📄 {filename}
            </span>
            <button
              onClick={onDelete}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              title="Delete document and session"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <ChatWindow messages={messages} />

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="w-full max-w-3xl mx-auto text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border px-4 py-4"
      >
        <div className="w-full max-w-3xl mx-auto flex gap-3 items-center">
          {/* Questions-left ring */}
          <QuotaBar
            questionsUsed={questionsUsed}
            maxQuestions={maxQuestions}
          />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              canAsk
                ? "Ask a question about the document..."
                : "Question limit reached"
            }
            disabled={!canAsk}
            className="
              flex-1 bg-muted rounded-xl px-4 py-3 text-base
              text-foreground placeholder:text-muted-foreground
              border border-transparent focus:border-primary
              focus:outline-none transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          <button
            type="submit"
            disabled={!canAsk || !question.trim()}
            className="
              bg-primary text-primary-foreground
              rounded-xl px-5 py-3 text-base font-medium
              hover:bg-primary/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [filename, setFilename] = useState<string>("");
  const [maxQuestions, setMaxQuestions] = useState(20);
  const [initialQuestionsUsed, setInitialQuestionsUsed] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Fetch session info when page loads
  useEffect(() => {
    async function loadSession() {
      try {
        const status = await getStatus(sessionId);
        if (status.status !== "ready") {
          router.push("/");
          return;
        }
        setFilename(status.filename);
        setMaxQuestions(status.max_questions);
        setInitialQuestionsUsed(status.questions_used);
        // Track this as the active session so the next upload replaces it
        storeSessionId(sessionId);
        setIsReady(true);
      } catch {
        // Session not found — forget it and redirect to home
        if (getStoredSessionId() === sessionId) {
          clearStoredSessionId();
        }
        router.push("/");
      }
    }
    loadSession();
  }, [sessionId, router]);

  const handleDelete = async () => {
    try {
      await deleteSession(sessionId);
      clearStoredSessionId();
    } catch {
      // Best effort: the stored id stays around, so the next upload
      // replaces this session server-side even if the delete failed.
    } finally {
      router.push("/");
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ChatInterface
      sessionId={sessionId}
      filename={filename}
      maxQuestions={maxQuestions}
      initialQuestionsUsed={initialQuestionsUsed}
      onDelete={handleDelete}
    />
  );
}
