"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const { resetAll } = useSessionState();
  const lastUserRef = useRef<string | null>(null);

  const currentUser = session?.user?.email ?? null;

  // Reset all per-tab state when a *different* user signs in, so a shared
  // machine doesn't carry over the previous person's in-progress work.
  useEffect(() => {
    if (currentUser && currentUser !== lastUserRef.current) {
      if (lastUserRef.current !== null) {
        resetAll();
      }
      lastUserRef.current = currentUser;
    }
  }, [currentUser, resetAll]);

  const handleSignOut = () => {
    clearSessionHistory();
    resetAll();
    lastUserRef.current = null;
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginGate />;
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
