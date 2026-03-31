"use client";

import { useState } from "react";
import { LEVELS, getTrackLabel } from "@/lib/levelGuide";
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
  onRefine?: (additionalContext: string) => void;
  isRefining?: boolean;
}

export default function LevelResult({
  result,
  jobTitle,
  onRefine,
  isRefining,
}: LevelResultProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showRefinement, setShowRefinement] = useState(true);

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

  const hasAnswers = Object.values(answers).some((a) => a.trim());

  const handleRefine = () => {
    if (!onRefine || !hasAnswers) return;
    const contextParts = result.questions
      .map((q, i) => {
        const answer = answers[i]?.trim();
        if (!answer) return null;
        return `Q: ${q}\nA: ${answer}`;
      })
      .filter(Boolean);
    onRefine(
      "\n\nAdditional context provided to refine leveling:\n" +
        contextParts.join("\n\n")
    );
  };

  const buildPlainText = () => {
    let content = `TIGER DATA - JOB LEVELING ANALYSIS\n`;
    content += `${"=".repeat(50)}\n\n`;
    if (jobTitle) content += `Job Title: ${jobTitle}\n`;
    content += `Recommended Level: ${result.recommendedLevel}`;
    if (level) content += ` - ${level.title}`;
    content += `\n`;
    if (level) content += `Track: ${getTrackLabel(level.track)}\n`;
    content += `Confidence: ${result.confidence}\n\n`;
    content += `REASONING\n${"-".repeat(30)}\n${result.reasoning}\n\n`;
    content += `DIMENSION ANALYSIS\n${"-".repeat(30)}\n`;
    for (const score of result.dimensionScores) {
      content += `\n${score.dimension}: ${score.suggestedLevel}\n`;
      content += `${score.rationale}\n`;
    }
    return content;
  };

  const handleCopy = () => copyToClipboard(buildPlainText());

  const handleExportPDF = () => {
    exportExecutiveSummaryPDF({
      jobTitle: jobTitle || "Untitled Role",
      recommendedLevel: result.recommendedLevel,
      levelTitle: level?.title || "",
      track: level ? getTrackLabel(level.track) : "N/A",
      confidence: result.confidence,
      reasoning: result.reasoning,
      dimensionScores: result.dimensionScores,
    });
  };

  return (
    <div className="space-y-4 pb-16">
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

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Analysis Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {result.reasoning}
          </p>
        </div>
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">
                  {score.dimension}
                </span>
                <span className={`level-badge ${trackClass} text-xs`}>
                  {score.suggestedLevel}
                </span>
              </div>
              <p className="text-sm text-gray-500">{score.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Clarifying Questions */}
      {result.questions.length > 0 && (
        <div className="bg-[#F5FF80]/20 rounded-xl border border-[#F5FF80]/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Refine the Leveling
            </h3>
            <button
              onClick={() => setShowRefinement(!showRefinement)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showRefinement ? "Collapse" : "Expand"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Answer these questions to provide additional context. The analysis
            will re-run with your answers to give a more accurate level.
          </p>

          {showRefinement && (
            <div className="space-y-4">
              {result.questions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm text-gray-800 mb-1.5 font-medium">
                    <span className="text-[#FF5B29] font-mono text-xs mr-1.5">
                      {i + 1}.
                    </span>
                    {q}
                  </label>
                  <textarea
                    value={answers[i] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                    }
                    placeholder="Your answer..."
                    rows={2}
                    className="w-full px-3 py-2 border border-[#F5FF80]/60 bg-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none resize-y"
                  />
                </div>
              ))}

              {onRefine && (
                <button
                  onClick={handleRefine}
                  disabled={!hasAnswers || isRefining}
                  className="bg-[#1A1A1A] text-[#F5FF80] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRefining ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                      </svg>
                      Re-analyze with Additional Context
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sticky Export Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Level:{" "}
            <span className="text-gray-900">
              {result.recommendedLevel}
              {level ? ` — ${level.title}` : ""}
            </span>
          </span>
          <ExportBar
            onCopy={handleCopy}
            onExportPDF={handleExportPDF}
            copyLabel="Copy Result"
          />
        </div>
      </div>
    </div>
  );
}
