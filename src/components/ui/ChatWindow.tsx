"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { Message } from "@/hooks/useChat";

interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  // Auto-scroll to the latest message
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Ask your first question about the document
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          role={message.role}
          content={message.content}
          isStreaming={message.isStreaming}
        />
      ))}
      {/* Invisible div at the bottom for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
