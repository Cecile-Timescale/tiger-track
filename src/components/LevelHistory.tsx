"use client";

import { useState, useEffect } from "react";
import { LEVELS, getTrackLabel } from "@/lib/levelGuide";

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
}

interface LevelHistoryProps {
  userEmail: string;
}

export default function LevelHistory({ userEmail }: LevelHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/history?userEmail=${encodeURIComponent(userEmail)}`
        );
        if (!response.ok) throw new Error("Failed to load history");
        const data = await response.json();
        setHistory(data.history || []);
      } catch {
        setError("Could not load leveling history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userEmail]);

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
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
        <h3 className="text-lg font-semibold text-gray-700">No history yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          Level a role to start building your audit trail.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Leveling History
            </h2>
            <p className="text-sm text-gray-500">
              {history.length} leveling decision{history.length !== 1 ? "s" : ""}{" "}
              recorded
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const trackClass = getTrackClass(entry.recommended_level);
            const level = LEVELS.find(
              (l) =>
                l.code.toLowerCase() === entry.recommended_level.toLowerCase()
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
