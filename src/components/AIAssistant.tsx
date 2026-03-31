"use client";

import { useState, useRef, useEffect } from "react";
import type { JobContext } from "@/app/page";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  jobContext: JobContext;
}

export default function AIAssistant({ jobContext }: AIAssistantProps) {
  const hasContext =
    jobContext.jobTitle.trim() || jobContext.jobDescription.trim();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the Tiger Data Leveling Assistant. I can help you with:\n\n" +
        "• **Leveling questions** — Ask about what distinguishes one level from another\n" +
        "• **Role analysis** — Describe a role and I'll help determine the right level\n" +
        "• **Requirements guidance** — Ask what's needed for a specific level (e.g., \"What does a P4 need to demonstrate?\")\n" +
        "• **Career progression** — Understand what it takes to move from one level to the next\n\n" +
        (hasContext
          ? `I can see you're working on a role${jobContext.jobTitle ? ` for **${jobContext.jobTitle}**` : ""}. Feel free to ask me about it!\n\n`
          : "") +
        "How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContextPrefix = () => {
    if (!hasContext) return "";
    let ctx = "\n\n[CONTEXT FROM LEVEL A ROLE TAB]\n";
    if (jobContext.jobTitle) ctx += `Job Title: ${jobContext.jobTitle}\n`;
    if (jobContext.department)
      ctx += `Department: ${jobContext.department}\n`;
    if (jobContext.jobDescription)
      ctx += `Job Description:\n${jobContext.jobDescription}\n`;

    const answers = Object.entries(jobContext.levelingAnswers).filter(
      ([, v]) => v.trim()
    );
    if (answers.length > 0) {
      ctx += "\nLeveling Guidance Answers:\n";
      const labels: Record<string, string> = {
        impact: "Business Impact",
        complexity: "Ambiguity & Complexity",
        influence: "Influence Required",
        ownership: "Ownership & Autonomy",
        leadership: "Leadership Responsibility",
      };
      for (const [key, value] of answers) {
        ctx += `${labels[key] || key}: ${value}\n`;
      }
    }
    ctx += "[END CONTEXT]\n\n";
    return ctx;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepend context to the first user message in the conversation
      const contextPrefix = buildContextPrefix();
      const messagesForApi = [
        ...messages.filter(
          (m) => m.role !== "assistant" || messages.indexOf(m) > 0
        ),
        { role: "user", content: contextPrefix + userMessage },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
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

  const suggestedQuestions = hasContext
    ? [
        `What level would ${jobContext.jobTitle || "this role"} be?`,
        "What's missing from this JD to determine the level?",
        "How does this compare to one level higher?",
        "What should I clarify with the hiring manager?",
      ]
    : [
        "What distinguishes a P3 from a P4?",
        "What does a M5 Director need to demonstrate?",
        "How is VP different from Senior Director?",
        "What level would a team lead with 5 years experience be?",
      ];

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col"
      style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
    >
      {/* Context banner */}
      {hasContext && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 text-xs bg-[#F5FF80]/30 text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#F5FF80]/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Referencing{" "}
            <strong>{jobContext.jobTitle || "job description"}</strong> from the
            Level a Role tab
          </div>
        </div>
      )}

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
                  ? "bg-[#1A1A1A] text-white"
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
                  className="w-2 h-2 bg-[#FF5B29] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#FF5B29] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#FF5B29] rounded-full animate-bounce"
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
                className="text-xs bg-[#F5FF80]/30 text-[#1A1A1A] px-3 py-1.5 rounded-full hover:bg-[#F5FF80]/60 transition-colors border border-[#F5FF80]/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area with export bar */}
      <div className="border-t border-gray-200">
        {/* Export bar - visible when there are user messages */}
        {messages.length > 1 && (
          <div className="px-4 pt-3 pb-1 flex items-center justify-between bg-gray-50/80">
            <span className="text-xs text-gray-400">{messages.filter(m => m.role === "assistant").length - 1} response{messages.filter(m => m.role === "assistant").length - 1 !== 1 ? "s" : ""}</span>
            <ExportBar
              onCopy={() => {
                const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                return copyToClipboard(lastAssistant?.content || "");
              }}
              onCopyAll={() => {
                const text = messages
                  .map(m => `${m.role === "user" ? "You" : "Tiger Track AI"}:\n${m.content}`)
                  .join("\n\n---\n\n");
                return copyToClipboard(text);
              }}
              onExportPDF={() => {
                const sections = messages.map(m => ({
                  subheading: m.role === "user" ? "You" : "Tiger Track AI",
                  body: m.content.replace(/\*\*(.*?)\*\*/g, "$1"),
                  spacerAfter: 4,
                }));
                exportToPDF(
                  "AI Assistant Conversation",
                  `${messages.length} messages • ${new Date().toLocaleDateString()}`,
                  sections,
                  `tiger-track-chat-${Date.now()}.pdf`
                );
              }}
              copyLabel="Copy Last"
              copyAllLabel="Copy All"
            />
          </div>
        )}
        <div className="p-4 pt-2">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about job leveling..."
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[#1A1A1A] text-[#F5FF80] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
