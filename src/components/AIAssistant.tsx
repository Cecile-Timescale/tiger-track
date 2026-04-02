"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

export default function AIAssistant({ messages, onMessagesChange }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    onMessagesChange(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m, idx) => m.role !== "assistant" || idx > 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      onMessagesChange([
        ...updatedMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      onMessagesChange([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. Please make sure the ANTHROPIC_API_KEY is configured and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What distinguishes a P3 from a P4?",
    "What does a M5 Director need to demonstrate?",
    "How is VP different from Senior Director?",
    "Help me assess value-fit for a Bar Raiser interview",
    "What level would a team lead with 5 years experience be?",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-[#1a365d] text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="font-semibold">$1</strong>'
                    )
                    .replace(/\n/g, "<br />"),
                }}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(q);
                }}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about job leveling, career progression, or bar raiser assessments..."
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#1a365d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4a7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
