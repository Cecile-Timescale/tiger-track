"use client";

import { useState } from "react";
import LevelResult from "@/components/LevelResult";
import CompanyContextBanner from "@/components/CompanyContextBanner";

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

interface LevelRoleProps {
  userEmail: string;
}

// The 5 leveling guide questions
const LEVELING_QUESTIONS = [
  {
    id: "impact",
    question: "What level of business impact does this role need to own?",
    subQuestions: [
      "Is this role executing within a team, owning a function, or shaping company-wide outcomes?",
      "Delivering on defined goals vs. setting strategy across teams/functions?",
    ],
  },
  {
    id: "complexity",
    question: "How much ambiguity and problem complexity will this person face?",
    subQuestions: [
      "Are problems well-defined with known solutions, or open-ended and cross-functional?",
      "Will they improve existing systems or design entirely new ones?",
    ],
  },
  {
    id: "influence",
    question: "What kind of influence is required to succeed?",
    subQuestions: [
      "Do they primarily collaborate within a team, or need to influence senior leaders / execs / external stakeholders?",
      "How critical is cross-functional alignment to success?",
    ],
  },
  {
    id: "autonomy",
    question: "What level of ownership and autonomy is expected?",
    subQuestions: [
      "Will this person follow direction, operate independently, or set direction for others?",
      "Are they responsible for execution, strategy, or both?",
    ],
  },
  {
    id: "leadership",
    question: "What leadership or talent responsibility is required (if any)?",
    subQuestions: [
      "Are they mentoring others, managing a team, or building a leadership bench?",
      "Is success individual output or achieved through others?",
    ],
  },
];

export default function LevelRole({ userEmail }: LevelRoleProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LevelingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Leveling guide question answers
  const [guideAnswers, setGuideAnswers] = useState<Record<string, string>>({});
  const [showGuideQuestions, setShowGuideQuestions] = useState(false);

  const updateGuideAnswer = (id: string, value: string) => {
    setGuideAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const hasAnyGuideAnswer = Object.values(guideAnswers).some((a) => a.trim());
  const hasInput = jobDescription.trim() || hasAnyGuideAnswer;

  // Build the guide answers text for the API
  const buildGuideAnswersText = () => {
    const answered = LEVELING_QUESTIONS.filter((q) => guideAnswers[q.id]?.trim());
    if (answered.length === 0) return "";

    let text = "";
    for (const q of answered) {
      text += `${q.question}\n`;
      text += `Answer: ${guideAnswers[q.id].trim()}\n\n`;
    }
    return text;
  };

  const saveToHistory = async (data: LevelingResult) => {
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          jobTitle,
          department,
          jobDescription,
          recommendedLevel: data.recommendedLevel,
          confidence: data.confidence,
          reasoning: data.reasoning,
          dimensionScores: data.dimensionScores,
          questions: data.questions,
        }),
      });

      if (response.ok) {
        setSaveStatus("Saved to history");
      } else {
        setSaveStatus("Could not save to history");
      }
    } catch {
      setSaveStatus("Could not save to history");
    }
  };

  const handleAnalyze = async () => {
    if (!hasInput) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSaveStatus(null);

    try {
      const guideAnswersText = buildGuideAnswersText();

      const response = await fetch("/api/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          department,
          jobDescription: jobDescription || "(No job description provided — use the leveling guide answers below to determine level)",
          additionalContext: guideAnswersText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job description");
      }

      const data = await response.json();
      setResult(data);

      // Auto-save to leveling history
      saveToHistory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during analysis"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <CompanyContextBanner />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Level a Role
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Use a job description, the leveling guide questions, or both to determine the appropriate level.
          None of the fields are mandatory — use whichever combination works best.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
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
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department or team"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description / Responsibilities
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description or list the key responsibilities, qualifications, and expectations for this role..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
          />
        </div>

        {/* Leveling Guide Questions — collapsible */}
        <div className="mb-5">
          <button
            onClick={() => setShowGuideQuestions(!showGuideQuestions)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
              hasAnyGuideAnswer
                ? "bg-[#0a0a0a] text-[#F5FF80]"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="font-medium">
                Leveling Guide Questions
              </span>
              {hasAnyGuideAnswer && (
                <span className="text-xs opacity-70">
                  ({Object.values(guideAnswers).filter((a) => a.trim()).length} answered)
                </span>
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showGuideQuestions ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showGuideQuestions && (
            <div className="mt-3 space-y-5 border border-gray-200 rounded-xl p-5 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Answer any of these to help determine the right level. None are mandatory — use alongside or instead of the job description.
              </p>

              {LEVELING_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {q.question}
                  </label>
                  <div className="mb-2">
                    {q.subQuestions.map((sq, i) => (
                      <p key={i} className="text-xs text-gray-500 leading-relaxed">
                        {sq}
                      </p>
                    ))}
                  </div>
                  <textarea
                    value={guideAnswers[q.id] || ""}
                    onChange={(e) => updateGuideAnswer(q.id, e.target.value)}
                    placeholder="Your answer (optional)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !hasInput}
            className="bg-[#0a0a0a] text-[#F5FF80] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          {saveStatus && (
            <span className="text-xs text-green-600">{saveStatus}</span>
          )}
        </div>
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
          jobTitle={jobTitle}
          department={department}
          jobDescription={jobDescription}
          onResultUpdate={(newResult) => {
            setResult(newResult);
            saveToHistory(newResult);
          }}
        />
      )}
    </div>
  );
}
