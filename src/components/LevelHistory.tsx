"use client";

import { useState, useEffect, useCallback } from "react";
import { LEVELS, getTrackLabel } from "@/lib/levelGuide";
import { getSessionHistoryEntries } from "@/lib/sessionHistory";

interface HistoryEntry {
  id: number;
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
  source?: "db" | "session";
}

interface LevelHistoryProps {
  userEmail: string;
}

export default function LevelHistory({ userEmail }: LevelHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{
    ok: boolean;
    detail?: string;
  }>({ ok: true });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);

    // Always read session entries first — guaranteed to display even if DB is
    // unreachable, and they appear instantly without a network round-trip.
    const sessionEntries: HistoryEntry[] = getSessionHistoryEntries(userEmail).map(
      (e) => ({ ...e, source: "session" as const })
    );

    let dbEntries: HistoryEntry[] = [];
    let dbOk = true;
    let dbDetail: string | undefined;

    try {
      const response = await fetch(
        `/api/history?userEmail=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        dbEntries = ((data.history as HistoryEntry[]) || []).map((e) => ({
          ...e,
          source: "db" as const,
        }));
      } else {
        dbOk = false;
        dbDetail =
          data?.detail ||
          data?.error ||
          `Database returned ${response.status}`;
      }
    } catch (err) {
      dbOk = false;
      dbDetail = err instanceof Error ? err.message : "Network error";
    }

    // Merge: DB entries first (canonical), then session-only entries that
    // don't appear in the DB. We dedupe on the (created_at, recommended_level,
    // job_title) tuple so an entry that successfully wrote to the DB doesn't
    // show twice.
    const seen = new Set(
      dbEntries.map(
        (e) =>
          `${e.recommended_level}|${e.job_title ?? ""}|${e.created_at.slice(0, 16)}`
      )
    );
    const sessionOnly = sessionEntries.filter(
      (e) =>
        !seen.has(
          `${e.recommended_level}|${e.job_title ?? ""}|${e.created_at.slice(0, 16)}`
        )
    );

    const combined = [...dbEntries, ...sessionOnly].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1
    );

    setHistory(combined);
    setDbStatus({ ok: dbOk, detail: dbDetail });
    setIsLoading(false);
  }, [userEmail]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getTrackClass = (levelCode: string) => {
    const level = LEVELS.find(
      (l) => l.code.toLowerCase() === levelCode.toLowerCase()
    );
    return level?.track === "ic"
      ? "ic"
      : level?.track === "manager"
        ? "mgr"
        : "exec";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-sm">Loading history...</div>
      </div>
    );
  }

  const sessionCount = history.filter((h) => h.source === "session").length;
  const dbCount = history.filter((h) => h.source === "db").length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Leveling History
            </h2>
            <p className="text-sm text-gray-500">
              {history.length} leveling decision
              {history.length !== 1 ? "s" : ""} recorded
              {sessionCount > 0 && (
                <span className="text-amber-700">
                  {" "}
                  · {sessionCount} session-only
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Database status banner */}
        {!dbStatus.ok && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-800">
              Database unavailable — showing session-only history
            </p>
            {dbStatus.detail && (
              <p className="text-xs text-amber-700 mt-1 break-words">
                {dbStatus.detail}
              </p>
            )}
            <p className="text-xs text-amber-700 mt-1">
              Decisions made in this session will persist locally until you sign
              out or close the browser. Once the database is reachable again,
              new decisions will be saved permanently.
            </p>
          </div>
        )}

        {dbStatus.ok && sessionCount > 0 && dbCount === 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              All decisions on this page are session-only — they were saved
              before the database was available, or before sign-in. They will
              clear when this browser session ends.
            </p>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              No history yet
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Level a role to start building your audit trail.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const trackClass = getTrackClass(entry.recommended_level);
              const level = LEVELS.find(
                (l) =>
                  l.code.toLowerCase() ===
                  entry.recommended_level.toLowerCase()
              );

              return (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Summary row */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : entry.id)
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`level-badge ${trackClass} text-xs shrink-0`}
                      >
                        {entry.recommended_level}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-900 block truncate">
                          {entry.job_title || "Untitled Role"}
                          {entry.source === "session" && (
                            <span className="ml-2 text-[10px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              session-only
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.department
                            ? `${entry.department} · `
                            : ""}
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          entry.confidence === "High"
                            ? "text-green-700 bg-green-50"
                            : entry.confidence === "Medium"
                              ? "text-yellow-700 bg-yellow-50"
                              : "text-red-700 bg-red-50"
                        }`}
                      >
                        {entry.confidence}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="mt-3 space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Recommended Level
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`level-badge ${trackClass} text-sm`}
                            >
                              {entry.recommended_level}
                            </span>
                            {level && (
                              <span className="text-sm text-gray-700">
                                {level.title} ({getTrackLabel(level.track)})
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Reasoning
                          </h4>
                          <p className="text-sm text-gray-700">
                            {entry.reasoning}
                          </p>
                        </div>

                        {entry.dimension_scores &&
                          entry.dimension_scores.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                Dimension Breakdown
                              </h4>
                              <div className="space-y-2">
                                {entry.dimension_scores.map((score, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span
                                      className={`level-badge ${trackClass} text-xs shrink-0 mt-0.5`}
                                    >
                                      {score.suggestedLevel}
                                    </span>
                                    <div>
                                      <span className="font-medium text-gray-800">
                                        {score.dimension}
                                      </span>
                                      <span className="text-gray-500">
                                        {" "}
                                        — {score.rationale}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                          Leveled by {entry.user_email} on{" "}
                          {formatDate(entry.created_at)}
                          {entry.source === "session" && " · session-only"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
