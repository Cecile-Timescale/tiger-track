"use client";

import { useState } from "react";
import LevelResult from "@/components/LevelResult";
import type { JobContext, LevelingResult } from "@/app/page";

interface LevelRoleProps {
  jobContext: JobContext;
  onJobContextChange: (ctx: JobContext) => void;
  levelingResult: LevelingResult | null;
  onLevelingResult: (result: LevelingResult | null) => void;
}

const LEVELING_QUESTIONS = [
  {
    id: "impact",
    title: "What level of business impact does this role need to own?",
    subtitle:
      "Is this role executing within a team, owning a function, or shaping company-wide outcomes? (e.g., delivering on defined goals vs. setting strategy across teams/functions)",
  },
  {
    id: "complexity",
    title: "How much ambiguity and problem complexity will this person face?",
    subtitle:
      "Are problems well-defined with known solutions, or open-ended and cross-functional? Will they improve existing systems or design entirely new ones?",
  },
  {
    id: "influence",
    title: "What kind of influence is required to succeed?",
    subtitle:
      "Do they primarily collaborate within a team, or need to influence senior leaders / execs / external stakeholders? How critical is cross-functional alignment to success?",
  },
  {
    id: "ownership",
    title: "What level of ownership and autonomy is expected?",
    subtitle:
      "Will this person follow direction, operate independently, or set direction for others? Are they responsible for execution, strategy, or both?",
  },
  {
    id: "leadership",
    title: "What leadership or talent responsibility is required (if any)?",
    subtitle:
      "Are they mentoring others, managing a team, or building a leadership bench? Is success individual output or achieved through others?",
  },
];

export default function LevelRole({
  jobContext,
  onJobContextChange,
  levelingResult: result,
  onLevelingResult: setResult,
}: LevelRoleProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const updateContext = (field: string, value: string) => {
    onJobContextChange({ ...jobContext, [field]: value });
  };

  const updateAnswer = (id: string, value: string) => {
    onJobContextChange({
      ...jobContext,
      levelingAnswers: { ...jobContext.levelingAnswers, [id]: value },
    });
  };

  const handleAnalyze = async () => {
    if (!jobContext.jobDescription.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Build additional context from leveling answers
    const answeredQuestions = LEVELING_QUESTIONS.filter(
      (q) => jobContext.levelingAnswers[q.id]?.trim()
    );
    let additionalContext = "";
    if (answeredQuestions.length > 0) {
      additionalContext =
        "\n\nAdditional context from the hiring manager:\n" +
        answeredQuestions
          .map(
            (q) =>
              `Q: ${q.title}\nA: ${jobContext.levelingAnswers[q.id].trim()}`
          )
          .join("\n\n");
    }

    try {
      const response = await fetch("/api/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobContext.jobTitle,
          department: jobContext.department,
          jobDescription: jobContext.jobDescription + additionalContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job description");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during analysis"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Level a Role
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Paste or write a job description and our AI will analyze it against the
          Tiger Data Level Guide to recommend the appropriate level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobContext.jobTitle}
              onChange={(e) => updateContext("jobTitle", e.target.value)}
              placeholder="e.g. Senior Data Engineer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department / Team
            </label>
            <input
              type="text"
              value={jobContext.department}
              onChange={(e) => updateContext("department", e.target.value)}
              placeholder="e.g. Engineering, Data Platform"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description / Responsibilities
          </label>
          <textarea
            value={jobContext.jobDescription}
            onChange={(e) => updateContext("jobDescription", e.target.value)}
            placeholder="Paste the full job description or list the key responsibilities, qualifications, and expectations for this role..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none resize-y"
          />
        </div>

        {/* Optional Leveling Questions */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-[#FF5B29] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showQuestions ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Leveling guidance questions
            <span className="text-xs text-gray-400 font-normal">
              (optional — helps refine the recommendation)
            </span>
          </button>

          {showQuestions && (
            <div className="mt-4 space-y-5 pl-1 border-l-2 border-[#F5FF80] ml-1">
              {LEVELING_QUESTIONS.map((q) => (
                <div key={q.id} className="pl-4">
                  <label className="block text-sm font-medium text-gray-800 mb-0.5">
                    {q.title}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">{q.subtitle}</p>
                  <textarea
                    value={jobContext.levelingAnswers[q.id] || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Your answer (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none resize-y bg-gray-50"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobContext.jobDescription.trim()}
          className="bg-[#1A1A1A] text-[#F5FF80] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAnalyzing ? (
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
              Analyzing...
            </>
          ) : (
            "Analyze & Level Role"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-500 mt-1">
            Make sure you have configured your ANTHROPIC_API_KEY in the
            environment variables.
          </p>
        </div>
      )}

      {result && (
        <LevelResult
          result={result}
          jobTitle={jobContext.jobTitle}
          isRefining={isRefining}
          onRefine={async (additionalContext: string) => {
            setIsRefining(true);
            setError(null);
            try {
              // Build existing leveling answers context
              const answeredQuestions = LEVELING_QUESTIONS.filter(
                (q) => jobContext.levelingAnswers[q.id]?.trim()
              );
              let existingContext = "";
              if (answeredQuestions.length > 0) {
                existingContext =
                  "\n\nAdditional context from the hiring manager:\n" +
                  answeredQuestions
                    .map(
                      (q) =>
                        `Q: ${q.title}\nA: ${jobContext.levelingAnswers[q.id].trim()}`
                    )
                    .join("\n\n");
              }

              const response = await fetch("/api/level", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jobTitle: jobContext.jobTitle,
                  department: jobContext.department,
                  jobDescription:
                    jobContext.jobDescription +
                    existingContext +
                    additionalContext,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to re-analyze job description");
              }

              const data = await response.json();
              setResult(data);
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "An error occurred during re-analysis"
              );
            } finally {
              setIsRefining(false);
            }
          }}
        />
      )}
    </div>
  );
}
