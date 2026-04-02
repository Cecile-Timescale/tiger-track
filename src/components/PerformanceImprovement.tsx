"use client";

import { useState } from "react";
import { LEVELS } from "@/lib/levelGuide";
import { copyToClipboard, exportToPDF } from "@/lib/exportUtils";
import ExportBar from "@/components/ExportBar";

interface GapItem {
  dimension: string;
  status: "Gap" | "On Track" | "Strength";
  currentState: string;
  targetState: string;
  actions: string[];
}

interface QuarterPlan {
  quarter: string;
  theme: string;
  goals: string[];
  deliverables: string[];
  successCriteria: string;
}

interface PerformancePlan {
  summary: string;
  gapAnalysis: GapItem[];
  developmentPlan: QuarterPlan[];
  keyMetrics: string[];
  managerActions: string[];
}

export default function PerformanceImprovement() {
  const [employeeName, setEmployeeName] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [department, setDepartment] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [gapDescription, setGapDescription] = useState("");
  const [strengths, setStrengths] = useState("");

  const [plan, setPlan] = useState<PerformancePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const levelCodes = LEVELS.map((l) => l.code);

  const handleGenerate = async () => {
    if (!employeeName || !currentRole || !currentLevel || !targetLevel || !gapDescription.trim()) {
      setError("Please fill in employee name, role, levels, and describe the gaps.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/performance-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          currentRole,
          department,
          currentLevel,
          targetLevel,
          gapDescription,
          strengths,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const data = await response.json();
      setPlan(data);
    } catch {
      setError("Could not generate performance plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const buildPlainText = () => {
    if (!plan) return "";
    let text = `TIGER DATA — PERFORMANCE IMPROVEMENT PLAN\n`;
    text += `${"═".repeat(55)}\n\n`;
    text += `Employee: ${employeeName}\n`;
    text += `Role: ${currentRole}\n`;
    if (department) text += `Department: ${department}\n`;
    text += `Current Level: ${currentLevel} → Target Level: ${targetLevel}\n\n`;
    text += `SUMMARY\n${"-".repeat(40)}\n${plan.summary}\n\n`;

    text += `GAP ANALYSIS\n${"-".repeat(40)}\n`;
    for (const gap of plan.gapAnalysis) {
      text += `\n${gap.dimension} [${gap.status}]\n`;
      text += `  Current: ${gap.currentState}\n`;
      text += `  Target: ${gap.targetState}\n`;
      if (gap.actions.length > 0) {
        text += `  Actions:\n`;
        gap.actions.forEach((a) => (text += `    - ${a}\n`));
      }
    }

    text += `\nDEVELOPMENT PLAN\n${"-".repeat(40)}\n`;
    for (const q of plan.developmentPlan) {
      text += `\n${q.quarter} — ${q.theme}\n`;
      text += `  Goals:\n`;
      q.goals.forEach((g) => (text += `    - ${g}\n`));
      text += `  Deliverables:\n`;
      q.deliverables.forEach((d) => (text += `    - ${d}\n`));
      text += `  Success Criteria: ${q.successCriteria}\n`;
    }

    if (plan.keyMetrics.length > 0) {
      text += `\nKEY METRICS\n${"-".repeat(40)}\n`;
      plan.keyMetrics.forEach((m) => (text += `  - ${m}\n`));
    }

    if (plan.managerActions.length > 0) {
      text += `\nMANAGER SUPPORT ACTIONS\n${"-".repeat(40)}\n`;
      plan.managerActions.forEach((a) => (text += `  - ${a}\n`));
    }

    return text;
  };

  const handleCopy = () => copyToClipboard(buildPlainText());

  const handleExportPDF = () => {
    if (!plan) return;

    const sections: { heading?: string; subheading?: string; body?: string; spacerAfter?: number }[] = [];

    sections.push({
      body: `Employee: ${employeeName}\nRole: ${currentRole}${department ? ` | ${department}` : ""}\nCurrent Level: ${currentLevel}  →  Target Level: ${targetLevel}`,
      spacerAfter: 2,
    });

    sections.push({ heading: "Summary", body: plan.summary, spacerAfter: 4 });

    sections.push({ heading: "Gap Analysis" });
    for (const gap of plan.gapAnalysis) {
      const statusTag = gap.status === "Gap" ? "⚠ GAP" : gap.status === "Strength" ? "✓ STRENGTH" : "● ON TRACK";
      sections.push({
        subheading: `${gap.dimension} — ${statusTag}`,
        body: `Current: ${gap.currentState}\nTarget: ${gap.targetState}${gap.actions.length > 0 ? `\nActions: ${gap.actions.join("; ")}` : ""}`,
      });
    }
    sections.push({ spacerAfter: 4 });

    sections.push({ heading: "Development Plan" });
    for (const q of plan.developmentPlan) {
      sections.push({
        subheading: `${q.quarter} — ${q.theme}`,
        body: `Goals: ${q.goals.join("; ")}\nDeliverables: ${q.deliverables.join("; ")}\nSuccess Criteria: ${q.successCriteria}`,
      });
    }
    sections.push({ spacerAfter: 4 });

    if (plan.keyMetrics.length > 0) {
      sections.push({
        heading: "Key Metrics",
        body: plan.keyMetrics.join("\n"),
      });
    }

    if (plan.managerActions.length > 0) {
      sections.push({
        heading: "Manager Support Actions",
        body: plan.managerActions.join("\n"),
      });
    }

    const slug = employeeName.replace(/\s+/g, "-").toLowerCase();
    exportToPDF(
      "Performance Improvement Plan",
      `${employeeName} — ${currentRole} (${currentLevel} → ${targetLevel})`,
      sections,
      `tiger-track-pip-${slug}.pdf`
    );
  };

  const statusColor = (status: string) => {
    if (status === "Gap") return "bg-red-100 text-red-700 border-red-200";
    if (status === "Strength") return "bg-green-100 text-green-700 border-green-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="space-y-6 pb-16">
      {!plan ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Performance Improvement Plan
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Describe the gaps you see and our AI will create a role-specific
              improvement plan using the Tiger Data leveling framework and deep
              knowledge of the role.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Employee info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g., Nicole Bahr"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role / Title
                </label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g., Staff Product Marketing Manager"
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
                  placeholder="e.g., Marketing, Product Marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                  >
                    <option value="">Select...</option>
                    {levelCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Level
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none"
                  >
                    <option value="">Select...</option>
                    {levelCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gap description — the key input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where are the gaps?
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Describe in your own words what this person needs to improve.
                Be as specific as possible — the AI will map your observations
                to the leveling dimensions and build a tailored plan.
              </p>
              <textarea
                value={gapDescription}
                onChange={(e) => setGapDescription(e.target.value)}
                placeholder="e.g., Nicole struggles with cross-functional influence — she tends to stay within her own team and doesn't proactively drive alignment with Product and Sales. Her messaging work is strong but she needs to own the go-to-market strategy end-to-end rather than waiting for direction. She also needs to develop more junior team members instead of doing everything herself..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
              />
            </div>

            {/* Optional strengths */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Known strengths (optional)
              </label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="e.g., Excellent writer, deep product knowledge, strong relationships with customers, very reliable on deadlines..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F5FF80]/40 focus:border-[#F5FF80]/60 outline-none resize-y"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-[#0a0a0a] text-[#F5FF80] px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating role-specific improvement plan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  Generate AI Performance Improvement Plan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employeeName}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentRole}{department ? ` — ${department}` : ""}
                </p>
              </div>
              <button
                onClick={() => setPlan(null)}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Current Level</p>
                <p className="text-sm font-semibold text-gray-900">{currentLevel}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Target Level</p>
                <p className="text-sm font-semibold text-gray-900">{targetLevel}</p>
              </div>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{plan.summary}</p>
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Analysis</h3>
            <div className="space-y-4">
              {plan.gapAnalysis.map((gap, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">{gap.dimension}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor(gap.status)}`}>
                      {gap.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Current State</p>
                      <p className="text-sm text-gray-700">{gap.currentState}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Target State</p>
                      <p className="text-sm text-gray-700">{gap.targetState}</p>
                    </div>
                  </div>
                  {gap.actions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Recommended Actions</p>
                      <ul className="space-y-1">
                        {gap.actions.map((action, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-[#F5FF80] font-bold mt-0.5">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Development Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.developmentPlan.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-[#F5FF80] flex items-center justify-center text-xs font-bold">
                      {q.quarter}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{q.theme}</h4>
                  </div>

                  <div className="space-y-3 mt-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Goals</p>
                      <ul className="space-y-1">
                        {q.goals.map((g, i) => (
                          <li key={i} className="text-gray-600 flex gap-2">
                            <span className="text-[#F5FF80] font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Deliverables</p>
                      <ul className="space-y-1">
                        {q.deliverables.map((d, i) => (
                          <li key={i} className="text-gray-600 flex gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Success looks like:</span> {q.successCriteria}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics + Manager Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.keyMetrics.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics to Track</h3>
                <ul className="space-y-2">
                  {plan.keyMetrics.map((m, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-[#0a0a0a] font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.managerActions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Manager Support Actions</h3>
                <ul className="space-y-2">
                  {plan.managerActions.map((a, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-[#F5FF80] font-bold">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Fixed Export Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] px-6 py-3 z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {employeeName} — <span className="text-gray-900">{currentLevel} → {targetLevel}</span>
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
