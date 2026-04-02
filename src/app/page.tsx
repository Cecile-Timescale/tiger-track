"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TabNav from "@/components/TabNav";
import LevelRole from "@/components/LevelRole";
import ReverseLookup from "@/components/ReverseLookup";
import BarRaiser from "@/components/BarRaiser";
import PerformanceImprovement from "@/components/PerformanceImprovement";
import LevelCompare from "@/components/LevelCompare";
import LevelHistory from "@/components/LevelHistory";
import AIAssistant from "@/components/AIAssistant";
import LoginGate from "@/components/LoginGate";

type Tab = "level" | "lookup" | "barraiser" | "performance" | "compare" | "history" | "assistant";

export interface JobContext {
  jobTitle: string;
  department: string;
  jobDescription: string;
  levelingAnswers: Record<string, string>;
}

export interface LevelingResult {
  recommendedLevel: string;
  mappedTitle?: string;
  confidence: string;
  reasoning: string;
  dimensionScores: {
    dimension: string;
    suggestedLevel: string;
    rationale: string;
  }[];
  questions: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm the Tiger Data Leveling Assistant. I can help you with:\n\n" +
    "• **Leveling questions** — Ask about what distinguishes one level from another\n" +
    "• **Role analysis** — Describe a role and I'll help determine the right level\n" +
    "• **Requirements guidance** — Ask what's needed for a specific level (e.g., \"What does a P4 need to demonstrate?\")\n" +
    "• **Career progression** — Understand what it takes to move from one level to the next\n" +
    "• **Bar Raiser assessment** — Evaluate value-fit and cultural alignment for candidates\n\n" +
    "How can I help you today?",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("level");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Lift AI Assistant messages to page level so they persist across tab switches
  const [chatMessages, setChatMessages] = useState<Message[]>([INITIAL_MESSAGE]);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("tiger_track_user");
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setIsCheckingSession(false);
  }, []);

  const handleAuthenticated = (email: string) => {
    setCurrentUser(email);
    // Reset chat for new session
    setChatMessages([INITIAL_MESSAGE]);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("tiger_track_user");
    setCurrentUser(null);
    // Clear all user data on sign out
    setChatMessages([INITIAL_MESSAGE]);
  };

  // Show nothing while checking session to avoid flash
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Show login gate if not authenticated
  if (!currentUser) {
    return <LoginGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header userEmail={currentUser} onSignOut={handleSignOut} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "level" && <LevelRole userEmail={currentUser} />}
          {activeTab === "lookup" && <ReverseLookup />}
          {activeTab === "barraiser" && <BarRaiser />}
          {activeTab === "performance" && <PerformanceImprovement />}
          {activeTab === "compare" && <LevelCompare />}
          {activeTab === "history" && <LevelHistory userEmail={currentUser} />}
          {activeTab === "assistant" && (
            <AIAssistant
              messages={chatMessages}
              onMessagesChange={setChatMessages}
            />
          )}
        </div>
      </main>
    </div>
  );
}
