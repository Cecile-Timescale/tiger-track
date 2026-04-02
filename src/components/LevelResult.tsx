"use client";

import { LEVELS, DIMENSION_LABELS, getTrackLabel } from "@/lib/levelGuide";

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

  const handleDownload = () => {
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

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leveling-analysis-${result.recommendedLevel}${jobTitle ? `-${jobTitle.replace(/\s+/g, "-").toLowerCase()}` : ""}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${confidenceColor}`}
            >
              {result.confidence} Confidence
            </span>
            <button
              onClick={handleDownload}
              className="text-sm text-[#0a0a0a] hover:text-[#333] font-medium flex items-center gap-1 border border-[#0a0a0a] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
          </div>
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
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Questions to Refine the Leveling
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            Answering these questions could help refine the level recommendation:
          </p>
          <ul className="space-y-2">
            {result.questions.map((q, i) => (
              <li key={i} className="text-sm text-blue-800 flex gap-2">
                <span className="text-blue-400 font-mono text-xs mt-0.5">
                  {i + 1}.
                </span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
