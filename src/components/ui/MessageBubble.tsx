import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm
          ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          // User messages — plain text, no markdown needed
          <p>{content}</p>
        ) : (
          // Assistant messages — render markdown
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
            {/* Blinking cursor while streaming */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-0.5" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
