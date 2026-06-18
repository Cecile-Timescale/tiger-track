"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// ── Shared types ──

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

export interface AIComparison {
  summary: string;
  dimensions: Record<string, string>;
}

export interface RoleRequirement {
  requirement: string;
  deliveryOutcome: string;
}

export interface WeeklyCheckpoint {
  week: string;
  focus: string;
  checkIn: string;
}

export interface PerformancePlan {
  deliveryIssues: string;
  roleRequirements: RoleRequirement[];
  levelContext: string;
  weeklyCheckpoints: WeeklyCheckpoint[];
  consequenceStatement: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Per-tab state slices ──

export interface LevelRoleState {
  jobTitle: string;
  department: string;
  jobDescription: string;
  guideAnswers: Record<string, string>;
  showGuideQuestions: boolean;
  result: LevelingResult | null;
  error: string | null;
  saveStatus: string | null;
  isAnalyzing: boolean;
}

const DIMENSION_KEYS = [
  "knowledgeExperience",
  "organizationalImpact",
  "innovationComplexity",
  "communicationInfluence",
  "leadershipTalentMgmt",
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];

export interface CompareRefinementEntry {
  feedback: string;
  appliedAt: string; // ISO timestamp
}

export interface LevelCompareState {
  leftCode: string;
  rightCode: string;
  jobTitle: string;
  department: string;
  activeDimension: DimensionKey;
  aiComparison: AIComparison | null;
  isLoadingAI: boolean;
  aiError: string | null;
  comparedFor: string;
  // refinement workflow
  refinements: CompareRefinementEntry[];
  showRefine: boolean;
  refineFeedback: string;
  isRefining: boolean;
  refineError: string | null;
}

export interface PerformanceState {
  employeeName: string;
  currentRole: string;
  department: string;
  currentLevel: string;
  targetLevel: string;
  gapDescription: string;
  strengths: string;
  participants: string;
  plan: PerformancePlan | null;
  error: string;
  isLoading: boolean;
  showRefine: boolean;
  refineFeedback: string;
  isRefining: boolean;
}

// ── Initial states ──

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
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

const initialLevelRole: LevelRoleState = {
  jobTitle: "",
  department: "",
  jobDescription: "",
  guideAnswers: {},
  showGuideQuestions: false,
  result: null,
  error: null,
  saveStatus: null,
  isAnalyzing: false,
};

const initialLevelCompare: LevelCompareState = {
  leftCode: "",
  rightCode: "",
  jobTitle: "",
  department: "",
  activeDimension: "knowledgeExperience",
  aiComparison: null,
  isLoadingAI: false,
  aiError: null,
  comparedFor: "",
  refinements: [],
  showRefine: false,
  refineFeedback: "",
  isRefining: false,
  refineError: null,
};

const initialPerformance: PerformanceState = {
  employeeName: "",
  currentRole: "",
  department: "",
  currentLevel: "",
  targetLevel: "",
  gapDescription: "",
  strengths: "",
  participants: "",
  plan: null,
  error: "",
  isLoading: false,
  showRefine: false,
  refineFeedback: "",
  isRefining: false,
};

// ── Context shape ──

type Updater<T> = (prev: T) => T;

interface SessionStateValue {
  levelRole: LevelRoleState;
  setLevelRole: (updater: Updater<LevelRoleState>) => void;

  levelCompare: LevelCompareState;
  setLevelCompare: (updater: Updater<LevelCompareState>) => void;

  performance: PerformanceState;
  setPerformance: (updater: Updater<PerformanceState>) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;

  resetAll: () => void;
}

const SessionStateContext = createContext<SessionStateValue | null>(null);

export function SessionStateProvider({ children }: { children: ReactNode }) {
  const [levelRole, setLevelRoleState] = useState<LevelRoleState>(initialLevelRole);
  const [levelCompare, setLevelCompareState] = useState<LevelCompareState>(initialLevelCompare);
  const [performance, setPerformanceState] = useState<PerformanceState>(initialPerformance);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);

  const setLevelRole = useCallback(
    (updater: Updater<LevelRoleState>) => setLevelRoleState((prev) => updater(prev)),
    []
  );
  const setLevelCompare = useCallback(
    (updater: Updater<LevelCompareState>) => setLevelCompareState((prev) => updater(prev)),
    []
  );
  const setPerformance = useCallback(
    (updater: Updater<PerformanceState>) => setPerformanceState((prev) => updater(prev)),
    []
  );
  const setChatMessages = useCallback(
    (messages: ChatMessage[]) => setChatMessagesState(messages),
    []
  );

  const resetAll = useCallback(() => {
    setLevelRoleState(initialLevelRole);
    setLevelCompareState(initialLevelCompare);
    setPerformanceState(initialPerformance);
    setChatMessagesState([INITIAL_CHAT_MESSAGE]);
  }, []);

  return (
    <SessionStateContext.Provider
      value={{
        levelRole,
        setLevelRole,
        levelCompare,
        setLevelCompare,
        performance,
        setPerformance,
        chatMessages,
        setChatMessages,
        resetAll,
      }}
    >
      {children}
    </SessionStateContext.Provider>
  );
}

export function useSessionState(): SessionStateValue {
  const ctx = useContext(SessionStateContext);
  if (!ctx) {
    throw new Error("useSessionState must be used within SessionStateProvider");
  }
  return ctx;
}
