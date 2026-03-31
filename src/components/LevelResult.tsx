"use client";

import { LEVELS, DIMENSION_LABELS, getTrackLabel } from "@/lib/levelGuide";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
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
}

export default function LevelResult({ result, jobTitle }: LevelResultProps) {
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
    if (result.questions.length > 0) {
      content += `\nCLARIFYING QUESTIONS\n${"-".repeat(30)}\n`;
      result.questions.forEach((q, i) => {
        content += `${i + 1}. ${q}\n`;
      });
    }
    return content;
  };

  const handleCopy = () => copyToClipboard(buildPlainText());

  const handleExportPDF = () => {
    const sections: { heading?: string; subheading?: string; body?: string; spacerAfter?: number }[] = [
      {
        heading: `Recommended Level: ${result.recommendedLevel}${level ? ` — ${level.title}` : ""}`,
        body: `Track: ${level ? getTrackLabel(level.track) : "N/A"}  |  Confidence: ${result.confidence}`,
        spacerAfter: 2,
      },
      { subheading: "Analysis Summary", body: result.reasoning, spacerAfter: 4 },
      { heading: "Dimension Breakdown" },
      ...result.dimensionScores.map((score) => ({
        subheading: `${score.dimension}  →  ${score.suggestedLevel}`,
        body: score.rationale,
        spacerAfter: 2,
      })),
    ];
    if (result.questions.length > 0) {
      sections.push({ heading: "Clarifying Questions" });
      result.questions.forEach((q, i) => {
        sections.push({ body: `${i + 1}. ${q}`, spacerAfter: 1 });
      });
    }
    const slug = jobTitle
      ? jobTitle.replace(/\s+/g, "-").toLowerCase()
      : result.recommendedLevel;
    exportToPDF(
      `Job Leveling Analysis${jobTitle ? `: ${jobTitle}` : ""}`,
      `Level ${result.recommendedLevel} • ${result.confidence} Confidence`,
      sections,
      `tiger-track-analysis-${slug}.pdf`
    );
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

      {/* Clarifying Questions */}
      {result.questions.length > 0 && (
        <div className="bg-[#F5FF80]/20 rounded-xl border border-[#F5FF80]/50 p-6">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">
            Questions to Refine the Leveling
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Answering these questions could help refine the level recommendation:
          </p>
          <ul className="space-y-2">
            {result.questions.map((q, i) => (
              <li key={i} className="text-sm text-gray-800 flex gap-2">
                <span className="text-[#FF5B29] font-mono text-xs mt-0.5">
                  {i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sticky Export Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Level: <span className="text-gray-900">{result.recommendedLevel}{level ? ` — ${level.title}` : ""}</span>
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
