"use client";

// sessionStorage-based fallback for leveling history. Used so that when the
// Ghost DB is unreachable we still keep history within the active browser
// session. Cleared automatically when the browser closes (sessionStorage
// semantics) and explicitly on sign-out.

export interface SessionHistoryEntry {
  id: number; // negative ids signal session-only entries
  user_email: string;
  job_title: string | null;
  department: string | null;
  recommended_level: string;
  confidence: string;
  reasoning: string;
  dimension_scores: {
    dimension: string;
    suggestedLevel: string;
    rationale: string;
  }[];
  clarifying_questions: string[];
  created_at: string;
  source: "session"; // marker so the UI can label these entries
}

const STORAGE_KEY = "tiger_track_history_session";

function readAll(): SessionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeAll(entries: SessionHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    // Quota or serialization failure — log but don't crash the UI
    console.error("sessionHistory writeAll failed", err);
  }
}

export interface SessionHistoryInput {
  userEmail: string;
  jobTitle?: string;
  department?: string;
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

export function saveSessionHistoryEntry(input: SessionHistoryInput): SessionHistoryEntry {
  const entries = readAll();
  // Use a strictly-decreasing negative id so session entries are stable and
  // never collide with positive DB ids.
  const minId = entries.reduce((acc, e) => Math.min(acc, e.id), 0);
  const entry: SessionHistoryEntry = {
    id: minId - 1,
    user_email: input.userEmail,
    job_title: input.jobTitle || null,
    department: input.department || null,
    recommended_level: input.recommendedLevel,
    confidence: input.confidence,
    reasoning: input.reasoning,
    dimension_scores: input.dimensionScores || [],
    clarifying_questions: input.questions || [],
    created_at: new Date().toISOString(),
    source: "session",
  };
  entries.push(entry);
  writeAll(entries);
  return entry;
}

export function getSessionHistoryEntries(userEmail: string): SessionHistoryEntry[] {
  return readAll()
    .filter((e) => e.user_email === userEmail)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function clearSessionHistory(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
