"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TabNav from "@/components/TabNav";
import LevelRole from "@/components/LevelRole";
import ReverseLookup from "@/components/ReverseLookup";
import AIAssistant from "@/components/AIAssistant";

type Tab = "level" | "lookup" | "assistant";

export interface JobContext {
  jobTitle: string;
  department: string;
  jobDescription: string;
  levelingAnswers: Record<string, string>;
}

export interface LevelingResult {
  recommendedLevel: string;
  confidence: string;
  reasoning: string;
  dimensionScores: {
    dimension: string;
    suggestedLevel: string;
    rationale: string;
  }[];
  questions: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("level");
  const [jobContext, setJobContext] = useState<JobContext>({
    jobTitle: "",
    department: "",
    jobDescription: "",
    levelingAnswers: {},
  });
  const [levelingResult, setLevelingResult] = useState<LevelingResult | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "level" && (
            <LevelRole
              jobContext={jobContext}
              onJobContextChange={setJobContext}
              levelingResult={levelingResult}
              onLevelingResult={setLevelingResult}
            />
          )}
          {activeTab === "lookup" && <ReverseLookup />}
          {activeTab === "assistant" && (
            <AIAssistant
              jobContext={jobContext}
              levelingResult={levelingResult}
            />
          )}
        </div>
      </main>
    </div>
  );
}
