"use client";

import { useState } from "react";
import { LEVELS } from "@/lib/levelGuide";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";

type RatingLevel = "Below" | "At Level" | "Above" | null;

interface DimensionRating {
  name: string;
  current: RatingLevel;
  notes: string;
}

interface GapAnalysisResult {
  dimension: string;
  current: RatingLevel;
  expected: RatingLevel;
  gap: string;
  gapScore: number;
}

interface DevelopmentGoal {
  quarter: string;
  goals: string[];
  deliverables: string[];
  milestones: string[];
}

interface PerformanceData {
  employeeName: string;
  currentRole: string;
  currentLevel: string;
  targetLevel: string;
  dimensions: DimensionRating[];
  gapAnalysis: GapAnalysisResult[];
  developmentPlan: DevelopmentGoal[];
}

const DIMENSION_NAMES = [
  "Knowledge & Experience",
  "Organizational Impact",
  "Innovation & Complexity",
  "Communication & Influence",
  "Leadership & Talent Management",
];

const RATING_COLORS = {
  Below: "bg-red-100 text-red-700 border-red-300",
  "At Level": "bg-green-100 text-green-700 border-green-300",
  Above: "bg-blue-100 text-blue-700 border-blue-300",
  null: "bg-gray-100 text-gray-600 border-gray-300",
};

const RATING_BAR_COLORS = {
  Below: "bg-red-500",
  "At Level": "bg-green-500",
  Above: "bg-blue-500",
  null: "bg-gray-300",
};

