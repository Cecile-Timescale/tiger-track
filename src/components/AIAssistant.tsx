"use client";

import { useState, useRef, useEffect } from "react";
import {
  useSessionState,
  INITIAL_CHAT_MESSAGE,
  type ChatMessage,
} from "@/lib/sessionState";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";

export default function AIAssistant() {
  const { chatMessages: messages, setChatMessages } = useSessionState();
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
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setChatMessages(updatedMessages);
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
      setChatMessages([
        ...updatedMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setChatMessages([
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

  const handleClear = () => {
    setChatMessages([INITIAL_CHAT_MESSAGE]);
  };

  // Strip markdown emphasis when exporting to plain text/PDF so the output
  // reads naturally instead of showing literal asterisks.
  const cleanMarkdown = (s: string) =>
    s
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1");

  // Skip the seeded greeting; only export real exchanges.
  const exchangeMessages = messages.filter(
    (m, idx) => !(idx === 0 && m === INITIAL_CHAT_MESSAGE)
  );
  const hasExchange = exchangeMessages.some((m) => m.role === "user");

  const buildChatText = () => {
    let text = `TIGER DATA — AI ASSISTANT TRANSCRIPT\n`;
    text += `${"═".repeat(50)}\n`;
    text += `Exported: ${new Date().toLocaleString()}\n\n`;
    for (const m of exchangeMessages) {
      const speaker = m.role === "user" ? "You" : "Assistant";
      text += `${speaker}:\n${cleanMarkdown(m.content)}\n\n`;
      text += `${"-".repeat(40)}\n\n`;
    }
    return text;
  };

  const handleCopy = async () => copyToClipboard(buildChatText());

  const handleExportPDF = () => {
    if (!hasExchange) return;
    const sections: {
      heading?: string;
      subheading?: string;
      body?: string;
      spacerAfter?: number;
    }[] = [];

    let qaIndex = 0;
    for (let i = 0; i < exchangeMessages.length; i++) {
      const m = exchangeMessages[i];
      if (m.role === "user") {
        qaIndex += 1;
        sections.push({ heading: `Question ${qaIndex}` });
        sections.push({ body: cleanMarkdown(m.content) });
      } else {
        sections.push({ subheading: "Assistant" });
        sections.push({ body: cleanMarkdown(m.content), spacerAfter: 4 });
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    exportToPDF(
      "AI Assistant Transcript",
      `Exported ${new Date().toLocaleString()}`,
      sections,
      `tiger-track-assistant-${stamp}.pdf`
    );
  };

  const suggestedQuestions = [
    "What distinguishes a P3 from a P4?",
    "What does a M5 Director need to demonstrate?",
    "How is VP different from Senior Director?",
    "Help me assess value-fit for a Bar Raiser interview",
    "What level would a team lead with 5 years experience be?",
  ];

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col"
      style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
    >
      {/* Top bar with export controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-xs text-gray-500">
            {hasExchange
              ? `${exchangeMessages.filter((m) => m.role === "user").length} question${exchangeMessages.filter((m) => m.role === "user").length !== 1 ? "s" : ""} in this session`
              : "Ask anything about leveling, career progression, or Bar Raiser"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasExchange && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
            >
              Clear chat
            </button>
          )}
          <ExportBar
            onCopy={handleCopy}
            onExportPDF={handleExportPDF}
            copyLabel="Copy transcript"
          />
        </div>
      </div>

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
                  ? "bg-[#0a0a0a] text-[#F5FF80]"
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
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#0a0a0a] text-[#F5FF80] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
