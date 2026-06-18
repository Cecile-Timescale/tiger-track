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
import { SessionStateProvider, useSessionState } from "@/lib/sessionState";
import { clearSessionHistory } from "@/lib/sessionHistory";

type Tab = "level" | "lookup" | "barraiser" | "performance" | "compare" | "history" | "assistant";

function AuthenticatedShell({
  currentUser,
  onSignOut,
}: {
  currentUser: string;
  onSignOut: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("level");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header userEmail={currentUser} onSignOut={onSignOut} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {/*
            All tabs render unconditionally but are hidden when inactive.
            Mounting them once keeps form state, AI results and refinement
            context alive while the user moves between tabs in the same
            session. State itself lives in SessionStateProvider above so it
            also survives this shell remount, but mounting components keeps
            DOM-only state (focus, scroll position, etc.) intact.
          */}
          <div className={activeTab === "level" ? "" : "hidden"}>
            <LevelRole userEmail={currentUser} />
          </div>
          <div className={activeTab === "lookup" ? "" : "hidden"}>
            <ReverseLookup />
          </div>
          <div className={activeTab === "barraiser" ? "" : "hidden"}>
            <BarRaiser />
          </div>
          <div className={activeTab === "performance" ? "" : "hidden"}>
            <PerformanceImprovement />
          </div>
          <div className={activeTab === "compare" ? "" : "hidden"}>
            <LevelCompare />
          </div>
          {/* History is mounted only when active so it re-fetches each time
              the user opens the tab and reflects new entries from other tabs. */}
          {activeTab === "history" && <LevelHistory userEmail={currentUser} />}
          <div className={activeTab === "assistant" ? "" : "hidden"}>
            <AIAssistant />
          </div>
        </div>
      </main>
    </div>
  );
}

function HomeInner() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { resetAll } = useSessionState();

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
    // Reset all per-tab state so a new login starts fresh
    resetAll();
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("tiger_track_user");
    clearSessionHistory();
    setCurrentUser(null);
    resetAll();
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginGate onAuthenticated={handleAuthenticated} />;
  }

  return <AuthenticatedShell currentUser={currentUser} onSignOut={handleSignOut} />;
}

export default function Home() {
  return (
    <SessionStateProvider>
      <HomeInner />
    </SessionStateProvider>
  );
}
