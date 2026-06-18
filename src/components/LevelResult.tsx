"use client";

import { useState, useEffect } from "react";
import { LEVELS, DIMENSION_LABELS, getTrackLabel } from "@/lib/levelGuide";
import { copyToClipboard, exportExecutiveSummaryPDF } from "@/lib/exportUtils";
import { getCompanyContext, CompanyContext } from "@/lib/companyContext";
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
  jobDescription?: string;
  onResultUpdate?: (newResult: LevelingResult) => void;
}

export default function LevelResult({ result, jobTitle, department, jobDescription, onResultUpdate }: LevelResultProps) {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [companyCtx, setCompanyCtx] = useState<CompanyContext>({ companySize: "", companyStage: "", constraints: "" });

  // Refinement state for insights
  const [showRefine, setShowRefine] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Question answers state
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [additionalContext, setAdditionalContext] = useState("");
  const [isRefiningLevel, setIsRefiningLevel] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  useEffect(() => {
    setCompanyCtx(getCompanyContext());
  }, []);

  // Reset question answers when result changes
  useEffect(() => {
    setQuestionAnswers({});
    setAdditionalContext("");
    setRefineError(null);
  }, [result]);

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
    if (result.questions && result.questions.length > 0) {
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
          companyContext: companyCtx,
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

  const handleRefineInsights = async () => {
    if (!aiInsights || !refineFeedback.trim()) return;
    setIsRefining(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResult: aiInsights,
          refinementFeedback: refineFeedback,
          companyContext: companyCtx,
          contextType: "insights",
        }),
      });
      if (!response.ok) throw new Error("Failed to refine insights");
      const data = await response.json();
      setAiInsights(data.refined);
      setRefineFeedback("");
      setShowRefine(false);
    } catch {
      setInsightsError("Could not refine the analysis. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  // Refine leveling based on question answers and/or additional context
  const handleRefineLeveling = async () => {
    const answeredQuestions = Object.entries(questionAnswers)
      .filter(([, a]) => a.trim())
      .map(([idx, a]) => ({
        question: result.questions[parseInt(idx)],
        answer: a.trim(),
      }));

    if (answeredQuestions.length === 0 && !additionalContext.trim()) return;

    setIsRefiningLevel(true);
    setRefineError(null);

    try {
      const response = await fetch("/api/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          department,
          jobDescription: jobDescription || "",
          questionAnswers: answeredQuestions,
          additionalContext: additionalContext.trim() || undefined,
          companyContext: companyCtx,
        }),
      });

      if (!response.ok) throw new Error("Failed to refine leveling");

      const data = await response.json();
      // Reset insights since the leveling changed
      setAiInsights(null);
      if (onResultUpdate) {
        onResultUpdate(data);
      }
    } catch {
      setRefineError("Could not refine the leveling. Please try again.");
    } finally {
      setIsRefiningLevel(false);
    }
  };

  const hasAnyInput = Object.values(questionAnswers).some(a => a.trim()) || additionalContext.trim();

  return (
    <div className="space-y-4">
      {/* Original Input — collapsible */}
      {jobDescription && (
        <details className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
          <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors">
            <span className="text-sm font-semibold text-gray-900">Your Input</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="px-6 pb-5 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Job Description / Responsibilities</p>
              <button
                onClick={() => copyToClipboard(jobDescription)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {jobDescription}
            </p>
          </div>
        </details>
      )}

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

      {/* Clarifying Questions — Interactive */}
      {result.questions && result.questions.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">
            Questions to Refine the Leveling
          </h3>
          <p className="text-xs text-amber-700 mb-4">
            Answer any of these to refine the level recommendation. None are mandatory — you can answer some, all, or add your own context below.
          </p>
          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <div key={i}>
                <label className="text-sm text-amber-900 flex gap-2 mb-1.5">
                  <span className="text-amber-500 font-mono text-xs mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <span>{q}</span>
                </label>
                <textarea
                  value={questionAnswers[i] || ""}
                  onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Your answer (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-amber-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
                />
              </div>
            ))}
          </div>

          {/* Additional context */}
          <div className="mt-5 pt-4 border-t border-amber-200">
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Additional context (optional)
            </label>
            <p className="text-xs text-amber-700 mb-2">
              Paste any extra information — a more detailed JD, org chart context, or clarifications.
            </p>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any additional context to help refine the leveling..."
              rows={3}
              className="w-full px-3 py-2 border border-amber-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
            />
          </div>

          {refineError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {refineError}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRefineLeveling}
              disabled={isRefiningLevel || !hasAnyInput}
              className="bg-[#0a0a0a] text-[#F5FF80] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRefiningLevel ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Re-analyzing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Refine Leveling
                </>
              )}
            </button>
          </div>
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

            {/* Refine section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {!showRefine ? (
                <button
                  onClick={() => setShowRefine(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Refine — something doesn&apos;t fit our setup
                </button>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Tell the AI what doesn&apos;t work for your company and it will adapt.
                  </p>
                  <textarea
                    value={refineFeedback}
                    onChange={(e) => setRefineFeedback(e.target.value)}
                    placeholder="What needs to change?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y mb-3"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setShowRefine(false); setRefineFeedback(""); }}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefineInsights}
                      disabled={isRefining || !refineFeedback.trim()}
                      className="px-4 py-1.5 bg-[#0a0a0a] text-[#F5FF80] text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isRefining ? (
                        <>
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Refining...
                        </>
                      ) : (
                        "Refine Analysis"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
