import { useState, useRef } from "react";
import { streamChat } from "@/lib/api";

// Shape of each message in the conversation
export interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean; // true while tokens are arriving
}

export function useChat(
  sessionId: string,
  initialQuestionsUsed: number,
  maxQuestions: number,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsUsed, setQuestionsUsed] = useState(initialQuestionsUsed);

  // useRef lets us read the latest messages without re-rendering
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendMessage = async (question: string) => {
    if (isLoading) return;
    if (questionsUsed >= maxQuestions) {
      setError(`Question limit reached (${maxQuestions} max)`);
      return;
    }

    // Add user message immediately — don't wait for the backend
    const userMessage: Message = { role: "user", content: question };
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Start the SSE connection
      const response = await streamChat(sessionId, question);

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Read the stream token by token
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the raw bytes to text
        const chunk = decoder.decode(value, { stream: true });

        // SSE format: each line is "data: {token}\n\n"
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const token = line.replace("data: ", "");
          if (token === "[DONE]") break;
          if (token.startsWith("[ERROR]")) {
            throw new Error(token.replace("[ERROR] ", ""));
          }

          // Accumulate tokens into the full response
          fullContent += token;

          // Update the last message in real time
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: fullContent,
              isStreaming: true,
            };
            return updated;
          });
        }
      }

      // Streaming done — mark message as complete
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullContent,
          isStreaming: false,
        };
        return updated;
      });

      // Increment question counter
      setQuestionsUsed((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");

      // Remove the empty assistant message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const questionsLeft = maxQuestions - questionsUsed;
  const canAsk = questionsLeft > 0 && !isLoading;

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    questionsUsed,
    questionsLeft,
    canAsk,
  };
}
