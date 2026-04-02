"use client";

import { useState } from "react";
import { LEVELS, DIMENSION_LABELS, getTrackLabel } from "@/lib/levelGuide";
import { copyToClipboard, exportExecutiveSummaryPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";

interface LevelingResult {
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

interface LevelResultProps {
  result: LevelingResult;
  jobTitle?: string;
  department?: string;
}

export default function LevelResult({ result, jobTitle, department }: LevelResultProps) {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const level = LEVELS.find(
    (l) => l.code.toLowerCase() === result.recommendedLevel.toLowerCase()
  );
  const trackClass =
    level?.track === "ic" ? "ic" : level?.track === "manager" ? "mgr" : "exec";

  const confidenceColor =
    result.confidence === "High"
      ? "text-green-700 bg-green-50"
      : result.confidence === "Medium"
        ? "text-yellow-700 bg-yellow-50"
        : "text-red-700 bg-red-50";

  // Build plain-text version for clipboard
  const buildTextContent = (includeInsights = false) => {
    let text = `TIGER DATA — JOB LEVELING ANALYSIS\n`;
    text += `${"═".repeat(50)}\n\n`;
    if (jobTitle) text += `Role: ${jobTitle}\n`;
    if (department) text += `Department: ${department}\n`;
    text += `Recommended Level: ${result.recommendedLevel}`;
    if (level) text += ` — ${level.title}`;
    text += `\n`;
    if (level) text += `Track: ${getTrackLabel(level.track)}\n`;
    text += `Confidence: ${result.confidence}\n\n`;
    text += `SUMMARY\n${"-".repeat(40)}\n${result.reasoning}\n\n`;
    text += `DIMENSION ASSESSMENT\n${"-".repeat(40)}\n`;
    for (const score of result.dimensionScores) {
      text += `\n${score.dimension} [${score.suggestedLevel}]\n`;
      text += `${score.rationale}\n`;
    }
    if (result.questions.length > 0) {
      text += `\nCLARIFYING QUESTIONS\n${"-".repeat(40)}\n`;
      result.questions.forEach((q, i) => {
        text += `${i + 1}. ${q}\n`;
      });
    }
    if (includeInsights && aiInsights) {
      text += `\nAI ANALYSIS — PROMOTION READINESS\n${"-".repeat(40)}\n`;
      text += aiInsights;
    }
    return text;
  };

  const handleCopy = async () => {
    return copyToClipboard(buildTextContent(false));
  };

  const handleCopyAll = async () => {
    return copyToClipboard(buildTextContent(true));
  };

  const handleExportPDF = () => {
    if (!level) return;
    exportExecutiveSummaryPDF({
      jobTitle: jobTitle || "Untitled Role",
      recommendedLevel: result.recommendedLevel,
      levelTitle: level.title,
      track: getTrackLabel(level.track),
      confidence: result.confidence,
      reasoning: result.reasoning,
      dimensionScores: result.dimensionScores,
      aiInsights: aiInsights || undefined,
    });
  };

  const generateInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          department,
          recommendedLevel: result.recommendedLevel,
          levelTitle: level?.title || "",
          track: level ? getTrackLabel(level.track) : "",
          reasoning: result.reasoning,
          dimensionScores: result.dimensionScores,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate insights");

      const data = await response.json();
      setAiInsights(data.insights);
    } catch {
      setInsightsError("Could not generate AI insights. Please try again.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Result Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Level
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className={`level-badge ${trackClass} text-xl px-4 py-1`}>
                {result.recommendedLevel}
              </span>
              {level && (
                <span className="text-gray-600 font-medium">{level.title}</span>
              )}
            </div>
            {level && (
              <p className="text-sm text-gray-500 mt-1">
                {getTrackLabel(level.track)}
              </p>
            )}
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${confidenceColor}`}
          >
            {result.confidence} Confidence
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Analysis Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {result.reasoning}
          </p>
        </div>

        {/* Export Bar */}
        <ExportBar
          onCopy={handleCopy}
          onCopyAll={aiInsights ? handleCopyAll : undefined}
          onExportPDF={handleExportPDF}
          copyLabel="Copy Summary"
          copyAllLabel="Copy All (with AI Analysis)"
        />
      </div>

      {/* Dimension Scores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dimension Breakdown
        </h3>
        <div className="space-y-3">
          {result.dimensionScores.map((score, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {score.dimension}
                </span>
                <span className={`level-badge ${trackClass} text-xs`}>
                  {score.suggestedLevel}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{score.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clarifying Questions */}
      {result.questions.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">
            Questions to Refine the Leveling
          </h3>
          <p className="text-xs text-amber-700 mb-3">
            Answering these questions could help refine the level recommendation:
          </p>
          <ul className="space-y-2">
            {result.questions.map((q, i) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span className="text-amber-400 font-mono text-xs mt-0.5">
                  {i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Insights — Promotion Readiness */}
      {!aiInsights && !isLoadingInsights && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Want a deeper analysis?
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Generate role-specific promotion readiness guidance, development actions,
            and next-level expectations tailored to this {jobTitle || "role"}.
          </p>
          <button
            onClick={generateInsights}
            className="bg-[#0a0a0a] text-[#F5FF80] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Generate AI Analysis &amp; Promotion Readiness
          </button>
        </div>
      )}

      {isLoadingInsights && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating role-specific AI analysis for {jobTitle || "this role"}...
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This uses Claude&apos;s deep knowledge of this role to provide tailored guidance.
          </p>
        </div>
      )}

      {insightsError && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-700">{insightsError}</p>
        </div>
      )}

      {aiInsights && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#0a0a0a] px-6 py-3">
            <h3 className="text-sm font-semibold text-[#F5FF80]">
              AI Analysis — Promotion Readiness for {jobTitle || "this role"}
            </h3>
          </div>
          <div className="p-6">
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: aiInsights
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/^### (.*$)/gm, '<h4 class="text-sm font-semibold text-gray-900 mt-4 mb-2">$1</h4>')
                  .replace(/^## (.*$)/gm, '<h3 class="text-base font-semibold text-gray-900 mt-5 mb-2">$1</h3>')
                  .replace(/^- (.*$)/gm, '<div class="flex gap-2 ml-2"><span class="text-gray-400">•</span><span>$1</span></div>')
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
