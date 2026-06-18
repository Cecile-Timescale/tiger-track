"use client";

import { useCallback } from "react";
import {
  LEVELS,
  DIMENSION_LABELS,
  getTrackLabel,
  getLevelsByTrack,
  type Level,
  type TrackType,
} from "@/lib/levelGuide";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";
import {
  useSessionState,
  type AIComparison,
  type DimensionKey,
} from "@/lib/sessionState";

const DIMENSION_KEYS = [
  "knowledgeExperience",
  "organizationalImpact",
  "innovationComplexity",
  "communicationInfluence",
  "leadershipTalentMgmt",
] as const;

export default function LevelCompare() {
  const { levelCompare, setLevelCompare } = useSessionState();
  const {
    leftCode,
    rightCode,
    jobTitle,
    department,
    activeDimension,
    aiComparison,
    isLoadingAI,
    aiError,
    comparedFor,
    refinements,
    showRefine,
    refineFeedback,
    isRefining,
    refineError,
  } = levelCompare;

  const setField = <K extends keyof typeof levelCompare>(
    key: K,
    value: (typeof levelCompare)[K]
  ) => setLevelCompare((prev) => ({ ...prev, [key]: value }));

  // Changing the levels or context invalidates the previous AI run AND any
  // refinements that were tied to it.
  const resetComparison = () =>
    setLevelCompare((prev) => ({
      ...prev,
      aiComparison: null,
      refinements: [],
      refineFeedback: "",
      showRefine: false,
      refineError: null,
      aiError: null,
      comparedFor: "",
    }));

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

  const buildComparisonText = () => {
    if (!leftLevel || !rightLevel) return "";
    let text = `TIGER DATA — LEVEL COMPARISON\n`;
    text += `${"═".repeat(50)}\n\n`;
    if (jobTitle) text += `Role: ${jobTitle}\n`;
    if (department) text += `Department: ${department}\n`;
    text += `Comparing: ${leftLevel.code} (${leftLevel.title}) vs ${rightLevel.code} (${rightLevel.title})\n\n`;

    for (const key of DIMENSION_KEYS) {
      const label = DIMENSION_LABELS[key];
      text += `${label}\n${"-".repeat(40)}\n`;
      text += `${leftLevel.code}:\n  Criteria: ${leftLevel.dimensions[key].criteria}\n  Behaviors: ${leftLevel.dimensions[key].expectedBehaviors}\n`;
      text += `${rightLevel.code}:\n  Criteria: ${rightLevel.dimensions[key].criteria}\n  Behaviors: ${rightLevel.dimensions[key].expectedBehaviors}\n`;
      if (aiComparison?.dimensions[key]) {
        text += `AI Analysis: ${aiComparison.dimensions[key]}\n`;
      }
      text += `\n`;
    }

    if (aiComparison?.summary) {
      text += `OVERALL SUMMARY\n${"-".repeat(40)}\n${aiComparison.summary}\n\n`;
    }

    if (refinements.length > 0) {
      text += `REFINEMENT CONTEXT APPLIED\n${"-".repeat(40)}\n`;
      refinements.forEach((r, i) => {
        text += `${i + 1}. ${r.feedback}\n`;
      });
      text += `\n`;
    }

    return text;
  };

  const handleCopy = async () => copyToClipboard(buildComparisonText());

  const handleExportPDF = () => {
    if (!leftLevel || !rightLevel) return;

    const sections: { heading?: string; subheading?: string; body?: string; spacerAfter?: number }[] = [];

    // Header info
    if (jobTitle) {
      sections.push({ body: `Role: ${jobTitle}${department ? ` | Department: ${department}` : ""}` });
    }
    sections.push({
      body: `Comparing ${leftLevel.code} (${leftLevel.title}) vs ${rightLevel.code} (${rightLevel.title})`,
      spacerAfter: 4,
    });

    // Per-dimension comparison
    for (const key of DIMENSION_KEYS) {
      sections.push({ heading: DIMENSION_LABELS[key] });
      sections.push({
        subheading: `${leftLevel.code} — ${leftLevel.title}`,
        body: `Criteria: ${leftLevel.dimensions[key].criteria}\nExpected Behaviors: ${leftLevel.dimensions[key].expectedBehaviors}`,
      });
      sections.push({
        subheading: `${rightLevel.code} — ${rightLevel.title}`,
        body: `Criteria: ${rightLevel.dimensions[key].criteria}\nExpected Behaviors: ${rightLevel.dimensions[key].expectedBehaviors}`,
      });
      if (aiComparison?.dimensions[key]) {
        sections.push({
          subheading: "AI Analysis",
          body: aiComparison.dimensions[key],
        });
      }
      sections.push({ spacerAfter: 4 });
    }

    if (aiComparison?.summary) {
      sections.push({ heading: "Overall Summary", body: aiComparison.summary });
    }

    if (refinements.length > 0) {
      sections.push({
        heading: "Refinement Context Applied",
        body: refinements.map((r, i) => `${i + 1}. ${r.feedback}`).join("\n"),
      });
    }

    const title = `Level Comparison: ${leftLevel.code} vs ${rightLevel.code}`;
    const subtitle = jobTitle ? `${jobTitle}${department ? ` — ${department}` : ""}` : "";
    const slug = `${leftLevel.code}-vs-${rightLevel.code}${jobTitle ? `-${jobTitle.replace(/\s+/g, "-").toLowerCase()}` : ""}`;
    exportToPDF(title, subtitle, sections, `tiger-track-compare-${slug}.pdf`);
  };

  // Initial AI comparison (also reused for "Regenerate"). Resets refinement
  // history because we're starting from a fresh analysis.
  const generateAIComparison = useCallback(async () => {
    if (!leftLevel || !rightLevel) return;

    setLevelCompare((prev) => ({
      ...prev,
      isLoadingAI: true,
      aiError: null,
      refinements: [],
      refineFeedback: "",
      showRefine: false,
      refineError: null,
    }));

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

      const data: AIComparison = await response.json();
      setLevelCompare((prev) => ({
        ...prev,
        aiComparison: data,
        comparedFor: `${leftLevel.code} vs ${rightLevel.code}${jobTitle ? ` for ${jobTitle}` : ""}`,
      }));
    } catch {
      setLevelCompare((prev) => ({
        ...prev,
        aiError: "Could not generate AI comparison. Please try again.",
      }));
    } finally {
      setLevelCompare((prev) => ({ ...prev, isLoadingAI: false }));
    }
  }, [leftLevel, rightLevel, jobTitle, department, setLevelCompare]);

  // Refine the existing comparison using the user's additional context. Sends
  // the original AI result + accumulated refinement notes + the new feedback
  // to /api/refine; replaces the displayed comparison with the result so the
  // exported PDF/clipboard reflects the final, refined version.
  const handleRefine = useCallback(async () => {
    if (!aiComparison || !refineFeedback.trim()) return;

    const newFeedback = refineFeedback.trim();

    setLevelCompare((prev) => ({
      ...prev,
      isRefining: true,
      refineError: null,
    }));

    try {
      // Combine prior refinement notes with the new feedback so the model
      // accumulates context rather than forgetting earlier corrections.
      const combinedFeedback = [
        ...refinements.map((r) => r.feedback),
        newFeedback,
      ]
        .map((f, i) => `${i + 1}. ${f}`)
        .join("\n");

      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResult: aiComparison,
          refinementFeedback: combinedFeedback,
          contextType: "compare",
        }),
      });

      if (!response.ok) throw new Error("Failed to refine comparison");

      const data = await response.json();
      const refined = (data?.refined ?? null) as AIComparison | null;
      if (!refined || typeof refined !== "object" || !refined.dimensions) {
        throw new Error("Refined response did not include a comparison");
      }

      setLevelCompare((prev) => ({
        ...prev,
        aiComparison: refined,
        refinements: [
          ...prev.refinements,
          { feedback: newFeedback, appliedAt: new Date().toISOString() },
        ],
        refineFeedback: "",
        showRefine: false,
      }));
    } catch (err) {
      console.error("Refine compare error", err);
      setLevelCompare((prev) => ({
        ...prev,
        refineError: "Could not refine the comparison. Please try again.",
      }));
    } finally {
      setLevelCompare((prev) => ({ ...prev, isRefining: false }));
    }
  }, [aiComparison, refineFeedback, refinements, setLevelCompare]);

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
          resetComparison();
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
                setField("jobTitle", e.target.value);
                resetComparison();
              }}
              placeholder="Job title"
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
                setField("department", e.target.value);
                resetComparison();
              }}
              placeholder="Department or team"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(leftCode, (val) => setField("leftCode", val), "Level A")}
          {renderSelect(rightCode, (val) => setField("rightCode", val), "Level B")}
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
                    onClick={() => setField("activeDimension", key as DimensionKey)}
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
                      {refinements.length > 0 && (
                        <span className="ml-2 text-xs text-gray-400 font-normal">
                          (refined {refinements.length}×)
                        </span>
                      )}
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

                    {/* Applied refinement context */}
                    {refinements.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Refinement context applied
                        </p>
                        <ol className="list-decimal list-inside space-y-1">
                          {refinements.map((r, i) => (
                            <li key={i} className="text-xs text-gray-600 leading-relaxed">
                              {r.feedback}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refine panel — only when there's a comparison to refine */}
              {aiComparison && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {!showRefine ? (
                    <button
                      onClick={() => setField("showRefine", true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Refine with additional context — something doesn&apos;t fit
                    </button>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Refine this comparison
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Add details the AI may have missed — scope of the role, regional
                        responsibilities, ownership of specific systems, anything that
                        changes the assumptions. The analysis will be re-run with the new
                        context and earlier refinements still applied. The exported version
                        will reflect the latest refined comparison.
                      </p>
                      <textarea
                        value={refineFeedback}
                        onChange={(e) => setField("refineFeedback", e.target.value)}
                        placeholder="e.g. This Controller role only owns finance for one geography, not multi-region. Don't assume IPO-readiness scope."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setLevelCompare((prev) => ({
                              ...prev,
                              showRefine: false,
                              refineFeedback: "",
                              refineError: null,
                            }));
                          }}
                          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRefine}
                          disabled={isRefining || !refineFeedback.trim()}
                          className="px-4 py-2 bg-[#0a0a0a] text-[#F5FF80] text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isRefining ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Re-running analysis...
                            </>
                          ) : (
                            "Apply & Re-analyze"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {refineError && (
                    <p className="text-xs text-red-600 mt-3">{refineError}</p>
                  )}
                </div>
              )}

              {/* Export bar — shown when both levels selected */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <ExportBar
                  onCopy={handleCopy}
                  onExportPDF={handleExportPDF}
                  copyLabel="Copy Comparison"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
