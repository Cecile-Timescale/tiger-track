"use client";

import { useState, useCallback } from "react";
import {
  LEVELS,
  DIMENSION_LABELS,
  getTrackLabel,
  getLevelsByTrack,
  type Level,
  type TrackType,
} from "@/lib/levelGuide";

const DIMENSION_KEYS = [
  "knowledgeExperience",
  "organizationalImpact",
  "innovationComplexity",
  "communicationInfluence",
  "leadershipTalentMgmt",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

interface AIComparison {
  summary: string;
  dimensions: Record<string, string>;
}

export default function LevelCompare() {
  const [leftCode, setLeftCode] = useState<string>("");
  const [rightCode, setRightCode] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [activeDimension, setActiveDimension] = useState<DimensionKey>(
    "knowledgeExperience"
  );

  // AI comparison state
  const [aiComparison, setAiComparison] = useState<AIComparison | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [comparedFor, setComparedFor] = useState<string>("");

  const leftLevel = LEVELS.find(
    (l) => l.code.toLowerCase() === leftCode.toLowerCase()
  );
  const rightLevel = LEVELS.find(
    (l) => l.code.toLowerCase() === rightCode.toLowerCase()
  );

  const trackGroups = [
    { label: "Individual Contributors", track: "ic" as TrackType },
    { label: "People Managers", track: "manager" as TrackType },
    { label: "Executives", track: "executive" as TrackType },
  ];

  const generateAIComparison = useCallback(async () => {
    if (!leftLevel || !rightLevel) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle || "General role",
          department,
          levelA: leftLevel.code,
          levelB: rightLevel.code,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate comparison");

      const data = await response.json();
      setAiComparison(data);
      setComparedFor(
        `${leftLevel.code} vs ${rightLevel.code}${jobTitle ? ` for ${jobTitle}` : ""}`
      );
    } catch {
      setAiError("Could not generate AI comparison. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  }, [leftLevel, rightLevel, jobTitle, department]);

  const renderSelect = (
    value: string,
    onChange: (val: string) => void,
    label: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAiComparison(null); // Reset AI when levels change
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none bg-white"
      >
        <option value="">Select a level...</option>
        {trackGroups.map((group) => (
          <optgroup key={group.track} label={group.label}>
            {getLevelsByTrack(group.track).map((level) => (
              <option key={level.code} value={level.code}>
                {level.code} — {level.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  const getTrackClass = (level: Level) =>
    level.track === "ic" ? "ic" : level.track === "manager" ? "mgr" : "exec";

  const renderLevelCard = (level: Level | undefined, side: "left" | "right") => {
    if (!level) {
      return (
        <div className="flex-1 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-400">
            Select a level to compare
          </p>
        </div>
      );
    }

    const dim = level.dimensions[activeDimension];
    const trackClass = getTrackClass(level);

    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Level header */}
        <div
          className={`px-4 py-3 border-b ${
            side === "left" ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`level-badge ${trackClass} text-lg px-3 py-0.5`}>
              {level.code}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {level.title}
              </div>
              <div className="text-xs text-gray-500">
                {getTrackLabel(level.track)}
              </div>
            </div>
          </div>
        </div>

        {/* Dimension content */}
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Criteria
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dim.criteria}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Expected Behaviors
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dim.expectedBehaviors}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Selection panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Compare Levels
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Select two levels to see a side-by-side comparison. Add a job title for
          AI-powered, role-specific difference analysis.
        </p>

        {/* Role context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                setAiComparison(null);
              }}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department / Team
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setAiComparison(null);
              }}
              placeholder="e.g., Engineering, Product, Sales"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(leftCode, setLeftCode, "Level A")}
          {renderSelect(rightCode, setRightCode, "Level B")}
        </div>
      </div>

      {/* Comparison view */}
      {(leftLevel || rightLevel) && (
        <>
          {/* Dimension tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex">
                {DIMENSION_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveDimension(key)}
                    className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeDimension === key
                        ? "text-[#0a0a0a] border-[#0a0a0a] bg-gray-50"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {DIMENSION_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Side by side cards */}
            <div className="p-4">
              <div className="flex gap-4">
                {renderLevelCard(leftLevel, "left")}
                {renderLevelCard(rightLevel, "right")}
              </div>
            </div>

            {/* AI insight for active dimension */}
            {aiComparison?.dimensions[activeDimension] && (
              <div className="mx-4 mb-4 bg-[#0a0a0a] rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5FF80" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-[#F5FF80] mb-1">
                      AI Analysis — {DIMENSION_LABELS[activeDimension]}
                      {jobTitle && ` for ${jobTitle}`}
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {aiComparison.dimensions[activeDimension]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI-powered Key Differences */}
          {leftLevel && rightLevel && (
            <>
              {/* Generate button when no AI comparison yet */}
              {!aiComparison && !isLoadingAI && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Key Differences: {leftLevel.code} vs {rightLevel.code}
                    {jobTitle && ` for ${jobTitle}`}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Generate an AI-powered analysis of what specifically changes between
                    these levels{jobTitle ? ` for a ${jobTitle} role` : ""}.
                  </p>
                  <button
                    onClick={generateAIComparison}
                    className="bg-[#0a0a0a] text-[#F5FF80] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    Generate Role-Specific Comparison
                  </button>
                </div>
              )}

              {/* Loading state */}
              {isLoadingAI && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing differences between {leftLevel.code} and {rightLevel.code}
                    {jobTitle ? ` for ${jobTitle}` : ""}...
                  </div>
                </div>
              )}

              {/* Error state */}
              {aiError && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                  <p className="text-sm text-red-700">{aiError}</p>
                </div>
              )}

              {/* AI comparison results */}
              {aiComparison && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-[#0a0a0a] px-6 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#F5FF80]">
                      Key Differences: {comparedFor}
                    </h3>
                    <button
                      onClick={generateAIComparison}
                      className="text-xs text-gray-400 hover:text-[#F5FF80] transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="p-6">
                    {/* Summary */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-5 pb-4 border-b border-gray-100">
                      {aiComparison.summary}
                    </p>

                    {/* Per-dimension differences */}
                    <div className="space-y-4">
                      {DIMENSION_KEYS.map((key) => {
                        const text = aiComparison.dimensions[key];
                        if (!text) return null;
                        return (
                          <div key={key} className="text-sm">
                            <span className="font-semibold text-gray-900">
                              {DIMENSION_LABELS[key]}:
                            </span>{" "}
                            <span className="text-gray-600 leading-relaxed">
                              {text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