export default function PerformanceImprovement() {
  const [employeeName, setEmployeeName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [dimensions, setDimensions] = useState<DimensionRating[]>(
    DIMENSION_NAMES.map((name) => ({
      name,
      current: null,
      notes: "",
    }))
  );
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const levelCodes = LEVELS.map((l) => l.code);

  const handleRatingChange = (index: number, rating: RatingLevel) => {
    const updated = [...dimensions];
    updated[index].current = updated[index].current === rating ? null : rating;
    setDimensions(updated);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updated = [...dimensions];
    updated[index].notes = notes;
    setDimensions(updated);
  };

  const calculateGapAnalysis = (): GapAnalysisResult[] => {
    const ratingMap = {
      Below: 0,
      "At Level": 1,
      Above: 2,
      null: -1,
    };

    const currentScore = ratingMap[currentLevel as keyof typeof ratingMap] || -1;
    const targetScore = ratingMap[targetLevel as keyof typeof ratingMap] || -1;

    return dimensions.map((dim) => {
      const currentRatingScore =
        ratingMap[dim.current as keyof typeof ratingMap] || -1;
      const gapScore = targetScore - currentRatingScore;

      let gap = "On Track";
      if (gapScore > 1) {
        gap = "Significant Gap";
      } else if (gapScore === 1) {
        gap = "Minor Gap";
      } else if (gapScore === 0) {
        gap = "At Target";
      } else if (gapScore < 0) {
        gap = "Exceeds Target";
      }

      return {
        dimension: dim.name,
        current: dim.current,
        expected: (targetLevel as RatingLevel) || "At Level",
        gap,
        gapScore: Math.max(0, gapScore),
      };
    });
  };

  const generateDevelopmentPlan = (): DevelopmentGoal[] => {
    const gaps = calculateGapAnalysis();
    const hasSignificantGaps = gaps.some((g) => g.gapScore > 0);

    if (!hasSignificantGaps) {
      return [
        {
          quarter: "Q1",
          goals: ["Maintain current performance level"],
          deliverables: ["Quarterly performance review"],
          milestones: ["Mid-quarter check-in"],
        },
        {
          quarter: "Q2",
          goals: ["Continue skill development"],
          deliverables: ["Project completion"],
          milestones: ["End of quarter assessment"],
        },
        {
          quarter: "Q3",
          goals: ["Explore advanced responsibilities"],
          deliverables: ["Leadership opportunity"],
          milestones: ["Leadership evaluation"],
        },
        {
          quarter: "Q4",
          goals: ["Consolidate gains and plan next year"],
          deliverables: ["Annual performance review"],
          milestones: ["Year-end planning session"],
        },
      ];
    }

    const topGaps = gaps
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 3);

    return [
      {
        quarter: "Q1",
        goals: [
          `Build foundation in ${topGaps[0]?.dimension || "key area"}`,
          "Establish baseline metrics and goals",
        ],
        deliverables: [
          "Training completion",
          "Development plan documentation",
        ],
        milestones: ["30-day progress review", "Training kickoff"],
      },
      {
        quarter: "Q2",
        goals: [
          `Strengthen ${topGaps[1]?.dimension || "performance"} skills`,
          "Apply learning in real-world scenarios",
        ],
        deliverables: [
          "Project with applied learning",
          "Mid-year feedback review",
        ],
        milestones: ["Skill demonstration", "Peer feedback session"],
      },
      {
        quarter: "Q3",
        goals: [
          `Master ${topGaps[2]?.dimension || "advanced topics"}`,
          "Lead initiatives demonstrating growth",
        ],
        deliverables: ["Leadership initiative", "Coaching others"],
        milestones: ["Initiative completion", "Mentorship setup"],
      },
      {
        quarter: "Q4",
        goals: ["Consolidate improvements", "Plan promotion readiness"],
        deliverables: ["Year-end assessment", "Next-year plan"],
        milestones: ["Promotion readiness review", "Level-up evaluation"],
      },
    ];
  };

  const handleGenerateAnalysis = async () => {
    if (!employeeName || !currentRole || !currentLevel || !targetLevel) {
      setError("Please fill in all required fields");
      return;
    }

    const allRatingsProvided = dimensions.every((d) => d.current !== null);
    if (!allRatingsProvided) {
      setError("Please rate all dimensions");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const gapAnalysis = calculateGapAnalysis();
      const developmentPlan = generateDevelopmentPlan();

      const data: PerformanceData = {
        employeeName,
        currentRole,
        currentLevel,
        targetLevel,
        dimensions,
        gapAnalysis,
        developmentPlan,
      };

      setPerformanceData(data);
    } catch (err) {
      setError("Failed to generate analysis. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildPlainText = () => {
    if (!performanceData) return "";

    let content = `TIGER DATA - PERFORMANCE IMPROVEMENT PLAN\n`;
    content += `${"=".repeat(60)}\n\n`;
    content += `Employee: ${performanceData.employeeName}\n`;
    content += `Current Role: ${performanceData.currentRole}\n`;
    content += `Current Level: ${performanceData.currentLevel}\n`;
    content += `Target Level: ${performanceData.targetLevel}\n\n`;

    content += `GAP ANALYSIS\n${"-".repeat(40)}\n`;
    for (const analysis of performanceData.gapAnalysis) {
      content += `\n${analysis.dimension}\n`;
      content += `  Current: ${analysis.current}\n`;
      content += `  Expected: ${analysis.expected}\n`;
      content += `  Status: ${analysis.gap}\n`;
    }

    content += `\n\nDEVELOPMENT PLAN\n${"-".repeat(40)}\n`;
    for (const plan of performanceData.developmentPlan) {
      content += `\n${plan.quarter}\n`;
      content += `  Goals:\n`;
      plan.goals.forEach((g) => (content += `    - ${g}\n`));
      content += `  Deliverables:\n`;
      plan.deliverables.forEach((d) => (content += `    - ${d}\n`));
      content += `  Milestones:\n`;
      plan.milestones.forEach((m) => (content += `    - ${m}\n`));
    }

    return content;
  };

  const handleCopy = () => copyToClipboard(buildPlainText());

  const handleExportPDF = () => {
    if (!performanceData) return;

    const sections = [
      {
        heading: "Employee Information",
        body: `Name: ${performanceData.employeeName}\nRole: ${performanceData.currentRole}\nCurrent Level: ${performanceData.currentLevel}\nTarget Level: ${performanceData.targetLevel}`,
      },
      {
        heading: "Gap Analysis Summary",
        body: performanceData.gapAnalysis
          .map((g) => `${g.dimension}: ${g.gap}`)
          .join("\n"),
      },
    ];

    performanceData.developmentPlan.forEach((plan) => {
      sections.push({
        heading: `${plan.quarter} Plan`,
        body: `Goals: ${plan.goals.join("; ")}\nDeliverables: ${plan.deliverables.join("; ")}\nMilestones: ${plan.milestones.join("; ")}`,
      });
    });

    exportToPDF(
      "Performance Improvement Plan",
      `${performanceData.employeeName} - Development Path`,
      sections,
      `performance-plan-${performanceData.employeeName.replace(/\s+/g, "-")}.pdf`
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {!performanceData ? (
        // Input Form
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Performance Improvement Assessment
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Employee Info Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g., Sarah Chen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Role / Title
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
                >
                  <option value="">Select level...</option>
                  {levelCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Level
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none"
                >
                  <option value="">Select level...</option>
                  {levelCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimension Ratings Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Dimension Ratings
              </h3>
              <div className="space-y-4">
                {dimensions.map((dim, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-800">
                        {dim.name}
                      </label>
                      <div className="flex gap-2 mt-2">
                        {(["Below", "At Level", "Above"] as RatingLevel[]).map(
                          (rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRatingChange(idx, rating)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                dim.current === rating
                                  ? RATING_COLORS[rating]
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {rating}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <textarea
                      value={dim.notes}
                      onChange={(e) => handleNotesChange(idx, e.target.value)}
                      placeholder="Add notes/observations (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#F5FF80] focus:border-[#1A1A1A] outline-none resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerateAnalysis}
                disabled={isLoading}
                className="flex-1 bg-[#1A1A1A] text-[#F5FF80] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A2A2A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
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
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                    Generate Gap Analysis & Development Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Results View
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {performanceData.employeeName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {performanceData.currentRole}
                </p>
              </div>
              <button
                onClick={() => setPerformanceData(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Current Level</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {performanceData.currentLevel}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Target Level</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {performanceData.targetLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gap Analysis
            </h3>

            <div className="space-y-4">
              {performanceData.gapAnalysis.map((analysis, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-800">
                      {analysis.dimension}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        analysis.gap === "On Track"
                          ? "bg-green-100 text-green-700"
                          : analysis.gap === "At Target"
                            ? "bg-blue-100 text-blue-700"
                            : analysis.gap === "Exceeds Target"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {analysis.gap}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          RATING_BAR_COLORS[
                            analysis.current as keyof typeof RATING_BAR_COLORS
                          ] || RATING_BAR_COLORS.null
                        }`}
                        style={{
                          width: analysis.current === "Below" ? "33%" :
                                 analysis.current === "At Level" ? "66%" :
                                 analysis.current === "Above" ? "100%" : "0%"
                        }}
                      />
                    </div>
                  </div>

                  {/* Current vs Expected */}
                  <div className="flex gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <span className={`ml-1 font-medium ${
                        RATING_COLORS[analysis.current as keyof typeof RATING_COLORS] || RATING_COLORS.null
                      }`}>
                        {analysis.current || "Not rated"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected:</span>
                      <span className="ml-1 font-medium text-green-700">
                        At Level
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Development Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceData.developmentPlan.map((plan, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF5B29] text-white flex items-center justify-center text-xs font-bold">
                      {plan.quarter.charAt(1)}
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {plan.quarter}
                    </h4>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Goals
                      </p>
                      <ul className="space-y-1">
                        {plan.goals.map((goal, i) => (
                          <li key={i} className="text-gray-600 flex gap-2">
                            <span className="text-[#FF5B29] font-bold">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Deliverables
                      </p>
                      <ul className="space-y-1">
                        {plan.deliverables.map((del, i) => (
                          <li key={i} className="text-gray-600 flex gap-2">
                            <span className="text-[#F5FF80] font-bold">✓</span>
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Milestones
                      </p>
                      <ul className="space-y-1">
                        {plan.milestones.map((milestone, i) => (
                          <li key={i} className="text-gray-600 flex gap-2">
                            <span className="text-[#FF5B29]">→</span>
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {performanceData.employeeName} —{" "}
                <span className="text-gray-900">
                  {performanceData.currentLevel} → {performanceData.targetLevel}
                </span>
              </span>
              <ExportBar
                onCopy={handleCopy}
                onExportPDF={handleExportPDF}
                copyLabel="Copy Plan"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
